import { observable, runInAction, action } from 'mobx';
import { RequestStatus, IOpsVehicle, DBVehicleStatus, IChangingVehicleDetails } from '../../common/lib/types';
import { Api } from '../lib/api';
import Geohash from 'ngeohash';
import { LatLng } from 'react-native-maps';
import BuildConfig from '../../common/lib/build-config';
import Geocoder from 'react-native-geocoder';
import { Logger } from '../../common/lib/logger';
import { Subject, from } from 'rxjs';
import { timeout, first, map, mergeAll } from 'rxjs/operators';

interface IVehicleStoreError {
  vehicleId: string;
  status: DBVehicleStatus;
}

export class VehicleStore {
  private lock: boolean = false;
  @observable public requestStatus: RequestStatus = RequestStatus.done;
  @observable public vehicles: { [key: string]: IOpsVehicle } = {};
  @observable public error: IVehicleStoreError | null;

  constructor() {
    this.getVehicles = this.getVehicles.bind(this);
    this.error = null;
    Geocoder.apiKey = BuildConfig.googleMapsApiKey;
  }

  private removeNonExistVehiclesFromStore(newVehicleIds: string[]) {
    const oldVehicleIds = Object.keys(this.vehicles);
    oldVehicleIds.filter(id => {
      if (!newVehicleIds.includes(id)) {
        delete this.vehicles[id];
      }
    });
  }

  private async loadFormattedAddress(vehicle: IOpsVehicle) {
    try {
      if (vehicle) {
        const addressData = await Geocoder.geocodePosition({
          lat: vehicle.location.latitude,
          lng: vehicle.location.longitude,
        });
        const addressComponent = addressData[0].formattedAddress;
        runInAction(() => {
          this.vehicles[vehicle.id].formattedAddress = addressComponent;
        });
      }
    } catch (err) {
      this.requestStatus = RequestStatus.error;
    }
  }

  private isVehicleChanged(newVehicle: IOpsVehicle) {
    const oldVehicle = this.vehicles[newVehicle.id];
    if (newVehicle && oldVehicle) {
      const properties = Object.keys(newVehicle);
      const feedbacksIndex = properties.indexOf('feedbacks');
      properties.splice(feedbacksIndex, 1);
      const isEqual = properties.find(key => oldVehicle[key] && oldVehicle[key] !== newVehicle[key]);
      return !isEqual;
    }
    return true;
  }

  @action('update vehicles in store')
  private updateVehicleInStore(vehicle: any) {
    if (!!this.vehicles[vehicle.id] && !!this.vehicles[vehicle.id].subscription && vehicle.status) {
      this.vehicles[vehicle.id].subscription.next(vehicle);
    }
    if (this.isVehicleChanged(vehicle)) {
      this.vehicles[vehicle.id] = { ...this.vehicles[vehicle.id], ...vehicle, location: Geohash.decode(vehicle.geoHash) };
    }
  }

  private async isJobFailed(jobId: string) {
    try {
      const response = await Api.getInstance().isJobFailed(jobId);
      if (!!response) {
        return response.failed;
      }
    } catch (err) {
      Logger.log(err);
      this.requestStatus = RequestStatus.error;
    }
  }

  @action('set change status error')
  public setChangeStatusError = (vehicleId: string, status: DBVehicleStatus) => {
    this.requestStatus = RequestStatus.error;
    this.error = {
      vehicleId,
      status,
    };
  }

  @action('delete subscription')
  public deleteSubscription = (vehicleId: string) => {
    this.vehicles[vehicleId].subscription = undefined;
  }

  @action('dismiss change status error')
  public dismissChangeStatusError = () => {
    if (this.error) {
      const vehicleId = this.error.vehicleId;
      this.deleteSubscription(vehicleId);
      this.error = null;
    }
  }

  @action('update vehicles data')
  public async startVehiclesDataPolling() {
    const vehiclesDataSubscription = await Api.getInstance().pollVehiclesData();
    vehiclesDataSubscription.subscribe(async (response: Response | null) => {
      if (response) {
        const data = await response.json();
        if (data && data.vehicles) {
          runInAction(() => {
            const vehicles = data.vehicles;
            const vehicleIds = vehicles.map((vehicle: { id: any; }) => vehicle.id);
            this.removeNonExistVehiclesFromStore(vehicleIds);
            vehicles.forEach((vehicleDetails: IChangingVehicleDetails) => {
              let vehicle: any = this.vehicles[vehicleDetails.id];
              if (!vehicle) {
                vehicle = { ...vehicleDetails };
              } else {
                vehicle.status = vehicleDetails.status;
                vehicle.inTransition = vehicleDetails.inTransition;
                vehicle.geoHash = vehicleDetails.geoHash;
                vehicle.batteryLevel = vehicleDetails.batteryLevel;
              }
              this.updateVehicleInStore(vehicle);
            });
          });
        }
      }
    });
  }

  @action('get vehicles')
  public async getVehicles() {
    this.requestStatus = RequestStatus.pending;
    try {
      const response = await Api.getInstance().getVehicles();
      runInAction(() => {
        if (!!response && !!response.vehicles) {
          const vehicles = response.vehicles;
          const vehicleIds = vehicles.map((vehicle: { id: any; }) => vehicle.id);
          this.removeNonExistVehiclesFromStore(vehicleIds);
          vehicles.forEach((vehicle: IOpsVehicle) => {
            this.updateVehicleInStore(vehicle);
          });
          this.startVehiclesDataPolling();
        }
        this.requestStatus = RequestStatus.done;
      });
    } catch (err) {
      this.requestStatus = RequestStatus.error;
    }
  }

  public watchStatus(id: string, vehicleStatus: string, jobId: string) {
    const subscription = new Subject<IChangingVehicleDetails>()
      .pipe(
        map(async (vehicle: IChangingVehicleDetails) => {
          if (vehicle.status === DBVehicleStatus.onmission) {
            throw { msg: 'vehicle is in ride' };
          } else if (vehicle.status !== vehicleStatus && await this.isJobFailed(jobId)) {
            throw { msg: 'vehicle status change failed' };
          } else {
            return vehicle;
          }
        }))
      .pipe(promise => from(promise), mergeAll())
      .pipe(first(vehicle => vehicle.status === vehicleStatus))
      .pipe(timeout(40000));
    runInAction(() => {
      this.vehicles[id].subscription = subscription;
    });
    return subscription;
  }

  @action('update vehicle status')
  public async updateVehicleStatus(vehicleId: string, status: DBVehicleStatus) {
    try {
      const response = await Api.getInstance().updateVehicleStatus(vehicleId, status);
      const jobId = response.job_id;
      return jobId;
    } catch (err) {
      Logger.log(err);
      const vehicle = this.vehicles[vehicleId];
      if (vehicle.subscription) {
        vehicle.subscription.error('error');
      }
    }
  }

  public async loadMoreFeedbacksForVehicle(vehicleId: string) {
    if (this.lock) {
      return;
    }
    this.lock = true;
    try {
      const vehicle = this.vehicles[vehicleId];
      if (vehicle) {
        let lastFeedbackTime = new Date();
        if (vehicle.feedbacks && vehicle.feedbacks.length) {
          const lastFeedback = vehicle.feedbacks[vehicle.feedbacks.length - 1];
          lastFeedbackTime = lastFeedback.startTime;
        } else {
          vehicle.feedbacks = [];
        }
        const data = await Api.getInstance().getMoreFeedbacks(vehicleId, lastFeedbackTime);
        if (data.feedbacks.length) {
          const feedbacks = data.feedbacks.map((feedback: any) => ({
            feedbackTags: feedback.feedbackTags,
            rating: Number(feedback.rating),
            lastParkingImageUrl: feedback.parkingImageUrl,
            startTime: new Date(feedback.startTime),
            endTime: new Date(feedback.endTime),
          }));
          runInAction(() => {
            vehicle.feedbacks = vehicle.feedbacks.concat(feedbacks);
            this.vehicles[vehicleId].feedbacks = vehicle.feedbacks;
          });
        }
      }
      this.lock = false;
    } catch (err) {
      Logger.log(err);
      this.lock = false;
      this.requestStatus = RequestStatus.error;
    }
  }

  public async getVehicleFullDetails(vehicleId: string) {
    const vehicle = this.vehicles[vehicleId];
    if (!vehicle) {
      return;
    }
    try {
      this.loadMoreFeedbacksForVehicle(vehicleId);
      const vehicleDetails: IOpsVehicle = await Api.getInstance().getVehicleFullDetails(vehicleId);
      this.loadFormattedAddress(vehicle);
      this.updateVehicleInStore(vehicleDetails);
    } catch (err) {
      this.requestStatus = RequestStatus.error;
    }
  }

  @action('set vehicle wait for status change')
  public setVehicleWaitingForStatusChange(vehicleId: string, isWaiting: boolean) {
    if (!!this.vehicles[vehicleId]) {
      this.vehicles[vehicleId].isWaitingForStatusChange = isWaiting;
    }
  }

  @action('logOut VehicleStore')
  public logOut() {
    this.vehicles = {};
    this.error = null;
  }
}

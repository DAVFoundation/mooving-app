import { observable, runInAction, action } from 'mobx';
import { Api } from '../lib/api';
import { uploadImage, expectedImageUrl } from '../../common/lib/cloudinary';
import { LatLonSpherical as LatLon } from 'geodesy';
import { RequestStatus, ISupportInfo } from '../../common/lib/types';
import { Subscription, interval, from } from 'rxjs';
import * as uuid from 'uuid';
import AsyncStorage from '@react-native-community/async-storage';
import { Logger } from '../../common/lib/logger';
import { map, mergeAll } from 'rxjs/operators';
import firebase from 'react-native-firebase';
import Geolocation from 'react-native-geolocation-service';
import { RIDE_STATE } from '../constants/ride';

export enum PaymentMethod {
  dav = 'dav',
  fiat = 'fiat',
  undefined = 'undefined',
}

export class RideStore {

  private rideSubscription: Subscription | undefined;
  private geolocationWatchId: number | undefined;
  @observable public supportInfo: ISupportInfo | undefined;
  @observable public distance: number = 0;
  @observable public startTime: Date | undefined;
  @observable public startTimeRideForTimer: Date | undefined;
  @observable public endTime: Date | undefined;
  @observable public price: number | undefined;
  @observable public currencyCode: string | undefined;
  @observable public requestStatus: RequestStatus | undefined;
  @observable public vehicleId: string | undefined;
  @observable public riderId: string | undefined;
  @observable public batteryLevel: number | undefined;
  @observable public davAwarded: number | undefined;
  @observable public rideState: RIDE_STATE = RIDE_STATE.NONE;
  @observable public davRate: number | undefined;

  constructor() {
    this.clearStoreData = this.clearStoreData.bind(this);
    this.unlockVehicle = this.unlockVehicle.bind(this);
    this.lockVehicle = this.lockVehicle.bind(this);
    this.rate = this.rate.bind(this);
  }

  private async waitForActiveRide() {
    try {
      const ride = await Api.getInstance().getActiveRide(true);
      if (!!ride && ride.startTime) {
        await AsyncStorage.setItem('ride_distance', '0');
        this.init(ride);
      }
    } catch (err) {
      Logger.error('err_get_active_ride', err);
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  private async endRide() {
    try {
      if (!this.startTime) {
        throw new Error('startTime is undefined');
      }
      const ride = await Api.getInstance().getRideSummary(this.vehicleId, this.startTime.toISOString());
      const rideSubscription: Subscription = ride.subscribe(async (response: Response | null) => {
        if (response) {
          const data = await response.json();
          if (data && data.endTime) {
            runInAction(() => {
              this.endTime = new Date(data.endTime);
              this.price = parseFloat(data.price);
              this.currencyCode = data.currencyCode;
              this.davRate = Number(data.davRate);
              this.davAwarded = parseFloat(data.davAwarded);
              this.requestStatus = RequestStatus.done;
              if (data.davAwarded > 0) {
                firebase.analytics().logEvent('dav_reward_earned');
              }
            });
            if (this.geolocationWatchId) {
              Geolocation.clearWatch(this.geolocationWatchId);
            }
            return rideSubscription.unsubscribe();
          }
        }
      });
    } catch (err) {
      Logger.error('err_end_ride', err);
      return;
    }
  }

  @action('get support information')
  private async getSupportInformation(vehicleId: string) {
    try {
      const { supportInfo } = await Api.getInstance().getSupportInfo(vehicleId);
      runInAction(() => {
        this.supportInfo = supportInfo;
      });
    } catch (err) {
      Logger.error('err_get_support_information', err);
    }
  }

  @action('Set ride payment')
  public async setRidePayment(method: PaymentMethod) {
    try {
      this.requestStatus = RequestStatus.pending;
      await Api.getInstance().setPaymentMethodForRide(this.vehicleId, this.startTime, method);
      runInAction(() => {
        if (method === PaymentMethod.dav) {
          if (this.price && this.davRate) {
            this.davAwarded = -(this.price / this.davRate);
          } else {
            this.davAwarded = 0;
          }
        }
        this.requestStatus = RequestStatus.done;
      });
    } catch (err) {
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  @action('Set Ride State')
  public setRideState(state: RIDE_STATE) {
    this.rideState = state;
  }

  @action('reset request status')
  public resetRequestStatus() {
    this.requestStatus = RequestStatus.done;
  }

  @action('lock vehicle')
  public async lockVehicle(parkingImageUri: string) {
    this.requestStatus = RequestStatus.pending;
    if (!!this.rideSubscription) {
      this.rideSubscription.unsubscribe();
    }
    try {
      const imageUuid = uuid.v4();
      const imageUrl: string = expectedImageUrl(imageUuid);
      await AsyncStorage.setItem('imageUuid', imageUuid);
      await AsyncStorage.setItem('parkingImageUri', parkingImageUri);
      this.uploadImageAndRemoveFromStorage(imageUuid, parkingImageUri);
      await Api.getInstance().lockVehicle(imageUrl);
      await this.endRide();
    } catch (err) {
      Logger.error('err_lock_vehicle', err);
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  @action('init ride if exist')
  public initRideIfExist(rideWithStatus: any) {
    const rideStatusCode = rideWithStatus.statusCode;
    if (!!rideWithStatus.ride && rideWithStatus.ride.startTime) {
      this.init(rideWithStatus.ride);
    }
  }

  @action('init')
  public init = (rideData: any) => {
    this.vehicleId =  rideData.vehicleId;
    this.riderId = rideData.riderId;
    this.getSupportInformation(rideData.vehicleId);
    this.startTime = new Date(rideData.startTime);
    this.startTimeRideForTimer = new Date(new Date().getTime() - rideData.durationMS);
    this.batteryLevel = rideData.lastBatteryPercentage || rideData.startBatteryPercentage;
    this.distance = Number(rideData.distance);
  }

  @action('unlock vehicle')
  public async unlockVehicle(vehicleCode: string) {
    // This should be a workaround for when UI calls this multiple times for a single unlock.
    if (this.requestStatus === RequestStatus.pending) {
      return;
    }
    this.requestStatus = RequestStatus.pending;
    try {
      const formattedCode = vehicleCode.substring(vehicleCode.lastIndexOf('/') + 1);
      await Api.getInstance().unlockVehicle(formattedCode);
      await this.waitForActiveRide();
      runInAction(() => {
        this.requestStatus = RequestStatus.done;
      });
    } catch (err) {
      Logger.error('err_unlock_vehicle', err);
      this.setRideState(RIDE_STATE.NONE);
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  @action('clear store data')
  public async clearStoreData() {
    this.distance = 0;
    this.startTime = undefined;
    this.endTime = undefined;
    this.requestStatus = undefined;
    this.vehicleId = undefined;
    this.price = undefined;
    this.batteryLevel = undefined;
  }

  public async rate(rating: number, tags: string[]) {
    if (!this.startTime) {
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
      return;
    }
    try {
      const rideData = {
        rating,
        tags,
        startTime: this.startTime.toISOString(),
        vehicleId: this.vehicleId,
      };
      await Api.getInstance().rate(rideData);
      runInAction(() => {
        this.requestStatus = RequestStatus.done;
      });
    } catch (err) {
      Logger.error('err_rate', err);
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  public async uploadImageAndRemoveFromStorage(imageUuid: string, parkingImageUri: string) {
    try {
      await uploadImage(imageUuid, parkingImageUri);
      await AsyncStorage.removeItem('imageUuid');
      await AsyncStorage.removeItem('parkingImageUri');
    } catch (error) {
      Logger.error('err_upload_image', error);
    }
  }
}

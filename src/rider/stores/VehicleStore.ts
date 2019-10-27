import {
  observable,
  runInAction,
  action,
  autorun,
  IReactionDisposer,
} from 'mobx';
import { RequestStatus, IVehicle, DBVehicleStatus } from '../../common/lib/types';
import { Api } from '../lib/api';
import { Subscription, from, timer } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';
import Geohash from 'ngeohash';
import { LocationStore } from '../../common/stores/LocationStore';
import { LatLonSpherical as LatLon } from 'geodesy';
import { Logger } from '../../common/lib/logger';
import { Buffer } from 'buffer';

const HASH_PREFIX_LENGTH = 6;
const FIRST_RESULTS_INTERVAL = 2000;
const RESULTS_INTERVAL = 5000;

export enum VehicleErrorMessages {
  none = 'none',
  invalidQr = 'invalidQr',
  batteryLevel = 'batteryLevel',
  maintenance = 'maintenance',
  default = 'default',
}

export class VehicleStore {
  private vehiclesSubscription: Subscription | undefined;
  private disposer: IReactionDisposer;
  private locationStore: LocationStore;
  private mapCenterHashPrefix: string = '';
  @observable public requestStatus: RequestStatus = RequestStatus.done;
  @observable public errorMessage: VehicleErrorMessages = VehicleErrorMessages.none;
  @observable public vehicles: { [key: string]: IVehicle } = {};

  constructor(locationStore: LocationStore) {
    this.locationStore = locationStore;
    this.getVehicle = this.getVehicle.bind(this);
    this.clearData = this.clearData.bind(this);
    this.dismissError = this.dismissError.bind(this);
    this.getVehicleByQrCode = this.getVehicleByQrCode.bind(this);
    this.startSearchVehiclesForCurrentLocation = this.startSearchVehiclesForCurrentLocation.bind(this);
    this.searchForVehicles = this.searchForVehicles.bind(this);
    this.stopSearchForVehicles = this.stopSearchForVehicles.bind(this);
    this.sendMainMapAnalytics = this.sendMainMapAnalytics.bind(this);
    this.disposer = autorun(reaction => {
      if (this.locationStore.mapCenterHash) {
        const mapCenterHashPrefix = this.locationStore.mapCenterHash
          .substring(0, HASH_PREFIX_LENGTH);
        if (mapCenterHashPrefix !== this.mapCenterHashPrefix) {
          this.startSearchVehiclesForCurrentLocation();
        }
      }
    });
  }

  private getCoordinate(locationHash: string) {
    return Geohash.decode(locationHash);
  }

  private startSearchVehiclesForCurrentLocation() {
    const mapCenterHash = this.locationStore.mapCenterHash;
    if (mapCenterHash) {
      this.mapCenterHashPrefix = mapCenterHash
        .substring(0, HASH_PREFIX_LENGTH);
      this.searchForVehicles(mapCenterHash, FIRST_RESULTS_INTERVAL);
    }
  }

  @action('search vehicles')
  private searchForVehicles(locationHash: string, intervalTime: number) {
    if (!!this.vehiclesSubscription) {
      this.vehiclesSubscription.unsubscribe();
      this.vehiclesSubscription = undefined;
    }
    const accuracyLevel = this.locationStore.accuracyLevel;
    try {
      const availableVehicles = timer(0, intervalTime)
        .pipe(map(() => Api.getInstance().getVehicles(locationHash, accuracyLevel)))
        .pipe(promise => from(promise), mergeAll());
      this.vehiclesSubscription = availableVehicles.subscribe(
        data => {
          const dataIsContainVehicles = data && data.vehicles && data.vehicles.length;
          if (dataIsContainVehicles) {
            this.handleVehicleSearchResult(data.vehicles, locationHash, accuracyLevel);
            if (this.vehiclesSubscription && intervalTime === FIRST_RESULTS_INTERVAL) {
              this.vehiclesSubscription.unsubscribe();
              this.searchForVehicles(locationHash, RESULTS_INTERVAL);
            }
          }
        },
        err => Logger.error('err_subscribe_search_vehicles', err));
    } catch (err) {
      Logger.error('err_searching_vehicles', err);
      return;
    }
  }

  private handleVehicleSearchResult = (vehicles: IVehicle[], locationHash: string, accuracyLevel: number) => {
    vehicles.forEach(
      (vehicle: IVehicle) => {
        vehicle.location = this.getCoordinate(vehicle.geoHash);
        this.vehicles[vehicle.qrCode] = vehicle;
      });
    const resultsQrCodes = vehicles.map((vehicle: IVehicle) => vehicle.qrCode);
    const searchAreas = Geohash.neighbors(locationHash.substring(0, accuracyLevel));
    searchAreas.push(locationHash.substring(0, accuracyLevel));
    runInAction(() => {
      Object.keys(this.vehicles).forEach(
        qrCode => {
          const vehicle = this.vehicles[qrCode];
          if (!resultsQrCodes.includes(qrCode) && searchAreas.includes(vehicle.geoHash.substring(0, accuracyLevel))) {
            delete this.vehicles[qrCode];
          }
        });
      // For making sure the vehicles will be rendered again
      this.vehicles = { ...this.vehicles };
    });
  }

  public createSearchVehiclesSubscriptionIfNotExist() {
    if (!this.vehiclesSubscription) {
      this.startSearchVehiclesForCurrentLocation();
    }
  }

  @action('reset request status')
  public resetRequestStatus() {
    this.requestStatus = RequestStatus.done;
  }

  public async sendMainMapAnalytics() {
    const mapRegion = this.locationStore.mapRegion;
    const userLocation = this.locationStore.userLocation;
    if (!mapRegion || !userLocation) {
      return;
    }

    let minDistance = Number.MAX_VALUE;
    let countVisible = 0;
    const fromLatLon = new LatLon(
      userLocation.latitude,
      userLocation.longitude,
    );
    const vehicles = Object.values(this.vehicles);
    const northEast = {
      latitude: mapRegion.latitude + mapRegion.latitudeDelta / 2,
      longitude: mapRegion.longitude + mapRegion.longitudeDelta / 2,
    };
    const southWest = {
      latitude: mapRegion.latitude - mapRegion.latitudeDelta / 2,
      longitude: mapRegion.longitude - mapRegion.longitudeDelta / 2,
    };
    vehicles.forEach(vehicle => {
      if (!!vehicle && !!vehicle.location) {
        if (
          vehicle.location.latitude <= northEast.latitude &&
          vehicle.location.latitude >= southWest.latitude &&
          vehicle.location.longitude <= northEast.longitude &&
          vehicle.location.longitude >= southWest.longitude
        ) {
          countVisible++;
        }
        const toLatLon = new LatLon(
          vehicle.location.latitude,
          vehicle.location.longitude,
        );
        minDistance = Math.min(minDistance, fromLatLon.distanceTo(toLatLon));
      }
    });
  }

  public getVehicle(code: string) {
    if (code) {
      return this.vehicles[code.toLowerCase().substring(code.lastIndexOf('/') + 1)];
    }
  }

  @action('dismiss error')
  public dismissError() {
    this.requestStatus = RequestStatus.done;
  }

  @action('get vehicle by Qr Code')
  public async getVehicleByQrCode(vehicleCode: string) {
    this.requestStatus = RequestStatus.pending;
    try {
      const qrCode = Buffer.from(vehicleCode.toLowerCase()).toString('base64');
      const data = await Api.getInstance().getVehicleByCode(qrCode);
      if (data) {
        if (data.status === 'error') {
          this.setVehicleError(data);
        } else {
          this.setVehicleData(data);
        }
      }
    } catch (err) {
      this.setVehicleError();
    }
  }

  @action('set vehicle data')
  public setVehicleData = (data: any) => {
    data.location = this.getCoordinate(data.geoHash);
    this.errorMessage = VehicleErrorMessages.none;
    this.vehicles[data.qrCode] = data;
    this.requestStatus = RequestStatus.done;
  }

  @action('set vehicle error')
  public setVehicleError = (data?: any) => {
    this.requestStatus = RequestStatus.error;
    if (data) {
      if (VehicleErrorMessages[data.reason]) {
        this.errorMessage = data.reason;
      } else {
        this.errorMessage = VehicleErrorMessages.default;
      }
    } else {
      this.errorMessage = VehicleErrorMessages.invalidQr;
    }
  }

  @action('stop search vehicles')
  public async stopSearchForVehicles() {
    if (!!this.vehiclesSubscription) {
      this.vehiclesSubscription.unsubscribe();
      this.vehiclesSubscription = undefined;
    }
  }

  @action('clear data')
  public async clearData() {
    this.vehicles = {};
  }
}

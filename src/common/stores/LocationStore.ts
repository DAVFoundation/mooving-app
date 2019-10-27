import { observable, runInAction, action, computed } from 'mobx';
import firebase from 'react-native-firebase';
import Geohash from 'ngeohash';
import { Region } from 'react-native-maps';
import { Platform } from 'react-native';
import { setFallbackCountry, getFallbackCountry } from '../lib/localStorage';
import { AppStore } from './AppStore';
import Geolocation from 'react-native-geolocation-service';

const PIE_VERSION = 28;
const enableHighAccuracy = !(Platform.OS === 'android' && Platform.Version >= PIE_VERSION);
export const defaultRegion = {
  latitude: 32,
  longitude: 34,
  latitudeDelta: 90,
  longitudeDelta: 90,
};

export class LocationStore {
  private app: AppStore;
  private isLocationReady: Promise<boolean> | undefined;
  @observable public mapRegion: Region | null  = null;
  @observable public userLocation: any;
  @observable public countryCode: string | null = null;

  constructor(app: AppStore) {
    this.app = app;
    this.userLocation = {};
    this.init = this.init.bind(this);
    this.setMapRegion = this.setMapRegion.bind(this);
    navigator.geolocation.setRNConfiguration({skipPermissionRequests: true});
    this.setVisitorCountryCode();
  }

  public async init(): Promise<any> {
    if (this.isLocationReady) {
      return this.isLocationReady;
    }
    this.isLocationReady = new Promise(async resolve => {
      try {
        const hasLocationPermission = await this.app.requestLocationPermission();
        if (!hasLocationPermission) {
          this.isLocationReady = undefined;
          resolve(false);
          return;
        }
        Geolocation.getCurrentPosition(position => {
          const { longitude, latitude } = position.coords;
          runInAction(() => {
            this.userLocation = { longitude, latitude };
            resolve(true);
          });
        }, error => {
          firebase.analytics().logEvent('get_current_position_error', error);
        },
        { enableHighAccuracy,
          maximumAge: 5000 });
        Geolocation.watchPosition(position => {
          const { longitude, latitude } = position.coords;
          runInAction(() => {
            this.userLocation = { longitude, latitude };
            resolve(true);
          });
        }, error => {
          firebase.analytics().logEvent('get_current_position_error', error);
        }, {maximumAge: 5000});
      } catch (err) {
        this.isLocationReady = undefined;
        resolve(false);
      }
    });
    return this.isLocationReady;
  }

  @computed get mapCenterHash() {
    if (!this.mapRegion) {
      return null;
    }
    const mapCenterHash = Geohash.encode(this.mapRegion.latitude, this.mapRegion.longitude);
    return mapCenterHash;
  }

  @computed get accuracyLevel() {
    if (!this.mapRegion) {
      return null;
    }
    const delta = this.mapRegion.latitudeDelta;
    if (!delta || delta >= 90) {
      return 0;
    }
    if (delta >= 0.1) {
      return 4;
    } else if (delta >= 0.02) {
      return 5;
    } else if (delta >= 0.005) {
      return 6;
    }
    return 7;
  }

  public async setVisitorCountryCode() {
    try {
      const remoteConfig = firebase.config();
      await remoteConfig.fetch(0);
      await remoteConfig.activateFetched();
      const countryCode = await remoteConfig.getValue('countryCode');
      this.countryCode = countryCode.val();
      setFallbackCountry(this.countryCode || 'us');
      } catch (err) {
        try {
          this.countryCode = await getFallbackCountry();
        } catch (noCountryError) {
          this.countryCode = 'us';
        }
    }
    return this.countryCode;
  }

  @action('set map center')
  public async setMapRegion(region: Region) {
    this.mapRegion = region;
  }

  @action('set country code')
  public async setCountryCode(countryCode: string) {
    this.countryCode = countryCode;
  }

}

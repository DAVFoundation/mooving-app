import { AccountStore } from '../stores/AccountStore';
import { AppStore } from '../../common/stores/AppStore';
import { LocationStore } from '../../common/stores/LocationStore';
import { VehicleStore } from './VehicleStore';
import { RideStore } from './RideStore';
import { NavigationScreenProp, NavigationActions, StackActions, NavigationState } from 'react-navigation';
import { getToken, getInitialScreen } from '../../common/lib/localStorage';
import { Api } from '../lib/api';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen';
import { Buffer } from 'buffer';
import { map, filter, distinct, distinctUntilKeyChanged } from 'rxjs/operators';
import { Logger } from '../../common/lib/logger';
import { RIDE_STATE } from '../constants/ride';

export default class Stores {

  public locationData: LocationStore;
  public account: AccountStore;
  public vehicle: VehicleStore;
  public ride: RideStore;
  public app: AppStore;

  public navigation: NavigationScreenProp<any, any> | null = null;
  public processNavigation: boolean = true;
  constructor() {
    this.app = new AppStore();
    this.locationData = new LocationStore(this.app);
    this.ride = new RideStore();
    this.account = new AccountStore(this);
    this.vehicle = new VehicleStore(this.locationData);
  }

  private async uploadImageIfExist() {
    const imageUuid: string | null = await AsyncStorage.getItem('imageUuid');
    const parkingImageUri: string | null = await AsyncStorage.getItem('parkingImageUri');
    if (!!imageUuid && !!parkingImageUri) {
      this.ride.uploadImageAndRemoveFromStorage(imageUuid, parkingImageUri);
    }
  }

  private async handleOpenURL(event: any) {
    firebase.analytics().logEvent('deeplink_qr_scanned');
    const url = event;
    if (typeof url === 'string' && this.navigation) {
      if (url.includes('unlock')) {
        const qr = url.substr(url.lastIndexOf('/') + 1);
        try {
          const data = await Api.getInstance().getVehicleByCode(Buffer.from(qr).toString('base64'));
          if (data) {
            if (data.status === 'error') {
              this.vehicle.setVehicleError(data);
              this.navigation.navigate('Unlock');
            } else {
              this.vehicle.setVehicleData(data);
              this.navigation.navigate('VehicleDetails', {
                vehicleCode: qr,
              });
            }
          }
        } catch (err) {
          this.vehicle.setVehicleError();
          this.navigation.navigate('Unlock');
        }
      }
    }
  }

  public async init(navigation: NavigationScreenProp<any, any>) {
    this.navigation = navigation;

    try {
      // supported client version verification
      await Api.getInstance().verifyClientVersion();
    } catch (err) {
      firebase.analytics().logEvent('client_ver_check_fail', err);
      if (err instanceof Response && err.status === 404) { // show unsupported version dialog
        this.app.setUnsupportedVersion(true);
        return;
      }
    }

    const token = await getToken();

    Linking.getInitialURL()
      .then((url: string) => {
        if (url && token) {
          this.processNavigation = false;
          this.handleOpenURL(url);
        }
      })
      .catch(this.setInitialRoutForNoUser);

    Linking.addEventListener('url', (e: any) => this.handleOpenURL(e.url));

    if (token) {
      Api.getInstance().setToken(token);
      this.account.startUpdateAccount();
    } else {
      await this.locationData.setVisitorCountryCode();
      this.setInitialRoutForNoUser();
    }

    const accountPoller = this.account.getAccountSubject()
      .pipe(map(response => response.account.activeRide));

    accountPoller.pipe(
      distinctUntilKeyChanged('statusCode'),
      map(activeRide => activeRide.ride),
      filter(ride => !ride || !ride.startTime))
      .subscribe(async ride => {
        await this.uploadImageIfExist();
        if (this.ride.rideState !== RIDE_STATE.ENDING) {
          try {
            const initialScreen = await getInitialScreen();
            if (initialScreen) {
              this.dropStackNavigationAndNavigateTo(initialScreen);
              this.app.setInitialScreen('Main');
            } else {
              this.dropStackNavigationAndNavigateTo('Main');
            }
          } catch {
            this.dropStackNavigationAndNavigateTo('Main');
          }
        }
      },
        error => {
          Logger.log('rider/stores/index.ts', error);
        });

    accountPoller
      .pipe(map(activeRide => activeRide.ride))
      .pipe(filter(ride => ride != null && ride.startTime))
      .subscribe(
        ride => {
          this.ride.init(ride);
          if (this.ride.rideState === RIDE_STATE.NONE) {
            this.ride.setRideState(RIDE_STATE.INRIDE);
            this.dropStackNavigationAndNavigateTo('Ride');
          }
        },
        error => {
          Logger.log('rider/stores/index.ts', error);
        });
  }

  public setInitialRoutForNoUser = () => {
    if (this.app.isFirstUse) {
      this.dropStackNavigationAndNavigateTo('Onboarding');
    } else {
      this.dropStackNavigationAndNavigateTo('Login');
    }
  }

  public dropStackNavigationAndNavigateTo(routeName: string) {
    SplashScreen.hide();
    if (!this.processNavigation && routeName !== 'Ride') {
      return;
    }
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName })],
    });
    if (this.navigation) {
      this.navigation.dispatch(resetAction);
    }
  }
}

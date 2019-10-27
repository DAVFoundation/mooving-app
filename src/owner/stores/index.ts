import { AccountStore } from './AccountStore';
import { AppStore } from './AppStore';
import { LocationStore } from '../../common/stores/LocationStore';
import { VehicleStore } from './VehicleStore';
import { NavigationScreenProp, NavigationActions, StackActions, NavigationNavigateAction } from 'react-navigation';
import { getToken } from '../../common/lib/localStorage';
import { Api } from '../lib/api';
import SplashScreen from 'react-native-splash-screen';
import firebase from 'react-native-firebase';
import { take } from 'rxjs/operators';

export default class Stores {

  protected locationData: LocationStore;
  protected account: AccountStore;
  protected vehicle: VehicleStore;
  protected app: AppStore;
  public navigation: NavigationScreenProp<any, any> | null = null;
  constructor() {
    this.app = new AppStore();
    this.locationData = new LocationStore(this.app);
    this.account = new AccountStore(this.locationData);
    this.vehicle = new VehicleStore();
  }

  public async init(navigation: NavigationScreenProp<any, any>) {
    this.navigation = navigation;
    try {
      // supported client version verification
      await Api.getInstance().verifyClientVersion();
    } catch (err) {
      SplashScreen.hide();
      firebase.analytics().logEvent('client_ver_check_fail', err);
      if (err instanceof Response && err.status === 404) { // show unsupported version dialog
        this.app.setUnsupportedVersion(true);
        return;
      }
    }
    const token = await getToken();
    if (token) {
      Api.getInstance().setToken(token);
      this.account.startUpdateAccount();
      this.account.getAccountSubject().pipe(take(1)).subscribe(async () => {
        await this.vehicle.getVehicles();
        this.dropStackNavigationAndNavigateTo('Main', NavigationActions.navigate({ routeName: 'Dashboard' }));
      },
      async error => {
        if (error.status === 401) {
          await this.locationData.setVisitorCountryCode();
          this.dropStackNavigationAndNavigateTo('Login');
        }
      });
    } else {
      await this.locationData.setVisitorCountryCode();
      this.dropStackNavigationAndNavigateTo('Login');
    }
  }

  public dropStackNavigationAndNavigateTo(routeName: string, subAction?: NavigationNavigateAction) {
    SplashScreen.hide();
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName,
          params: {},
          action: subAction,
        }),
      ],
    });
    if (this.navigation) {
      this.navigation.dispatch(resetAction);
    }
  }
}

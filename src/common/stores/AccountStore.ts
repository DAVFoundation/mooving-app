import { observable, action, runInAction } from 'mobx';
import { RequestStatus, IPaymentMethod } from '../../common/lib/types';
import { saveToken, deleteToken } from '../lib/localStorage';
import { Api } from '../lib/api';
import Geohash from 'ngeohash';
import { LocationStore } from './LocationStore';
import Firebase from 'react-native-firebase';
import { Subscription, from, timer, BehaviorSubject } from 'rxjs';
import { map, mergeAll, take, filter } from 'rxjs/operators';
import { Logger } from '../lib/logger';
import { ACCOUNT_POLLING_INTERVAL } from '../constants';

export abstract class AccountStore {

  private accountPollerSubscription: Subscription = null;

  protected accountPollerSubject = new BehaviorSubject(null);

  protected locationStore: LocationStore;
  protected id: string | undefined;
  protected token: string | undefined;
  @observable public firstName: string = '';
  @observable public lastName: string = '';
  @observable public phoneNumber: string = '';
  @observable public email: string = '';
  @observable public countryCode: string = '';
  @observable public paymentMethod: IPaymentMethod | undefined;
  @observable public requestStatus: RequestStatus = RequestStatus.done;
  @observable public hasPayment: boolean = false;
  @observable public isLoginCodeSent: boolean = false;
  @observable public davBalance: number | null = null;

  constructor(locationStore: LocationStore, private api: Api) {
    this.locationStore = locationStore;
    this.logOut = this.logOut.bind(this);
    this.sendSMS = this.sendSMS.bind(this);
    this.verifyCode = this.verifyCode.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);
    this.resetLoginCode = this.resetLoginCode.bind(this);
    this.sendLocationAnalytics = this.sendLocationAnalytics.bind(this);
    this.updatePersonalDetails = this.updatePersonalDetails.bind(this);
  }

  protected abstract setAccount(user: any): void;

  @action('save token')
  protected saveToken(newToken: string) {
    this.token = newToken;
    saveToken(newToken);
  }

  public async sendLocationAnalytics() {
    await this.locationStore.init();
    const location = this.locationStore.userLocation;
    const locationHash = Geohash.encode(location.latitude, location.longitude);
    Firebase.analytics().logEvent('app_start',
    {location: locationHash, userId: this.id});
}

  @action('log out')
  public async logOut() {
    this.email = '';
    this.lastName = '';
    this.firstName = '';
    this.phoneNumber = '';
    this.token = undefined;
    this.paymentMethod = undefined;
    deleteToken();
    await this.locationStore.setVisitorCountryCode();
    this.accountPollerSubscription.unsubscribe();
  }

  public getAccountSubject() {
    return this.accountPollerSubject.pipe(filter(value => value != null));
  }

  public startUpdateAccount() {
    const accountPoller = timer(0, ACCOUNT_POLLING_INTERVAL)
        .pipe(map(() => this.api.getAccountDetails()))
        .pipe(promise => from(promise), mergeAll());
    this.accountPollerSubscription = accountPoller.subscribe(
      response => {
        const user = response.account;
        if (user) {
          this.setAccount(user);
          this.accountPollerSubject.next(response);
        }
      },
      error => {
        Logger.log('common/stores/AccountStore.ts', error);
      },
    );
  }

  @action('send SMS')
  public async sendSMS(phoneNumber: string = this.phoneNumber, countryCode: string = this.countryCode): Promise<any> {
    this.isLoginCodeSent = false;
    this.requestStatus = RequestStatus.pending;
    this.countryCode = countryCode;
    this.phoneNumber = phoneNumber;
    try {
      await this.api.sendSMS(phoneNumber, countryCode);
      runInAction(() => {
        this.requestStatus = RequestStatus.done;
        this.isLoginCodeSent = true;
      });
    } catch (err) {
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  @action('reset login code')
  public resetLoginCode() {
    this.isLoginCodeSent = false;
  }

  @action('login')
  public async verifyCode(verificationCode: string) {
    this.requestStatus = RequestStatus.pending;
    try {
      const response = await this.api.verifyCode(this.phoneNumber, this.countryCode, verificationCode);
      if (response.verified === false) {
        runInAction(() => {
          this.requestStatus = RequestStatus.error;
        });
      }
      if (response.token) {
        this.api.setToken(response.token);
        this.saveToken(response.token);
        this.startUpdateAccount();
        this.getAccountSubject().pipe(take(1)).subscribe(async () => {
          runInAction(() => {
            this.requestStatus = RequestStatus.done;
          });
        },
        error => {
          runInAction(() => {
            this.requestStatus = RequestStatus.error;
          });
        });
      }
      return response;
    } catch (err) {
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  @action('update account')
  public async updatePersonalDetails(details: Partial<AccountStore>) {
    this.requestStatus = RequestStatus.pending;
    try {
      await this.api.updatePersonalDetails(details);
      runInAction(() => {
        this.requestStatus = RequestStatus.done;
        Object.assign(this, details);
      });
    } catch (err) {
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  public isLoggedIn() {
    return !!this.token;
  }

}

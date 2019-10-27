import { AccountStore as AccountStoreBace } from '../../common/stores/AccountStore';
import { Api } from '../lib/api';
import { observable, runInAction, action } from 'mobx';
import { RequestStatus } from '../../common/lib/types';
import Stores from './index';
import { Logger } from '../../common/lib/logger';
import { take } from 'rxjs/operators';
import { RideStore } from './RideStore';
import { RIDE_STATE } from '../constants/ride';

export interface IRideHistory {
  distance: number;
  price: number;
  currencyCode: string;
  startTime: Date;
  endTime: Date;
  receiptUrl?: string;
}

export class AccountStore extends AccountStoreBace {

  protected rideStore: RideStore;

  @observable public paymentToken: string | undefined;
  @observable public paymentError: boolean = false;
  @observable public hasActiveRide: boolean = false;
  @observable public rideHistory: IRideHistory[] = [];
  public userGotDavReward: boolean = false;

  constructor(private stores: Stores) {
    super(stores.locationData, Api.getInstance());
    this.rideStore = stores.ride;
  }

  @action('set account')
  protected setAccount(user: any) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phoneNumber = user.phoneNumber;
    this.email = user.email;
    this.countryCode = user.countryCode;
    this.hasPayment = user.isPaymentValid;
    if (this.rideStore.rideState !== RIDE_STATE.ENDING) {
      this.davBalance = user.davBalance;
    }
    this.userGotDavReward = user.userGotDavReward;
  }

  @action('get payment token')
  public async getPaymentToken() {
    try {
      const data = await Api.getInstance().getPaymentToken();
      runInAction(() => {
        this.paymentToken = data.token;
        this.requestStatus = RequestStatus.done;
      });
    } catch (err) {
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  @action('get ride history')
  public async getRideHistory() {
    try {
      this.requestStatus = RequestStatus.pending;
      const data = await Api.getInstance().getRideHistory();
      const rideHistory = data.rideHistory.map(
        (rideData: IRideHistory) =>
        ({
          distance: Number(rideData.distance),
          price: Number(rideData.price),
          startTime: new Date(rideData.startTime),
          endTime: new Date(rideData.endTime),
          receiptUrl: rideData.receiptUrl,
          currencyCode: rideData.currencyCode,
        }));
      runInAction(() => {
        this.rideHistory = rideHistory;
        this.requestStatus = RequestStatus.done;
      });
    } catch (err) {
      runInAction(() => {
        Logger.log(err);
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  @action('dismiss payment error')
  public async dismissPaymentError() {
    try {
      await this.getPaymentToken();
      runInAction(() => {
        this.paymentError = false;
      });
    } catch (err) {
      this.requestStatus = RequestStatus.error;
    }
  }

  @action('set credit card')
  public async setCreditCard() {
    this.requestStatus = RequestStatus.pending;
    try {
      if (this.paymentToken) {
        const response = await Api.getInstance().
          updateCreditCard(this.paymentToken, this.firstName || 'Dav', this.lastName || 'Rider');
        runInAction(() => {
          this.paymentMethod = {
            last4: response.last4,
            brand: response.brand,
          };
          this.hasPayment = true;
          this.requestStatus = RequestStatus.done;
        });
      }
    } catch (err) {
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
        this.paymentError = true;
      });
    }
  }

  @action('get credit card')
  public async getCreditCard() {
    if (!this.hasPayment ||
      (this.paymentMethod && this.paymentMethod.last4 && this.paymentMethod.brand)) {
      return;
    }
    this.requestStatus = RequestStatus.pending;
    try {
      const response = await Api.getInstance().getPaymentInfo();
      runInAction(() => {
        this.paymentMethod = {
          last4: response.last4,
          brand: response.brand,
        };
        this.hasPayment = true;
        this.requestStatus = RequestStatus.done;
      });
    } catch (err) {
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  @action('delete credit card')
  public async deleteCreditCard() {
    if (!this.hasPayment) {
      return;
    }
    this.requestStatus = RequestStatus.pending;
    try {
      await Api.getInstance().deleteCreditCard();
      runInAction(() => {
        this.paymentMethod = {
          last4: '',
          brand: '',
        };
        this.paymentToken = undefined;
        this.hasPayment = false;
        this.requestStatus = RequestStatus.done;
      });
    } catch (err) {
      runInAction(() => {
        this.requestStatus = RequestStatus.error;
      });
    }
  }

  @action('login')
  public async verifyCode(verificationCode: string) {
    this.requestStatus = RequestStatus.pending;
    try {
      const response = await Api.getInstance().verifyCode(this.phoneNumber, this.countryCode, verificationCode);
      if (response.verified === false) {
        runInAction(() => {
          this.requestStatus = RequestStatus.error;
        });
      }
      if (response.token) {
        Api.getInstance().setToken(response.token);
        this.saveToken(response.token);
        this.startUpdateAccount();
        this.getAccountSubject().pipe(take(1)).subscribe(async () => {
          try {
            const ride = await Api.getInstance().getActiveRide();
            this.stores.ride.init(ride);
            runInAction(() => {
              this.hasActiveRide = true;
              this.requestStatus = RequestStatus.done;
            });
          } catch (err) {
            runInAction(() => {
              this.hasActiveRide = false;
              this.requestStatus = RequestStatus.done;
            });
          }
        },
        error => {
          Logger.log('rider/stores/AccountStore.ts', error);
          this.token = undefined;
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

  @action('add dav tokens')
  public addDavTokens(amount: number | undefined) {
    this.davBalance += (amount || 0);
    if (this.davBalance && this.davBalance > 0) {
      this.userGotDavReward = true;
    }
  }
}

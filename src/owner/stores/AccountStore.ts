import { AccountStore as AccountStoreBase } from '../../common/stores/AccountStore';
import { Api } from '../lib/api';
import { LocationStore } from '../../common/stores/LocationStore';
import { observable, runInAction, action } from 'mobx';
import { Logger } from '../../common/lib/logger';
import Firebase from 'react-native-firebase';

interface IOwnerStats {
  income: number;
  rides: number;
}
export class AccountStore extends AccountStoreBase {

  @observable public today?: IOwnerStats;
  @observable public total?: IOwnerStats;
  @observable public companyName: string = '';
  @observable public currencyCode: string = '';

  constructor(locationStore: LocationStore) {
    super(locationStore, Api.getInstance());
    this.getOwnerStats = this.getOwnerStats.bind(this);
  }

  @action('set account')
  protected setAccount(user: any) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phoneNumber = user.phoneNumber;
    this.email = user.email;
    this.countryCode = user.countryCode;
    this.companyName = user.companyName;
    this.currencyCode = user.fiatCurrencyCode;
    this.davBalance = user.davBalance;
  }

  public async getOwnerStats() {
    try {
      const today = new Date().toISOString();
      const ownerStats = await Api.getInstance().getOwnerStats(today);
      runInAction(() => {
        this.today = {
          income: Number(ownerStats.dailyFiatRevenue),
          rides: Number(ownerStats.dailyRidesCount),
        };

        this.total = {
          income: Number(ownerStats.totalFiatRevenue),
          rides: Number(ownerStats.totalRidesCount),
        };
      });
    } catch (err) {
      Logger.log(err);
    }
  }
}

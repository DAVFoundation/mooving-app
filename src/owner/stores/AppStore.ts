import { AppStore as AppStoreBase } from '../../common/stores/AppStore';
import { observable, action } from 'mobx';
import { getFirstStatusChangeAlert, setFirstStatusChangeAlert } from '../../common/lib/localStorage';

export class AppStore extends AppStoreBase {

  @observable public statusChangeAlert: { [key: string]: boolean } = { };
  constructor() {
    super();
    this.loadStatusChangeAlert();
  }

  @action('load status change alert')
  private async loadStatusChangeAlert() {
    this.statusChangeAlert = await getFirstStatusChangeAlert();
  }

  @action('set status change alert')
  public async setStatusChangeAlert(status: string) {
    this.statusChangeAlert[status] = true;
    await setFirstStatusChangeAlert(this.statusChangeAlert);
  }

}

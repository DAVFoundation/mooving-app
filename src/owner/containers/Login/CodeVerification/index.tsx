import CodeVerificationBase from '../../../../common/containers/Login/CodeVerification';
import { View } from 'react-native';
import React from 'react';
import { customSizes } from '../../../../common/styles';
import { STORE_ACCOUNT, STORE_LOCATION, STORE_VEHICLE } from '../../../constants';
import { AccountStore } from '../../../stores/AccountStore';
import { NavigationScreenProp, NavigationActions } from 'react-navigation';
import { translate } from 'react-i18next';
import { inject, observer } from 'mobx-react/native';
import { RequestStatus } from '../../../../common/lib/types';
import { VehicleStore } from '../../../stores/VehicleStore';

interface ILoginProps {
  [STORE_ACCOUNT]: AccountStore;
  [STORE_VEHICLE]: VehicleStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

@translate('translations')
@inject(STORE_ACCOUNT, STORE_LOCATION, STORE_VEHICLE)
@observer
export default class CodeVerification extends CodeVerificationBase<ILoginProps> {

  constructor(props: ILoginProps) {
    super(props);
    this.renderTermsAndConditions = this.renderTermsAndConditions.bind(this);
  }

  public componentWillReact() {
    const { isLoggedIn, requestStatus } = this.props[STORE_ACCOUNT];
    const { getVehicles } = this.props[STORE_VEHICLE];
    if (requestStatus === RequestStatus.done && isLoggedIn()) {
      getVehicles();
      this.dropStackNavigationAndNavigateTo('Main', NavigationActions.navigate({ routeName: 'Dashboard' }));
    }
  }

  public renderTermsAndConditions() {
    return (
      <View style={{ marginTop: customSizes.space }} >
      </View>
    );
  }
}

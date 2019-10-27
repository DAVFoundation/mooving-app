import PhoneBase from '../../../../common/containers/Login/Phone';
import { View, StatusBar } from 'react-native';
import Spinner from '../../../../common/components/Spinner';
import AnimatedBackground from '../AnimatedBackground';
import { RequestStatus } from '../../../../common/lib/types';
import React from 'react';
import { STORE_ACCOUNT, STORE_LOCATION } from '../../../constants';
import { customColors, customSizes } from '../../../../common/styles';
import { translate } from 'react-i18next';
import { inject, observer } from 'mobx-react/native';
import { AccountStore } from '../../../stores/AccountStore';
import { LocationStore } from '../../../../common/stores/LocationStore';
import { NavigationScreenProp } from 'react-navigation';
import LogoHeader from '../AnimatedBackground/LogoHeader';
import AnimatedMap from '../AnimatedBackground/AnimatedMap';

interface ILoginProps {
  [STORE_ACCOUNT]: AccountStore;
  [STORE_LOCATION]: LocationStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

@translate('translations')
@inject(STORE_ACCOUNT, STORE_LOCATION)
@observer
export default class Phone extends PhoneBase {

  constructor(props: ILoginProps) {
    super(props);
  }

  public render() {
    const { requestStatus } = this.props[STORE_ACCOUNT];
    return (
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: customColors.black,
          paddingTop: customSizes.space * 2,
        }}>
          <Spinner isVisible={requestStatus === RequestStatus.pending} />
          <StatusBar barStyle='light-content'/>
          <LogoHeader t={this.props.t}/>
          <AnimatedMap isKeyboardVisible={this.state.keyboardVisible}/>
          { this.renderPhoneInput(customColors.davRed) }
        </View>
    );
  }
}

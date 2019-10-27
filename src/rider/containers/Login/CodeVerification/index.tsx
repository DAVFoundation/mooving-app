import CodeVerificationBase from '../../../../common/containers/Login/CodeVerification';
import { STORE_ACCOUNT, STORE_LOCATION } from '../../../constants';
import { AccountStore } from '../../../stores/AccountStore';
import { NavigationScreenProp } from 'react-navigation';
import { translate } from 'react-i18next';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { View, Text, Linking } from 'react-native';
import { textStyles, customColors, customSizes } from '../../../../common/styles';

interface ILoginProps {
  [STORE_ACCOUNT]: AccountStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

@translate('translations')
@inject(STORE_ACCOUNT, STORE_LOCATION)
@observer
export default class CodeVerification extends CodeVerificationBase<ILoginProps> {

  public renderTermsAndConditions() {
    const { t } = this.props;

    return (
      <View style={{ marginTop: customSizes.space }} >
        <Text style={[
          textStyles.description,
          {
            color: customColors.black,
          },
        ]}>{`${t('signup.t&c.text')} `}
          <Text style={[
            textStyles.description,
            {
              fontWeight: '900',
              color: customColors.black,
            },
          ]} onPress={() => Linking.openURL('https://dav.city/renter_terms_and_conditions.pdf')}>
            {t('signup.t&c.link')}</Text>
        </Text>
      </View>
    );
  }
}

import React from 'react';
import { View, Image, StyleSheet, Linking, Platform, BackHandler } from 'react-native';
import { customColors, customSizes } from '../../../common/styles';
import { ErrorModal } from '../ErrorModal';
import { NavigationScreenProp } from 'react-navigation';
import { translate } from 'react-i18next';
import { inject, observer } from 'mobx-react/native';
import { AppStore } from '../../stores/AppStore';
import { STORE_APP } from '../../constants';
import Firebase from 'react-native-firebase';

export interface ISplashScreenProps {
  [STORE_APP]: AppStore;
  navigation: NavigationScreenProp<any, any>;
  style?: any;
  iosStoreLink: string;
  androidStoreLink: string;
  t(key: string, options?: any): string;
}

interface ISplashScreenState {
  isVersionUnsupported: boolean;
}

@translate('translations')
@inject(STORE_APP)
@observer
export default class SplashScreen extends React.Component<
ISplashScreenProps,
ISplashScreenState
> {

  constructor(props: ISplashScreenProps) {
    super(props);
    this.state = {
      isVersionUnsupported: false,
    };
  }

  public closeErrorModal = () => {
    const url = Platform.OS === 'ios' ? this.props.iosStoreLink : this.props.androidStoreLink;
    Linking.openURL(url).catch(err => Firebase.analytics().logEvent('err_open_store_uri', err));
  }

  public render() {
    const { style, t } = this.props;
    const { isVersionUnsupported } = this.props[STORE_APP];
    return (
      <View style={[styles.container, style]}>
      <ErrorModal isOpen={ isVersionUnsupported }
        title={t('errors.updateRequired.title')}
        text={t('errors.updateRequired.text')}
        buttonText={t('errors.updateRequired.buttonText')}
        onRequestClose={ BackHandler.exitApp }
        closeErrorModal={this.closeErrorModal} />
        <View style={styles.circle}>
          <Image
            style={styles.davLogo}
            source={require('../../../common/assets/logos/dav-logo_white.png')}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: customColors.davRed,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  davLogo: {
    width: 200,
    height: 200,
  },
});

import React from 'react';
import { View, StyleSheet, Platform, AppState, Text } from 'react-native';
import {
  NavigationScreenProp,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import { inject, observer } from 'mobx-react/native';
import { STORE_VEHICLE, STORE_APP } from '../../constants';
import { VehicleStore, VehicleErrorMessages } from '../../stores/VehicleStore';
import Spinner from '../../../common/components/Spinner';
import QRScanner from '../../components/QRScanner';
import CodeInput from '../../components/CodeInput';
import { RequestStatus } from '../../../common/lib/types';
import { customSizes, customColors } from '../../../common/styles';
import Firebase from 'react-native-firebase';
import { ErrorModal } from '../../../common/components/ErrorModal';
import { translate } from 'react-i18next';
import { InteractiveModal } from '../../../common/components/InteractiveModal';
import { AppStore } from '../../../common/stores/AppStore';
import OpenAppSettings from 'react-native-app-settings';

interface IUnlockProps {
  [STORE_VEHICLE]: VehicleStore;
  [STORE_APP]: AppStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

interface IUnlockState {
  qrScan: boolean;
  code: string;
  isScreenFocused: boolean;
}

@translate('translations')
@inject(STORE_VEHICLE, STORE_APP)
@observer
export default class Unlock extends React.Component<
  IUnlockProps,
  IUnlockState
> {
  private willBlurSubscription: any;
  private didFocusSubscription: any;

  constructor(props: IUnlockProps) {
    super(props);
    this.state = {
      qrScan: true,
      isScreenFocused: true,
      code: '',
    };
    this.unlock = this.unlock.bind(this);
    this.useInput = this.useInput.bind(this);
    this.useCamera = this.useCamera.bind(this);
    this.closeErrorModal = this.closeErrorModal.bind(this);
    this.dropStackNavigationAndNavigateToMain = this.dropStackNavigationAndNavigateToMain.bind(
      this,
    );
  }

  public componentDidMount() {
    if (Platform.OS === 'android') {
      AppState.addEventListener('change', this.checkForCameraPermission);
    }
    this.checkForCameraPermission();
    this.didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      () => this.setState({ isScreenFocused: true }),
    );
    this.willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      () => this.setState({ isScreenFocused: false }),
    );
    Firebase.analytics().logEvent('saw_scan_qr_screen');
  }

  public componentWillUnmount() {
    this.willBlurSubscription.remove();
    this.didFocusSubscription.remove();
    if (Platform.OS === 'android') {
      AppState.removeEventListener('change', this.checkForCameraPermission);
    }
  }

  public checkForCameraPermission = () => {
    this.props[STORE_APP].requestCameraPermission();
  }

  public componentWillReact() {
    const { navigation } = this.props;
    const { getVehicle, requestStatus, errorMessage } = this.props[STORE_VEHICLE];
    const vehicle = getVehicle(this.state.code);
    if (vehicle && requestStatus === RequestStatus.done &&
      errorMessage === VehicleErrorMessages.none) {
      navigation.navigate('VehicleDetails', {
        vehicleCode: this.state.code,
      });
      this.setState({ code: '' });
    }
  }

  public async unlock(code: string) {
    this.setState({ code });
    this.props[STORE_VEHICLE].getVehicleByQrCode(code);
  }

  public useCamera() {
    this.setState({ qrScan: true });
    Firebase.analytics().logEvent('qr_button_clicked');
  }

  public useInput() {
    this.setState({ qrScan: false });
    Firebase.analytics().logEvent('manual_code_button_clicked');
  }

  public closeErrorModal() {
    this.props[STORE_VEHICLE].dismissError();
    this.setState({
      code: '',
    });
  }

  public dropStackNavigationAndNavigateToMain() {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Main' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  public renderQrCodeScanner() {
    const { qrScan, isScreenFocused, code } = this.state;
    const cameraIsActive = isScreenFocused && qrScan && !code;
    return (
      <QRScanner
        submitCode={this.unlock}
        useCodeInput={this.useInput}
        cancelScan={this.dropStackNavigationAndNavigateToMain}
        freeze={!cameraIsActive}
        hasCameraPermission={this.props[STORE_APP].cameraPermission}
      />
    );
  }

  public renderCodeInput() {
    return (
      <CodeInput
        submitCode={this.unlock}
        useQRScanner={this.useCamera}
        cancelScan={this.useCamera}
      />
    );
  }

  public openAppSettings = () => {
    if (OpenAppSettings) {
      this.props[STORE_APP].setInitialScreen('Unlock');
      OpenAppSettings.open();
    }
  }

  public render() {
    const { qrScan, isScreenFocused } = this.state;
    const { t } = this.props;
    const { requestStatus, errorMessage } = this.props[STORE_VEHICLE];
    const isCameraPermissionDenied = this.props[STORE_APP].cameraPermissionRequested &&
                                     !this.props[STORE_APP].cameraPermission;
    if (isScreenFocused) {
      return (
        <View style={styles.container}>
          <Spinner isVisible={requestStatus === RequestStatus.pending} />
          {
            qrScan ?
            this.renderQrCodeScanner() :
            this.renderCodeInput()
          }
          <ErrorModal isOpen={requestStatus === RequestStatus.error}
            title={t(`unlock.errors.${errorMessage}.title`)}
            text={t(`unlock.errors.${errorMessage}.text`)}
            closeErrorModal={this.closeErrorModal} />
          <InteractiveModal
            isOpen={isCameraPermissionDenied}
            submit={this.openAppSettings}
            cancel={this.dropStackNavigationAndNavigateToMain}
            title={t('unlock.cameraPermissionModal.title')}
            text={t('unlock.cameraPermissionModal.text')}
            buttonApproveStyle={{
              backgroundColor: customColors.black,
              borderColor: customColors.black,
            }}
            buttonApproveText={t('unlock.cameraPermissionModal.buttonApprove')}
          />
        </View>
      );
    } else {
      return <View/>;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: customSizes.space / 2,
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
  },
});

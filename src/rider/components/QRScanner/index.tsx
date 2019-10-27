import React, { Component } from 'react';
import { RNCamera } from 'react-native-camera';
import {
  View,
  Vibration,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { translate } from 'react-i18next';
import {
  customColors,
  customSizes,
} from '../../../common/styles';
import Firebase from 'react-native-firebase';
import BottomMenu from './BottomMenu';
import TopMenu from '../TopMenu';
import { crossWhite, torchOff, torchOn, codeInput } from '../../../common/components/Icons';
import Button, { buttonsStyle } from '../../../common/components/Button';

interface IQRScannerProps {
  submitCode: (code: string) => void;
  useCodeInput: () => void;
  cancelScan: () => void;
  hasCameraPermission: boolean;
  freeze: boolean;
  t?(key: string, options?: any): string;
}

interface IQRScannerState {
  isTorchOn: boolean;
}

@translate('translations')
export default class QRScanner extends Component<
IQRScannerProps,
IQRScannerState
> {
  public camera: any;
  constructor(props: IQRScannerProps) {
    super(props);
    this.state = {
      isTorchOn: false,
    };
    this.onSuccess = this.onSuccess.bind(this);
    this.toggleTorch = this.toggleTorch.bind(this);
  }

  public toggleTorch() {
    this.setState(({ isTorchOn }) => ({ isTorchOn: !isTorchOn }));
  }

  public shouldComponentUpdate(
    nextProps: Readonly<IQRScannerProps>,
    nextState: Readonly<IQRScannerState>,
  ) {
    const lastCameraState = this.props.freeze;
    if (this.camera && lastCameraState !== nextProps.freeze) {
      if (nextProps.freeze) {
        this.camera.pausePreview();
      } else {
        this.camera.resumePreview();
      }
    }
    return this.state.isTorchOn !== nextState.isTorchOn ||
      this.props.hasCameraPermission !== nextProps.hasCameraPermission;
  }

  public onSuccess(e: any) {
    const { submitCode, freeze } = this.props;
    if (!freeze) {
      submitCode(e.data);
      Vibration.vibrate(400, false);
      Firebase.analytics().logEvent('qr_scanned');
    }
  }

  public cancelScan = () => this.props.cancelScan();

  public refCamera = (ref: any) => (this.camera = ref);

  public getCameraComponent = () => {
    return this.props.hasCameraPermission ? (
      <RNCamera
        ref={this.refCamera}
        style={styles.cameraView}
        type={RNCamera.Constants.Type.back}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        captureAudio={false}
        flashMode={
          this.state.isTorchOn ?
            RNCamera.Constants.FlashMode.torch :
            RNCamera.Constants.FlashMode.off
        }
        onBarCodeRead={this.onSuccess}
      />
    ) : null;
  }

  public render() {
    const { isTorchOn } = this.state;
    const { t } = this.props;
    return (
      <View style={styles.container}>
        <SafeAreaView>
          <TopMenu
            text={t('unlock.qr.title')}
            textStyle={{ color: customColors.white }}
            goBack={this.cancelScan}
            icon={crossWhite}
          />
        </SafeAreaView>
        <BottomMenu backgroundColor={customColors.black}>
          <Button onPress={this.toggleTorch}
            iconStyle={{ width: 36, height: 36 }}
            style={[buttonsStyle.mediumCircle, styles.button, {
              marginRight: customSizes.space / 2,
              backgroundColor: isTorchOn ? customColors.white : customColors.grey7,
            }]}
            icon={isTorchOn ? torchOff : torchOn} />
          <Button onPress={this.props.useCodeInput}
            iconStyle={{ width: 40, height: 40 }}
            style={[buttonsStyle.mediumCircle, styles.button]}
            icon={codeInput} />
        </BottomMenu>
        {this.getCameraComponent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraView: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  button: {
    borderWidth: 2,
    backgroundColor: customColors.grey7,
    marginLeft: customSizes.space / 2,
    borderColor: customColors.white,
  },
});

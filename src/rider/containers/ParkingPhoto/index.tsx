import React, { createRef, Component, RefObject } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, StyleSheet, BackHandler } from 'react-native';
import { NavigationScreenProp, NavigationScreenOptions, StackActions, NavigationActions } from 'react-navigation';
import { inject, observer } from 'mobx-react/native';
import { STORE_RIDE } from '../../constants';
import { RideStore } from '../../stores/RideStore';
import { translate } from 'react-i18next';
import Spinner from '../../../common/components/Spinner';
import { RNCamera } from 'react-native-camera';
import { HeaderTitle } from '../../../common/components/HeaderTitle';
import { RequestStatus } from '../../../common/lib/types';
import { customSizes, customColors, textStyles } from '../../../common/styles';
import Firebase from 'react-native-firebase';
import Button, { buttonsStyle, buttonsPosition } from '../../../common/components/Button';
import { arrowBackwardWhite, camera } from '../../../common/components/Icons';

interface IParkingPhotoProps {
  [STORE_RIDE]: RideStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

@translate('translations')
@inject(STORE_RIDE)
@observer
export default class ParkingPhoto extends Component<IParkingPhotoProps> {

  private camera: RefObject<RNCamera>;

  constructor(props: IParkingPhotoProps) {
    super(props);
    this.camera = createRef();
    this.takePicture = this.takePicture.bind(this);
  }

  private async takePicture() {
    BackHandler.addEventListener('hardwareBackPress', this.disableNativeBack);
    if (this.camera.current) {
      const options = {
        quality: 0.5,
        orientation: 'portrait',
        fixOrientation: true,
        pauseAfterCapture: true,
        // base64: true,
      };
      const data = await this.camera.current.takePictureAsync(options);
      Firebase.analytics().logEvent('photo_taken');
      this.props[STORE_RIDE].lockVehicle(data.uri);
    }
  }

  public componentDidMount() {
    Firebase.analytics().logEvent('saw_verify_parking_screen');
  }

  public componentWillReact() {
    const { requestStatus, endTime } = this.props[STORE_RIDE];
    if (requestStatus === RequestStatus.done && endTime) {
      this.dropStackNavigationAndNavigateToRideSummary();
    }
  }

  public disableNativeBack = () => true;

  public dropStackNavigationAndNavigateToRideSummary() {
    BackHandler.removeEventListener('hardwareBackPress', this.disableNativeBack);
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'RideSummary' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  public navigateToRide = () => this.props.navigation.replace('Ride');

  public render() {
    const { t } = this.props;
    const { requestStatus } = this.props[STORE_RIDE];
    return (
      <View style={StyleSheet.absoluteFill}>
        <RNCamera
          captureAudio={false}
          ref={this.camera}
          style={styles.preview} />
        <SafeAreaView style={styles.container}>
          <View style={{ height: customSizes.main * 3 }}>
            <View style={styles.titleContainer}>
              <Button
                style={[
                  buttonsStyle.smallCircle,
                  {
                    backgroundColor: customColors.whiteTransparent,
                    marginRight: customSizes.space,
                  },
                ]}
                icon={arrowBackwardWhite}
                onPress={this.navigateToRide} />
              <HeaderTitle title={t('parkingPhoto.title')} />
            </View>
            <View style={{ height: customSizes.main * 1.5 }}>
              <View style={styles.titleContainer}>
                <View style={styles.notice}>
                  <Text style={styles.noticeText}>
                    {t('parkingPhoto.text1')}
                  </Text>
                </View>
              </View>

              <View style={styles.titleContainer}>
                <View style={[styles.notice]}>
                  <Text style={styles.noticeText}>
                    {t(`parkingPhoto.text2`)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Button onPress={this.takePicture}
            textStyle={textStyles.mainButton}
            style={[
              buttonsStyle.bigCircle, buttonsPosition.mainBottom,
              {
                backgroundColor: customColors.davRed,
                borderWidth: 0,
                borderColor: customColors.white,
              },
            ]}
            icon={camera} />
          <Spinner isVisible={requestStatus === RequestStatus.pending} />
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: customSizes.spaceFluidSmall,
    paddingHorizontal: customSizes.spaceFluidSmall,
  },
  preview: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  captureButton: {
    borderRadius: customSizes.space * 2,
    borderWidth: 3,
    position: 'absolute',
    bottom: customSizes.space,
    right: customSizes.space,
    width: customSizes.space * 4,
    height: customSizes.space * 4,
    borderColor: '#fff',
    backgroundColor: '#fb5d70',
    justifyContent: 'space-around',
  },
  captureButtonText: {
    color: '#d6d7da',
    textAlign: 'center',
    fontSize: 15,
  },
  notice: {
    borderRadius: 3,
    padding: customSizes.space / 2,
    height: customSizes.space * 2,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
  },
  noticeText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 15,
  },
});

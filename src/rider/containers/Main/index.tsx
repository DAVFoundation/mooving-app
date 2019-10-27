import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import { inject, observer } from 'mobx-react/native';
import { NavigationScreenProp } from 'react-navigation';
import { VehicleStore } from '../../stores/VehicleStore';
import { AccountStore } from '../../stores/AccountStore';
import { translate } from 'react-i18next';
import Map from '../../components/Map';
import { STORE_VEHICLE, STORE_ACCOUNT, STORE_APP } from '../../constants';
import { customColors, customSizes } from '../../../common/styles/variables';
import firebase from 'react-native-firebase';
import Button, { buttonsStyle, buttonsPosition } from '../../../common/components/Button';
import { textStyles } from '../../../common/styles';
import OpenAppSettings from 'react-native-app-settings';
import MainMenu from '../../components/MainMenu';
import { InteractiveModal } from '../../../common/components/InteractiveModal';
import { AppStore } from '../../../owner/stores/AppStore';
import DavToken from '../../components/DavToken';

interface IMainProps {
  [STORE_APP]: AppStore;
  [STORE_ACCOUNT]: AccountStore;
  [STORE_VEHICLE]: VehicleStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

interface IMainSate {
  openedCallout: any;
}

@translate('translations')
@inject(STORE_VEHICLE, STORE_ACCOUNT, STORE_APP)
@observer
export default class Main extends React.Component<IMainProps, IMainSate> {
  private markers: any;
  private willBlurSubscription: any;
  private didFocusSubscription: any;

  constructor(props: IMainProps) {
    super(props);
    this.state = {
      openedCallout: null,
    };
    this.refMarker = this.refMarker.bind(this);
    this.selectMarker = this.selectMarker.bind(this);
    this.closeOpenedCallout = this.closeOpenedCallout.bind(this);
    this.markers = {};
  }

  public componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener(
      'didFocus', () => this.props[STORE_VEHICLE].createSearchVehiclesSubscriptionIfNotExist(),
    );
    this.willBlurSubscription = this.props.navigation.addListener(
      'willBlur', () => this.props[STORE_VEHICLE].stopSearchForVehicles(),
    );
    const { sendLocationAnalytics } = this.props[STORE_ACCOUNT];
    sendLocationAnalytics();
    this.props[STORE_VEHICLE].createSearchVehiclesSubscriptionIfNotExist();
  }

  public componentWillUnmount() {
    this.willBlurSubscription.remove();
    this.didFocusSubscription.remove();
    this.props[STORE_VEHICLE].stopSearchForVehicles();
  }

  public async componentWillReact() {
    const { sendMainMapAnalytics } = this.props[STORE_VEHICLE];
    await sendMainMapAnalytics();
  }

  public selectMarker(qrCode: string, index: number) {
    const marker = this.markers[index];
    this.setState({ openedCallout: marker });
    const vehicleData = this.props[STORE_VEHICLE].vehicles[qrCode];
    if (vehicleData) {
      firebase.analytics().logEvent('scooter_marker_opened', {
        status: vehicleData.status,
        batteryLevel: vehicleData.batteryLevel,
        vehicleId: qrCode,
      });
    }
  }

  public closeOpenedCallout() {
    if (this.state.openedCallout) {
      this.state.openedCallout.hideCallout();
      firebase.analytics().logEvent('scooter_icon_closed');
      this.setState({ openedCallout: null });
    }
  }

  public refMarker(marker: any, qrCode: string) {
    this.markers[qrCode] = marker;
  }

  public openAppSettings = () => {
    if (OpenAppSettings) {
      this.props[STORE_APP].dismissLocationPermissionAlert();
      OpenAppSettings.open();
    }
  }

  public generateMarkers() {
    const { vehicles } = this.props[STORE_VEHICLE];
    return Object.values(vehicles).map((vehicle: any, index: number) => {
      const { location, batteryLevel, qrCode } = vehicle;
      const { latitude, longitude } = location;
      return {
        location: { latitude, longitude },
        batteryLevel,
        qrCode,
        index,
        selectMarker: this.selectMarker,
        refMarker: this.refMarker,
      };
    });
  }

  public navigateToAccount = () => this.props.navigation.navigate('Account');

  public navigateToUnlock = () => this.props.navigation.navigate('Unlock');

  public render() {
    const { t } = this.props;
    const {
      dismissLocationPermissionAlert,
      locationPermission,
      locationPermissionRequested,
      locationPermissionAlertShowed,
    } = this.props[STORE_APP];
    const davBalance = this.props[STORE_ACCOUNT].davBalance;
    const userGotDavReward = this.props[STORE_ACCOUNT].userGotDavReward;
    const showLocationPermissionModal =
      !locationPermission &&
      locationPermissionRequested &&
      !locationPermissionAlertShowed;
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.containerButtons} pointerEvents='box-none'>
          <View>
            <MainMenu navigation={this.props.navigation}/>
            <DavToken tokenBalance={davBalance} userGotDavReward={userGotDavReward}/>
          </View>
          <Button onPress={this.navigateToUnlock}
            style={[buttonsStyle.bigCircle, buttonsPosition.mainBottom, {backgroundColor: customColors.davRed}]}
            textStyle={[textStyles.mainButton, {color: customColors.white}]}
            text={t('ride.unlockRide')}/>
        </SafeAreaView>
        <Map
          clusteringEnabled
          data={this.generateMarkers()}
          onPressMap={this.closeOpenedCallout}
          navigation={this.props.navigation}
          updateMapCenter
        />
        <InteractiveModal
          isOpen={showLocationPermissionModal}
          submit={this.openAppSettings}
          cancel={dismissLocationPermissionAlert}
          title={t('locationPermissionModal.title')}
          text={t('locationPermissionModal.text')}
          buttonApproveStyle={{
            backgroundColor: customColors.black,
            borderColor: customColors.black,
          }}
          buttonApproveText={t('locationPermissionModal.buttonApprove')}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  containerButtons: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  tooltip: {
    borderRadius: 3,
    padding: 5,
    flexDirection: 'row',
    backgroundColor: customColors.blackTransparent,
    marginBottom: 5,
  },
  markerIcon: {
    resizeMode: 'contain',
    flex: 1,
    height: customSizes.main,
    width: customSizes.main,
    ...Platform.select({
      ios: {
        shadowColor: customColors.grey2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

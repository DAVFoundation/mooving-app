import React from 'react';
import {
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { inject, observer } from 'mobx-react/native';
import { NavigationScreenProp } from 'react-navigation';
import { RideStore } from '../../stores/RideStore';
import { translate } from 'react-i18next';
import Map from '../../components/Map';
import { STORE_RIDE } from '../../constants';
import { customColors, customSizes, textStyles } from '../../../common/styles';
import RideStats from '../../components/RideStats';
import Firebase from 'react-native-firebase';
import { getStatusBarHeight, ifIphoneX } from 'react-native-iphone-x-helper';
import Button, { buttonsStyle, buttonsPosition } from '../../../common/components/Button';
import HelpSection from '../../components/HelpSection';
import { RIDE_STATE } from '../../constants/ride';

interface IRideProps {
  [STORE_RIDE]: RideStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

@translate('translations')
@inject(STORE_RIDE)
@observer
export default class Ride extends React.Component<IRideProps> {
  constructor(props: IRideProps) {
    super(props);
    this.endRide = this.endRide.bind(this);
  }

  public componentDidMount() {
    Firebase.analytics().logEvent('saw_ride_in_progress_screen');
  }

  public endRide() {
    Firebase.analytics().logEvent('end_ride_button_clicked');
    this.props[STORE_RIDE].setRideState(RIDE_STATE.ENDING);
    const { navigate } = this.props.navigation;
    navigate('ParkingPhoto');
  }

  public render() {
    const { startTimeRideForTimer, distance, endTime, batteryLevel, supportInfo, riderId, vehicleId } = this.props[
      STORE_RIDE
    ];
    const { t } = this.props;
    return (
      <SafeAreaView style={style.container}>
        <RideStats
          startTime={startTimeRideForTimer || new Date()}
          distance={distance}
          batteryLevel={batteryLevel}
          endTime={endTime}
          style={style.rideStats}
        />
        <HelpSection riderId={riderId} vehicleId={vehicleId} supportInfo={supportInfo}/>
        <Map
          userLocationIcon={
            <Image
              style={{
                width: customSizes.iconButton / 1.5,
                height: customSizes.iconButton / 1.5,
              }}
              source={require('../../../common/assets/glyphs/glyph-userlocation_blue-medium.png')}
            />
          }
        />
        <Button onPress={this.endRide}
          style={[buttonsStyle.bigCircle, buttonsPosition.mainBottom, {backgroundColor: customColors.davRed}]}
          textStyle={[textStyles.mainButton, {color: customColors.white}]}
          text={t('ride.endRideButton')}/>
      </SafeAreaView>
    );
  }
}

const style = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  lockButton: {
    position: 'absolute',
    bottom: customSizes.main / 2,
    right: customSizes.main / 2,
    backgroundColor: customColors.davRed,
  },
  rideStats: {
    zIndex: 2,
    position: 'absolute',
    right: customSizes.spaceFluidSmall,
    top: customSizes.spaceFluidSmall,
    ...ifIphoneX(
      {
        top: customSizes.spaceFluidBig,
        marginTop: getStatusBarHeight(),
      },
      {
        top: customSizes.spaceFluidBig,
      },
    ),
  },
});

import React from 'react';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import Main from './containers/Main';
import Account from './containers/Account';
import LoginStep1 from './containers/Login/Phone';
import LoginStep2 from './containers/Login/CodeVerification';
import Unlock from './containers/Unlock';
import ParkingPhoto from './containers/ParkingPhoto';
import VehicleDetails from './containers/VehicleDetails';
import Onboarding from '../rider/containers/Onboarding';
import Ride from './containers/Ride';
import RideSummary from './containers/RideSummary';
import RideHistory from './containers/RideHistory';
import SplashScreen from '../common/components/SplashScreen';
import { RIDE_APP_PLAY_STORE_URI, RIDE_APP_APP_STORE_URI } from '../common/constants';

const navigator = createStackNavigator(
  {
    VehicleDetails: {
      screen: VehicleDetails,
      navigationOptions: () => ({
        gesturesEnabled: false,
      }),
    },
    SplashScreen: {
      screen: (props: any) => <SplashScreen {...props}
                                iosStoreLink={RIDE_APP_APP_STORE_URI}
                                androidStoreLink={RIDE_APP_PLAY_STORE_URI}/>,
    },
    Onboarding: {
      screen: Onboarding,
    },
    Unlock: {
      screen: Unlock,
      navigationOptions: () => ({
        gesturesEnabled: false,
      }),
    },
    Ride: {
      screen: Ride,
    },
    RideSummary: {
      screen: RideSummary,
    },
    Main: {
      screen: Main,
    },
    RideHistory: {
      screen: RideHistory,
    },
    Login: {
      screen: LoginStep1,
    },
    CodeVerification: {
      screen: LoginStep2,
    },
    Account: {
      screen: Account,
      navigationOptions: () => ({
        title: `Account`,
        gestureDirection: 'inverted',
      }),
    },
    ParkingPhoto: {
      screen: ParkingPhoto,
      navigationOptions: () => ({
        gesturesEnabled: false,
      }),
    },
  },
  {
    initialRouteName: 'SplashScreen',
    headerMode: 'none',
    transitionConfig: () => ({
      screenInterpolator: sceneProps => {
        const { layout, position, scene, scenes } = sceneProps;
        const { index, route } = scene;
        const width = layout.initWidth;
        if (route.routeName === 'Login') {
          return fade(sceneProps);
        } else {
          return {
            transform: [{
              translateX: position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [width, 0, -width],
              }),
            }],
          };
        }
      },
    }),
  },
);

const fade = (props: any) => {
  const { position, scene } = props;

  const index = scene.index;

  const translateX = 0;
  const translateY = 0;

  const opacity = position.interpolate({
    inputRange: [index - 0.7, index, index + 0.7],
    outputRange: [0.3, 1, 0.3],
  });

  return {
    opacity,
    transform: [{ translateX }, { translateY }],
  };
};

export default createAppContainer(navigator);

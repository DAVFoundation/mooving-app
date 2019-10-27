import React from 'react';
import { createAppContainer, createStackNavigator, createMaterialTopTabNavigator } from 'react-navigation';
import Main from './containers/Main';
import Account from './containers/Account';
import Vehicles from './containers/Vehicles';
import Header from './components/Header';
import LoginStep1 from './containers/Login/Phone';
import LoginStep2 from './containers/Login/CodeVerification';
import SplashScreen from '../common/components/SplashScreen';
import { customColors } from '../common/styles';
import { OWNER_APP_PLAY_STORE_URI, OWNER_APP_APP_STORE_URI } from '../common/constants';

const main = createMaterialTopTabNavigator(
  {
    Vehicles: {
      screen: Vehicles,
    },
    Dashboard: {
      screen: Main,
      navigationOptions: {
        swipeEnabled: true,
      },
    },
    Account: {
      screen: Account,
    },
  },
  {
    lazy: true,
    animationEnabled: true,
    useNativeDriver: true,
    initialRouteName: 'Dashboard',
    swipeEnabled: true,
    order: ['Account', 'Dashboard', 'Vehicles'],
    tabBarComponent: Header,
  },
);

const stackNavigator = createStackNavigator(
  {
    SplashScreen: {
      screen: (props: any) => <SplashScreen { ...props }
                                style={{backgroundColor: customColors.black}}
                                iosStoreLink={OWNER_APP_APP_STORE_URI}
                                androidStoreLink={OWNER_APP_PLAY_STORE_URI}/>,
    },
    Main: {
      screen: main,
    },
    Login: {
      screen: LoginStep1,
    },
    CodeVerification: {
      screen: LoginStep2,
    },
  },
  {
    initialRouteName: 'SplashScreen',
    headerMode: 'none',
  },
);

export default createAppContainer(stackNavigator);

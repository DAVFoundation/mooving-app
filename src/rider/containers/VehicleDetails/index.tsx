import React from 'react';
import { View, Text, Animated, BackHandler, SafeAreaView } from 'react-native';
import {
  NavigationScreenProp,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import { inject, observer } from 'mobx-react/native';
import { STORE_VEHICLE, STORE_RIDE, STORE_ACCOUNT } from '../../constants';
import { VehicleStore } from '../../stores/VehicleStore';
import { RideStore } from '../../stores/RideStore';
import { translate } from 'react-i18next';
import BatteryLevel from '../../../common/components/BatteryLevel';
import VehicleImage from '../../components/VehicleImage';
import { AccountStore } from '../../stores/AccountStore';
import Styles from './styles';
import AnimatedView from '../../../common/components/AnimatedView';
import { customColors, textStyles, customSizes } from '../../../common/styles';
import Firebase from 'react-native-firebase';
import Spinner from '../../../common/components/Spinner';
import PaymentForm from '../../components/PaymentForm';
import { RequestStatus } from '../../../common/lib/types';
import { ErrorModal } from '../../../common/components/ErrorModal';
import Button, { buttonsStyle, buttonsPosition } from '../../../common/components/Button';
import { arrowBackwardWhite } from '../../../common/components/Icons';
import currencySymbolMap from '../../../common/lib/currencySymbolMap';
import { RIDE_STATE } from '../../constants/ride';

interface IVehicleDetailsProps {
  [STORE_ACCOUNT]: AccountStore;
  [STORE_VEHICLE]: VehicleStore;
  [STORE_RIDE]: RideStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

enum ComponentState {
  start = 'start',
  openPaymentForm = 'openPaymentForm',
  unlocking = 'unlocking',
  unlockInitiated = 'unlockInitiated',
  unlocked = 'unlocked',
  error = 'error',
}

interface IVehicleDetailsState {
  mainColor: any;
  componentState: ComponentState;
}

@translate('translations')
@inject(STORE_VEHICLE, STORE_RIDE, STORE_ACCOUNT)
@observer
export default class VehicleDetails extends React.Component<
  IVehicleDetailsProps,
  IVehicleDetailsState
> {
  public vehicleCode: string;

  constructor(props: IVehicleDetailsProps) {
    super(props);
    this.state = {
      mainColor: new Animated.Value(0),
      componentState: ComponentState.start,
    };
    this.vehicleCode = props.navigation.getParam('vehicleCode');
    this.start = this.start.bind(this);
  }

  public componentDidMount() {
    const vehicle = this.props[STORE_VEHICLE].getVehicle(this.vehicleCode);
    if (this.vehicleCode && vehicle && vehicle.batteryLevel) {
      Firebase.analytics().logEvent('saw_vehicle_details_screen', {
        vehicleId: this.vehicleCode,
        vehicleBattery: vehicle.batteryLevel,
      });
    } else {
      this.dropStackNavigationAndNavigateTo('Unlock');
    }
  }

  public dropStackNavigationAndNavigateTo = (routeName: string) => {
    BackHandler.removeEventListener('hardwareBackPress', this.disableNativeBack);
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  public closeErrorModalAndNavigateToMain = () => {
    this.props[STORE_RIDE].resetRequestStatus();
    this.props[STORE_VEHICLE].resetRequestStatus();
    this.dropStackNavigationAndNavigateTo('Main');
  }

  public async componentWillReact() {
    const { startTime, requestStatus } = this.props[STORE_RIDE];
    const { hasPayment } = this.props[STORE_ACCOUNT];
    if (this.state.componentState === ComponentState.unlocking && hasPayment) {
      this.startWithPayment();
    }
    if (requestStatus === RequestStatus.error) {
      this.setState({ componentState: ComponentState.error });
    }
    if (startTime) {
      this.setState({ componentState: ComponentState.unlocked });
      this.animateBackgroundColor();
      setTimeout(() => { // timeout is for the green background
        this.props[STORE_RIDE].setRideState(RIDE_STATE.INRIDE);
        this.dropStackNavigationAndNavigateTo('Ride');
      }, 1000);
    }
  }

  public async start() {
    const { componentState } = this.state;
    if (componentState !== ComponentState.start) {
      return;
    }
    Firebase.analytics().logEvent('start_ride_button_clicked');
    const { hasPayment } = this.props[STORE_ACCOUNT];
    try {
      if (!hasPayment) {
        if (!this.props[STORE_ACCOUNT].paymentToken) {
          this.props[STORE_ACCOUNT].dismissPaymentError();
        }
        this.setState({componentState: ComponentState.openPaymentForm});
      } else {
        this.setState({ componentState: ComponentState.unlocking });
        this.startWithPayment();
      }
    } catch (err) {
      /* */
    }
  }

  public startAfterPaymentForm = () => {
    this.props[STORE_ACCOUNT].setCreditCard();
    this.setState({componentState: ComponentState.unlocking});
  }

  public closePaymentModalWithNoRide = () => {
    this.setState({ componentState: ComponentState.start });
  }

  public disableNativeBack = () => true;

  public startWithPayment = () => {
    BackHandler.addEventListener('hardwareBackPress', this.disableNativeBack);
    this.setState({ componentState: ComponentState.unlockInitiated });
    this.props[STORE_RIDE].setRideState(RIDE_STATE.STARTING);
    this.props[STORE_RIDE].unlockVehicle(this.vehicleCode);
  }

  public animateBackgroundColor() {
    Animated.timing(this.state.mainColor, {
      toValue: 300,
      duration: 500,
    }).start();
  }

  public subscribeToStores() {
    const { requestStatus, startTime } = this.props[STORE_RIDE];
    const { hasPayment } = this.props[STORE_ACCOUNT];
  }

  public cancelRide = () => {
    this.props[STORE_ACCOUNT].dismissPaymentError();
    this.setState({
      componentState: ComponentState.start,
    });
  }

  public render() {
    this.subscribeToStores();
    const interpolateColor = this.state.mainColor.interpolate({
      inputRange: [0, 300],
      outputRange: [customColors.davRed, customColors.davGreen],
    });
    const animatedBackgroundColor = {
      backgroundColor: interpolateColor,
    };
    const vehicle = this.props[STORE_VEHICLE].getVehicle(this.vehicleCode);
    const { paymentToken, paymentError } = this.props[STORE_ACCOUNT];
    const { navigation, t } = this.props;
    const { componentState } = this.state;
    if (!vehicle) {
      return <View/>;
    }
    return (
      <View style={Styles.container}>
        <PaymentForm visible={componentState === ComponentState.openPaymentForm}
          submitData={this.startAfterPaymentForm}
          cancel={this.closePaymentModalWithNoRide}
          paymentToken={paymentToken}/>
        <ErrorModal
          title={t('account.paymentErrorModal.title')}
          text={t('account.paymentErrorModal.text')}
          isOpen={paymentError}
          closeErrorModal={this.cancelRide}
          buttonText={t('account.paymentErrorModal.buttonText')}
        />
        <SafeAreaView style={Styles.mainSection}>
          <View style={Styles.mainSectionContent}>
            <Button
              style={[ buttonsStyle.smallCircle,
                       {
                         backgroundColor: customColors.whiteTransparent,
                       },
                     ]}
              disabled={componentState !== ComponentState.start}
              icon={arrowBackwardWhite}
              onPress={() => navigation.replace('Unlock')}/>
            <Text
            adjustsFontSizeToFit numberOfLines={1} ellipsizeMode='tail'
            style={[textStyles.h2, Styles.title]}>
              {vehicle.model}
            </Text>
            <Text style={[textStyles.paragraph,
                          {
                            color: customColors.white,
                            marginBottom: customSizes.space,
                          }]}>
              By {vehicle.operatorName}
            </Text>
            <BatteryLevel batteryLevel={vehicle.batteryLevel} />
            <VehicleImage imageUrl={vehicle.modelImageUrl} />
            <Text style={[textStyles.h3,
                          {
                            color: customColors.white,
                            marginTop: customSizes.space,
                            marginBottom: customSizes.space / 2,
                          }]}>
               Price
            </Text>
            <Text style={[textStyles.callout,
                          {
                            color: customColors.white,
                            marginBottom: customSizes.space / 4,
                          }]}>
              <Text style={{fontWeight: '800'}}>
                {vehicle.currencyCode ? currencySymbolMap[vehicle.currencyCode] : '$'}{vehicle.basePrice}
              </Text>
              <Text> unlock fee +</Text>
            </Text>
            <Text style={[textStyles.callout,
                          {
                            color: customColors.white,
                          }]}>
              <Text style={{fontWeight: '800'}}>
                {vehicle.currencyCode ? currencySymbolMap[vehicle.currencyCode] : '$'}{vehicle.pricePerMinute}
              </Text>
              <Text>/minute</Text>
            </Text>
          </View>
        </SafeAreaView>
        {
          componentState !== ComponentState.error ?
          <Spinner isVisible={componentState === ComponentState.unlocking || componentState === ComponentState.unlockInitiated}/>
          :
          <ErrorModal isOpen={ componentState === ComponentState.error }
                      title={t('errors.unableToUnlock.title')}
                      text={t('errors.unableToUnlock.text')}
                      closeErrorModal={this.closeErrorModalAndNavigateToMain} />
        }
        <AnimatedView
          style={[Styles.topMenu, Styles.topCircle, animatedBackgroundColor]}
          from={Styles.topMenuFrom}
          to={Styles.topMenuTo}
          duration={600}
          start>
        </AnimatedView>
        <AnimatedView
          style={[Styles.bottomMenu, Styles.bottomCircle]}
          from={Styles.bottomMenuFrom}
          to={Styles.bottomMenuTo}
          duration={600}
          start>
        </AnimatedView>
        <AnimatedView
          style={[buttonsPosition.mainBottom]}
          from={buttonsPosition.mainBottom}
          to={{bottom: -customSizes.window.height / 2}}
          duration={600}
          start={componentState === ComponentState.unlocked}>
          <Button onPress={this.start}
            style={[
              buttonsStyle.bigCircle,
              { backgroundColor: customColors.davRed },
            ]}
            textStyle={[textStyles.mainButton, {color: customColors.white}]}
            text={t(`unlock.vehicleDetails.button.${componentState}`)}/>
        </AnimatedView>
      </View>
    );
  }
}

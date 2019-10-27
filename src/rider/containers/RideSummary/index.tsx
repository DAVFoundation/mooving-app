import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { inject, observer } from 'mobx-react/native';
import {
  NavigationScreenProp,
} from 'react-navigation';
import { RideStore, PaymentMethod } from '../../stores/RideStore';
import { translate } from 'react-i18next';
import { STORE_RIDE, STORE_ACCOUNT } from '../../constants';
import RideStats from '../../components/RideStats';

import AnimatedBackground from './AnimatedBackground';
import firebase from 'react-native-firebase';
import {
  customColors,
  customSizes,
  customEasing,
  customFonts,
} from '../../../common/styles';
import RideFeedback from '../RideFeedback';
import AnimatedView from '../../../common/components/AnimatedView';
import { fadeOut, fadeIn } from '../../../common/styles/animations';
import {
  ifIphoneX, getStatusBarHeight,
} from 'react-native-iphone-x-helper';
import currencySymbolMap from '../../../common/lib/currencySymbolMap';
import { AccountStore } from '../../stores/AccountStore';
import PaymentMethodSelect from './PaymentMethodSelect';

interface IRideSummaryProps {
  [STORE_RIDE]: RideStore;
  [STORE_ACCOUNT]: AccountStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

interface IRideSummaryState {
  paymentMethod: PaymentMethod;
}

@translate('translations')
@inject(STORE_RIDE, STORE_ACCOUNT)
@observer
export default class RideSummary extends React.Component<IRideSummaryProps, IRideSummaryState> {

  private isDavPaymentAllow: boolean;

  constructor(props: IRideSummaryProps) {
    super(props);
    const { davBalance } = props[STORE_ACCOUNT];
    const { price, davRate } = this.props[STORE_RIDE];
    this.isDavPaymentAllow = !!davBalance && !!price && !!davRate &&
                             (davBalance > price / davRate);
    this.state = {
      paymentMethod: PaymentMethod.undefined,
    };
  }

  public componentDidMount() {
    this.props[STORE_ACCOUNT].getCreditCard();
    if (!this.isDavPaymentAllow) {
      this.props[STORE_RIDE].setRidePayment(PaymentMethod.fiat);
    }
    const { startTime, endTime, distance, price, batteryLevel } = this.props[
      STORE_RIDE
    ];
    firebase.analytics().logEvent('saw_ride_summary_screen', {
      startTime,
      endTime,
      distance,
      batteryLevel,
      price,
    });
  }

  public choosePaymentMethod = (method: PaymentMethod) => {
    this.setState({paymentMethod: method});
    this.props[STORE_RIDE].setRidePayment(method);
  }

  public renderCost() {
    const { price, currencyCode } = this.props[STORE_RIDE];
    const { t } = this.props;
    return (
      <Text style={{
        color: customColors.black,
        fontSize: 22,
        fontFamily: customFonts.montserratRegular,
      }}>
        {`${t('rideSummary.texts.cost')} `}
        <Text style={{ fontWeight: '800' }}>
          {`${currencyCode ? currencySymbolMap[currencyCode] : '$'}${price}`}
        </Text>
      </Text>
    );
  }

  public renderPaymentMethod() {
    const { paymentMethod } = this.props[STORE_ACCOUNT];
    const { t } = this.props;
    return (
      <Text style={{
        color: customColors.black,
        fontSize: 22,
        fontFamily: customFonts.montserratRegular,
        marginTop: customSizes.space / 2,
      }}>
        {`${t('rideSummary.texts.paid')} `}
        <Text style={{ fontWeight: '800' }}>
          {`**** ${paymentMethod && paymentMethod.last4}`}
        </Text>
      </Text>
    );
  }

  public renderText() {
    const { paymentMethod } = this.props[STORE_ACCOUNT];
    const { t } = this.props;
    if (this.isDavPaymentAllow) {
      switch (this.state.paymentMethod) {
        case PaymentMethod.undefined:
          return this.renderCost();
        case PaymentMethod.fiat:
          return (
            <Text style={{
              color: customColors.black,
              fontSize: 22,
              fontFamily: customFonts.montserratRegular,
              marginTop: customSizes.space / 2,
            }}>
            {`${t('rideSummary.texts.youPaid')} ****${paymentMethod && paymentMethod.last4}.`}
            </Text>
          );
        case PaymentMethod.dav:
          return (
            <Text style={{
              color: customColors.black,
              fontSize: 22,
              fontFamily: customFonts.montserratRegular,
              marginTop: customSizes.space / 2,
            }}>
            {`${t('rideSummary.texts.youPaid')} DAV coins.`}
            </Text>
          );
      }
    } else {
      return (
        <>
          { this.renderCost() }
          { this.renderPaymentMethod() }
        </>
      );
    }
  }

  public render() {
    const { startTime, endTime, distance } = this.props[STORE_RIDE];
    const { t } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <RideStats
            startTime={startTime}
            distance={distance}
            endTime={endTime}
            style={styles.rideStats}
          />
        </View>
        <AnimatedView
          from={fadeOut}
          to={fadeIn}
          delay={customSizes.window.height / 2}
          duration={customSizes.window.height / 2}
          easing={customEasing.EaseInOut}
          style={styles.fadeContainer}
          start>
          <View style={styles.contentBox}>
            <Text
              style={[{
                color: customColors.black,
                marginBottom: customSizes.space,
                fontFamily: customFonts.montserratBold,
                fontSize: 44,
              }]}>
              {t('rideSummary.title')}
            </Text>
            { this.renderText() }
          </View>
        </AnimatedView>
        {
          this.isDavPaymentAllow && this.state.paymentMethod === PaymentMethod.undefined ?
          <PaymentMethodSelect choosePaymentMethod={this.choosePaymentMethod}/>
          :
          <RideFeedback
            navigation={this.props.navigation}
          />
        }
        <AnimatedBackground />
      </SafeAreaView>
    );
  }
}

const topbarHeight = getStatusBarHeight();
const heightPage = customSizes.window.height - topbarHeight;
const heightContentBox = 180;
const offsetContentBox = (heightPage - heightContentBox) / 3;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: customColors.grey0,
  },
  header: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
  },
  rideStats: {
    zIndex: 2,
    position: 'absolute',
    right: customSizes.spaceFluidSmall,
    top: customSizes.spaceFluidSmall,
    ...ifIphoneX(
      {
        top: customSizes.spaceFluidSmall,
      },
      {
        top: customSizes.spaceFluidBig,
      },
    ),
  },
  fadeContainer: {
    height: heightPage,
  },
  contentBox: {
    paddingHorizontal: customSizes.spaceFluidSmall,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    height: heightContentBox,
    marginVertical: offsetContentBox,
  },
  contactUs: {
    marginVertical: customSizes.space,
  },
  rateButtons: {
    zIndex: 3,
    position: 'absolute',
    right: customSizes.spaceFluidSmall,
    bottom: customSizes.spaceFluidSmall,
  },
  rateText: {
    fontSize: 14,
    color: customColors.grey3,
    textAlign: 'center',
  },
});

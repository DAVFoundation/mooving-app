import React from 'react';
import { Component } from 'react';
import {
  Text,
  View,
  StatusBar,
  KeyboardAvoidingView,
  StyleSheet,
  Keyboard,
  EmitterSubscription,
} from 'react-native';
import { STORE_ACCOUNT, STORE_LOCATION } from '../../../constants';
import { AccountStore } from '../../../stores/AccountStore';
import { NavigationScreenProp } from 'react-navigation';
import AnimatedBackground from '../AnimatedBackground';
import PhoneInput from 'react-native-phone-input';
import { PhoneNumberUtil, AsYouTypeFormatter } from 'google-libphonenumber';
import { Platform } from 'react-native';
import { textStyles } from '../../../styles/typography';
import { customColors, customSizes } from '../../../styles/variables';
import { formStyles } from '../../../styles/forms';
import firebase from 'react-native-firebase';
import { LocationStore } from '../../../stores/LocationStore';
import {
  isIphoneX,
  getBottomSpace,
} from 'react-native-iphone-x-helper';
import Spinner from '../../../components/Spinner';
import { RequestStatus } from '../../../lib/types';
import Button, { buttonsStyle } from '../../../components/Button';
import { arrowForwardBlack } from '../../../components/Icons';
import { from } from 'rxjs';
import { Logger } from '../../../lib/logger';

interface ILoginProps {
  [STORE_ACCOUNT]: AccountStore;
  [STORE_LOCATION]: LocationStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

interface ILoginState {
  phoneInvalid: boolean;
  keyboardVisible: boolean;
}

const platform = Platform.OS;
const keyboardShowEvent = platform === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const keyboardHideEvent = platform === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

export default class Phone extends Component<ILoginProps, ILoginState> {
  private phone: any;
  private keyboardDidHideListener: EmitterSubscription | any;
  private keyboardDidShowListener: EmitterSubscription | any;

  constructor(props: ILoginProps) {
    super(props);
    this.state = {
      phoneInvalid: true,
      keyboardVisible: false,
    };
    this.validatePhone = this.validatePhone.bind(this);
    this.sendVerificationMessage = this.sendVerificationMessage.bind(this);
    this.renderPhoneInput = this.renderPhoneInput.bind(this);
  }

  protected sendVerificationMessage() {
    const { sendSMS } = this.props[STORE_ACCOUNT];
    const phoneNumber = this.phone.getValue();
    const countryCode = this.phone.getCountryCode();
    sendSMS(phoneNumber, countryCode);
  }

  protected validatePhone() {
    if (this.phone) {
      let phoneInvalid = true;
      if (this.phone.getValue() === '+972500000000') { // this is special case for test user
        phoneInvalid = false;
      } else { // this is validation for all phone numbers
        try {
          const phoneNumber = PhoneNumberUtil.getInstance().parseAndKeepRawInput(this.phone.getValue(), this.phone.getISOCode());
          phoneInvalid = !( PhoneNumberUtil.getInstance().isValidNumber(phoneNumber) );
        } catch (err) {
          Logger.log(err);
        }
      }
      this.setState({ phoneInvalid });
      if (!phoneInvalid) {
        firebase.analytics().logEvent('phone_number_entered');
      }
    }
  }

  protected formatPhoneNumber(phoneNumber: string, countryCode: string) {
    let formattedNumber = phoneNumber.trim();
    formattedNumber = formattedNumber.substring(countryCode.length + 1);
    if (formattedNumber[0] === '0') {
      formattedNumber = formattedNumber.substring(1);
    }
    return '+' + countryCode + formattedNumber;
  }

  public componentWillReact() {
    const { isLoginCodeSent } = this.props[STORE_ACCOUNT];
    if (isLoginCodeSent) {
      this.props.navigation.navigate('CodeVerification');
      this.props[STORE_ACCOUNT].resetLoginCode();
    }
  }

  public componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(keyboardShowEvent, this.keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener(keyboardHideEvent, this.keyboardDidHide);
    firebase.analytics().logEvent('saw_login_screen');
  }

  public componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  public keyboardDidShow = () => {
    this.setState({ keyboardVisible: true });
  }

  public keyboardDidHide = () => {
    this.setState({ keyboardVisible: false });
  }

  public renderPhoneInput(backgroundColor = customColors.black) {
    const { t } = this.props;
    const { countryCode } = this.props[STORE_LOCATION];
    const isIos = Platform.OS === 'ios';
    const isIphoneXorLarger = isIphoneX();
    return (
      <KeyboardAvoidingView
      style={styles.containerMain}
      behavior={isIos ? 'padding' : undefined}
      keyboardVerticalOffset={
        isIphoneXorLarger ? 0 : customSizes.spaceFluidSmall
      }>
      <Text
        adjustsFontSizeToFit={true}
        minimumFontScale={1}
        style={[
          textStyles.subtitle,
          {
            color: customColors.white,
            textAlign: 'center',
            paddingHorizontal: customSizes.spaceFluidSmall,
            marginBottom: customSizes.spaceFluidSmall,
            paddingTop: customSizes.spaceFluidBig,
          },
        ]}>
        {t('signup.phone.description')}
      </Text>
      <View style={ styles.bottomButtons }>
        <PhoneInput
          onChangePhoneNumber={this.validatePhone}
          style={formStyles.inputPhone}
          ref={(ref: any) => (this.phone = ref)}
          textProps={{ height: customSizes.main }}
          initialCountry={countryCode}
        />
        <View style={this.state.phoneInvalid ? styles.disabled : null}>
          <Button
            disabled={this.state.phoneInvalid}
            style={[ buttonsStyle.smallCircle,
                     { backgroundColor: customColors.white } ]}
            icon={arrowForwardBlack}
            onPress={this.sendVerificationMessage}/>
        </View>
      </View>
      <View style={[styles.containerMainBackground, {backgroundColor}]} />
    </KeyboardAvoidingView>
    );
  }

  public render() {
    const { requestStatus } = this.props[STORE_ACCOUNT];
    return (
      <View style={styles.container}>
        <Spinner isVisible={requestStatus === RequestStatus.pending} />
        <StatusBar />
        <AnimatedBackground/>
        { this.renderPhoneInput() }
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: customColors.grey0,
  },
  containerMain: {
    paddingHorizontal: customSizes.spaceFluidSmall,
  },
  containerMainBackground: {
    backgroundColor: customColors.black,
    width: customSizes.window.width * 3,
    height: customSizes.window.width * 3,
    left: -customSizes.window.width,
    top: 0,
    borderRadius: customSizes.window.width * 1.5,
    position: 'absolute',
    zIndex: -1,
  },
  bottomButtons: {
    display: 'flex',
    width: customSizes.window.width - customSizes.space * 2,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginBottom: isIphoneX() ? getBottomSpace() + customSizes.spaceFluidBig : customSizes.spaceFluidSmall,
  },
  disabled: {
    opacity: 0.35,
  },
});

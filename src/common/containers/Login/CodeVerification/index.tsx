import React, { createRef, Component } from 'react';

import {
  Text,
  View,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
  StatusBar,
  SafeAreaView,
  Platform,
  StyleSheet,
  Linking,
} from 'react-native';
import { inject, observer } from 'mobx-react/native';
import { STORE_ACCOUNT } from '../../../constants';
import { AccountStore } from '../../../stores/AccountStore';
import {
  NavigationScreenProp,
  StackActions,
  NavigationActions,
  NavigationNavigateAction,
} from 'react-navigation';
import Spinner from '../../../components/Spinner';

import { translate } from 'react-i18next';
import {
  formStyles,
  textStyles,
  customSizes,
  customColors,
} from '../../../styles';
import CodeInput from 'react-native-confirmation-code-field';
import { RequestStatus } from '../../../lib/types';
import firebase from 'react-native-firebase';
import { arrowBackwardWhite } from '../../../components/Icons';

import Button, { buttonsStyle } from '../../../components/Button';

import { ifIphoneX } from 'react-native-iphone-x-helper';

interface ILoginProps {
  [STORE_ACCOUNT]: AccountStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

interface ILoginState {
  isPhoneSubmitted: boolean;
  phoneInvalid: boolean;
  isKeyboardUp: boolean;
}

export default class CodeVerification<U extends ILoginProps> extends Component<ILoginProps, ILoginState> {
  private keyboardDidShowListener: any;
  private keyboardDidHideListener: any;

  constructor(props: U) {
    super(props);
    this.state = {
      isPhoneSubmitted: false,
      phoneInvalid: false,
      isKeyboardUp: true,
    };
    this.sendSMS = this.sendSMS.bind(this);
    this.onChanged = this.onChanged.bind(this);
    this.dropStackNavigationAndNavigateTo = this.dropStackNavigationAndNavigateTo.bind(this);
    this.navigateToLogin = this.navigateToLogin.bind(this);
  }

  public componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', () =>
      this.setState({ isKeyboardUp: true }),
    );
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
      this.setState({ isKeyboardUp: false }),
    );
  }

  public componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  public componentWillReact() {
    const { isLoggedIn, requestStatus, hasActiveRide } = this.props[STORE_ACCOUNT];
    if (requestStatus === RequestStatus.done && isLoggedIn()) {
      if (hasActiveRide) {
        this.dropStackNavigationAndNavigateTo('Ride');
      } else {
        this.dropStackNavigationAndNavigateTo('Main');
      }
    }
  }

  public dropStackNavigationAndNavigateTo(routeName: string, subAction?: NavigationNavigateAction) {
    // TODO: delete this method.
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName,
          params: {},
          action: subAction,
        }),
      ],
    });
    this.props.navigation.dispatch(resetAction);
  }

  public async verifyCode(code: string) {
    const { verifyCode } = this.props[STORE_ACCOUNT];
    verifyCode(code);
  }

  public async onChanged(text: string) {
    if (text.length === 4) {
      this.verifyCode(text);
    }
  }

  public getInputProps = () => ({
    keyboardType: 'numeric',
    style: formStyles.inputCode,
  })

  public navigateToLogin() {
    const { pop } = this.props.navigation;
    pop();
  }

  public sendSMS() {
    const { sendSMS } = this.props[STORE_ACCOUNT];
    firebase.analytics().logEvent('resend_sms_validation_code');
    sendSMS();
  }

  public cellProps = (props: any) => {
    if (props.hasValue) {
      return {
        style: [formStyles.inputCode, formStyles.inputNotEmpty],
      };
    }

    return {
      style: formStyles.inputCode,
    };
  }

  public render() {
    const { t } = this.props;
    const { requestStatus, phoneNumber } = this.props[STORE_ACCOUNT];
    const isIos = Platform.OS === 'ios';

    const offset = () => {
      if (isIos) {
        return customSizes.spaceFluidSmall;
      } else {
        return customSizes.main / 2;
      }
    };

    return (
      <SafeAreaView style={styles.wrapperPage}>
        <StatusBar />
        <Spinner isVisible={requestStatus === RequestStatus.pending} />
        <KeyboardAvoidingView
          behavior={isIos ? 'padding' : undefined}
          keyboardVerticalOffset={offset()}
          style={styles.avoidingContainer}
          enabled>
          <View style={styles.containerPage}>
            <View
              style={{
                flex: 1,
                justifyContent: 'space-around',
              }}>
              <View style={styles.header}>
                <Text
                  style={[
                    textStyles.h2Responsive,
                    {
                      color: customColors.black,
                      marginBottom: customSizes.space / 2,
                    },
                  ]}>
                  {t('signup.code.title')}
                </Text>
                <Text
                  style={[
                    textStyles.paragraph,
                    { color: customColors.black },
                  ]}>
                  {`${t('signup.code.text')} ${phoneNumber}`}
                </Text>
                {
                  requestStatus === RequestStatus.error &&
                  !this.state.isKeyboardUp ? (
                  <View style={styles.stateFeedback}>
                    <Text
                      style={[
                        textStyles.paragraph,
                        { color: customColors.white, textAlign: 'center' },
                      ]}>
                      {t('signup.phone.error')}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  marginTop: -customSizes.main / 2,
                }}>
                <CodeInput
                  ref={createRef()}
                  inputPosition='center'
                  codeLength={4}
                  keyboardType='numeric'
                  autoFocus={true}
                  cellProps={this.cellProps}
                  containerProps={{ style: { maxHeight: customSizes.main } }}
                  activeColor='#000000'
                  inactiveColor='#EDEDED'
                  space={10}
                  cellBorderWidth={2}
                  size={customSizes.main}
                  variant='border-circle'
                  onFulfill={this.onChanged}
                />
              { this.renderTermsAndConditions() }
              </View>
            </View>
            <View
              style={[
                styles.bottomButtons,
                {
                  marginBottom: 0,
                },
              ]}>
              <Button
                style={[ buttonsStyle.mediumCircle, {backgroundColor: customColors.black} ]}
                icon={arrowBackwardWhite}
                onPress={this.navigateToLogin}/>
              <TouchableOpacity onPress={this.sendSMS}>
                <Text
                  style={[
                    textStyles.button,
                    { color: customColors.black, marginRight: 10 },
                  ]}>
                  Resend code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

export const styles = StyleSheet.create({
  header: {
    top: customSizes.spaceFluidSmall,
    marginTop: customSizes.spaceFluidSmall,
    paddingBottom: customSizes.main,
  },
  wrapperPage: {
    flex: 1,
    backgroundColor: customColors.grey0,
  },
  containerPage: {
    flex: 1,
    paddingHorizontal: customSizes.spaceFluidSmall,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    ...Platform.select({
      android: {
        paddingBottom: customSizes.spaceFluidSmall,
      },
    }),
  },
  avoidingContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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
  stateFeedback: {
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: customSizes.space,
    backgroundColor: customColors.davOrangeSecondary,
    padding: customSizes.space / 2,
    borderRadius: 5,
  },
  bottomButtons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        ...ifIphoneX(
          {
            marginBottom: customSizes.spaceFluidBig,
          },
          {
            marginBottom: 0,
          },
        ),
      },
      android: {
        marginBottom: 0,
      },
    }),
  },
  disabled: {
    backgroundColor: customColors.grey2,
    opacity: 0.35,
  },
});

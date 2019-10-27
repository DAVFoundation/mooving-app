import React, { Component } from 'react';
import {
  Text,
  SafeAreaView,
  StyleSheet,
  View,
  Keyboard,
  Animated,
  WebView,
} from 'react-native';
import { translate } from 'react-i18next';
import {
  customColors, customSizes, textStyles, customEasing,
} from '../../../common/styles';
import Config from '../../../common/lib/config';
import PatchPostMessageCode from './PatchPostMessageCode';
import { crossWhite } from '../../../common/components/Icons';
import Spinner from '../../../common/components/Spinner';
import firebase from 'react-native-firebase';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { Api } from '../../lib/api';

interface IPaymentFormProps {
  cancel: () => void;
  submitData: () => void;
  visible: boolean;
  paymentToken?: string;
  t?(key: string, options?: any): string;
}

interface IPaymentFormState {
  isLoadingCompleted: boolean;
  style: any;
  isSubmitInProgress: boolean;
}

interface IAddCreditCardData {
  status: string;
  details: [
    {
      tagId: string;
      errorCode: string;
      errorDescription: string,
      eventType: string;
    }
  ];
}

const apiUrl = Config.getInstance().getEnvironment().API_URL;

const errorCodeToEvent: {[errorCode: string]: string} = {
    '002': 'invalid_or_empty_CVV',
    '003': 'invalid_empty_date',
    '22013': 'unsupported_card',
    '400': 'session_expired',
    'default': 'internal_server_error',
};

@translate('translations')
export default class PaymentForm extends Component<IPaymentFormProps, IPaymentFormState> {

  public webView: any;
  public isMessageSent = false;

  constructor(props: IPaymentFormProps) {
    super(props);
    this.state = {
      isLoadingCompleted: false,
      isSubmitInProgress: false,
      style: {
        keyboardScale: new Animated.Value(0.75),
        keyboardTranslateX: new Animated.Value(20),
        keyboardTranslateY: new Animated.Value(-50),
        formTranslateY: new Animated.Value(-75),
        buttonPosition: new Animated.Value(customSizes.window.height / 2),
      },
    };
  }

  public shouldComponentUpdate(newProps: IPaymentFormProps, newState: IPaymentFormState) {
    if (newProps.paymentToken !== this.props.paymentToken) {
      this.isMessageSent = false;
    }
    return (newState.isLoadingCompleted !== this.state.isLoadingCompleted) ||
           (newState.isSubmitInProgress !== this.state.isSubmitInProgress) ||
           (newProps.paymentToken !== this.props.paymentToken) ||
           (newProps.visible !== this.props.visible);
  }

  public sendToken() {
    if (!this.isMessageSent) {
      this.setState({isLoadingCompleted: false});
      const message = JSON.stringify({
        type: 'token',
        token: this.props.paymentToken,
      });
      this.webView.postMessage(message);
      this.isMessageSent = true;
    }
  }

  public sendSubmit() {
    this.setState({isSubmitInProgress: true}, () => {
      const message = JSON.stringify({
        type: 'submit',
      });
      this.webView.postMessage(message);
    });
  }

  public onMessage(message: any) {
    const data: IAddCreditCardData = JSON.parse(message.nativeEvent.data);
    switch (data.status) {
      case 'submitted':
        this.props.submitData();
        Keyboard.dismiss();
        firebase.analytics().logEvent('credit_card_added_successfully');
        break;
      case 'loading-completed':
        this.setState({isLoadingCompleted: true});
        break;
      case 'token-expired':
        this.sendToken();
        break;
      case 'error':
        this.setState({isSubmitInProgress: false});
        data.details.forEach(error => {
          firebase.analytics().logEvent(`credit_card_${errorCodeToEvent[error.errorCode] || errorCodeToEvent[`default`]}`);
        });
        break;
    }
  }

  public back() {
    this.isMessageSent = false;
    this.props.cancel();
  }

  public render() {
    const { t, visible, paymentToken } = this.props;
    if (visible && paymentToken) {
      return (
        <SafeAreaView style={styles.container}>
          <Spinner isVisible={!this.state.isLoadingCompleted} />
          <Button
            style={[buttonsStyle.smallCircle, styles.closeButton]}
            icon={crossWhite}
            onPress={this.back.bind(this)}/>
        <Animated.View style={{
                transform: [
                  {translateX: this.state.style.keyboardTranslateX},
                  {translateY: this.state.style.keyboardTranslateY},
                  {scale: this.state.style.keyboardScale}],
              }}>
          <Text
            style={[
              textStyles.h2Responsive,
              {marginLeft: customSizes.spaceFluidSmall},
            ]}>
            {t('account.paymentForm.title')}
          </Text>
        </Animated.View>
          <View style={{height: customSizes.space * 2}} />
          <Animated.View style={{
            height: 160,
            transform: [{translateY: this.state.style.formTranslateY}],
          }}>
            <WebView
              useWebKit={true}
              bounces={false}
              scrollEnabled={false}
              style={{backgroundColor: 'transparent'}}
              injectedJavaScript={PatchPostMessageCode}
              onLoadEnd={this.sendToken.bind(this)}
              onMessage={this.onMessage.bind(this)}
              ref={(webView: any) => this.webView = webView}
              source={Api.getInstance().getPaymentFormRequest()}/>
          </Animated.View>
          <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              position: 'absolute',
              right: 0,
              top: customSizes.window.height / 2 - customSizes.main / 2,
            }}>
            <Button style={[buttonsStyle.secondary, {
              marginRight: customSizes.space,
              width: customSizes.main * 2,
            }]}
            disabled={this.state.isSubmitInProgress}
            onPress={this.sendSubmit.bind(this)}
            text='Add'
            textStyle={textStyles.button}/>
          </View>
        </SafeAreaView>
      );
    } else {
      return <View/>;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    zIndex: 11,
    backgroundColor: customColors.grey0,
  },
  errorMessage: {
    color: customColors.davRed,
  },
  closeButton: {
    backgroundColor: customColors.blackTransparent,
    marginLeft: customSizes.spaceFluidSmall,
    marginTop: customSizes.spaceFluidSmall,
    marginBottom: customSizes.spaceFluidSmall,
  },
});

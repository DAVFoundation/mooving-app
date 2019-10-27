import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { inject, observer } from 'mobx-react/native';
import { STORE_ACCOUNT, STORE_VEHICLE } from '../../constants';
import { AccountStore } from '../../stores/AccountStore';
import { translate } from 'react-i18next';
import Spinner from '../../../common/components/Spinner';
import CreditCardLogo from '../../../common/components/CreditCardLogo';
import { RequestStatus } from '../../../common/lib/types';
import { VehicleStore } from '../../stores/VehicleStore';
import {
  textStyles,
  customColors,
  customSizes,
  formStyles,
} from '../../../common/styles';
import { SafeAreaView } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import firebase from 'react-native-firebase';
import { InteractiveModal } from '../../../common/components/InteractiveModal';
import PaymentForm from '../../components/PaymentForm';
import AccountPage, {
  IAccountProps as IAccountPropsCommon,
  IAccountState as IAccountStateCommon,
} from '../../../common/components/AccountPage';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { minus } from '../../../common/components/Icons';
import { ErrorModal } from '../../../common/components/ErrorModal';

interface IAccountProps extends IAccountPropsCommon {
  [STORE_ACCOUNT]: AccountStore;
  [STORE_VEHICLE]: VehicleStore;
}

interface IAccountState extends IAccountStateCommon {
  isRemoveCardModalOpen: boolean;
  isPaymentFormOpen: boolean;
}

@translate('translations')
@inject(STORE_ACCOUNT, STORE_VEHICLE)
@observer
export default class Account extends AccountPage<IAccountProps, IAccountState> {
  constructor(props: IAccountProps) {
    super(props);
    this.state = {
      isRemoveCardModalOpen: false,
      isPaymentFormOpen: false,
    };
    this.logOut = this.logOut.bind(this);
    this.addCard = this.addCard.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.openPaymentForm = this.openPaymentForm.bind(this);
    this.closePaymentForm = this.closePaymentForm.bind(this);
    this.closeRemoveCardModal = this.closeRemoveCardModal.bind(this);
    this.openRemoveCardModal = this.openRemoveCardModal.bind(this);
  }

  public componentDidMount() {
    this.props[STORE_ACCOUNT].getCreditCard();
    this.resetPersonalDetails();
    firebase.analytics().logEvent('saw_account_screen');
  }

  public logOut() {
    const { clearData } = this.props[STORE_VEHICLE];
    clearData();
    super.logOut.call(this);
  }

  public async addCard() {
    this.props[STORE_ACCOUNT].setCreditCard();
    this.setState({ isPaymentFormOpen: false });
    firebase.analytics().logEvent('add_credit_card_clicked');
  }

  public openPaymentForm() {
    const { paymentToken, paymentError } = this.props[STORE_ACCOUNT];
    if (!paymentToken || paymentError) {
      this.props[STORE_ACCOUNT].dismissPaymentError();
    }
    this.setState({ isPaymentFormOpen: true });
  }

  public closePaymentForm() {
    this.setState({ isPaymentFormOpen: false });
  }

  public closeRemoveCardModal() {
    this.setState({ isRemoveCardModalOpen: false });
  }

  public openRemoveCardModal() {
    this.setState({ isRemoveCardModalOpen: true });
    firebase.analytics().logEvent('remove_credit_card_clicked');
  }

  public async removeCard() {
    this.closeRemoveCardModal();
    this.props[STORE_ACCOUNT].deleteCreditCard();
  }

  public navigateBack() {
    this.props.navigation.pop();
  }

  public dismissPaymentError = () => {
    this.setState({isPaymentFormOpen: false});
    this.props[STORE_ACCOUNT].dismissPaymentError();
  }

  public deleteButton() {
    return (
      <Button
        onPress={this.openRemoveCardModal}
        style={[
          buttonsStyle.extraSmallCircle,
          { backgroundColor: customColors.davRed },
        ]}
        icon={minus}
      />
    );
  }

  public renderPaymentDetails() {
    const { t } = this.props;
    const { paymentMethod, hasPayment } = this.props[STORE_ACCOUNT];
    return (
      <View style={[{marginVertical: customSizes.space}]}>
        <Text style={[textStyles.subtitle, { margin: customSizes.main / 4, marginTop: customSizes.space / 2 }]}>
          {t('account.payment.title')}
        </Text>
        {paymentMethod && hasPayment ? (
          <View style={[formStyles.fieldContainer, styles.creditCardField]}>
            <View style={styles.cardDetails}>
              <CreditCardLogo brand={paymentMethod.brand}
                              style={{
                                marginTop: customSizes.space / 10,
                                marginRight: customSizes.space / 2,
                              }}/>
              <Text
                style={{
                  padding: customSizes.space / 4,
                }}>
                •••• {paymentMethod.last4}
              </Text>
            </View>
            <View
              style={{
                padding: customSizes.space / 4,
              }}>
              {this.deleteButton()}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={formStyles.inlineFieldButton}
            onPress={this.openPaymentForm}>
            <View>
              <Text
                style={[
                  textStyles.paragraph,
                  { paddingTop: customSizes.space / 4 },
                ]}>
                {t('account.buttons.add')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  public render() {
    const { requestStatus, paymentToken, paymentError } = this.props[STORE_ACCOUNT];
    const { t } = this.props;
    const scrollViewHEight = customSizes.window.height - this.state.heightHeader || 0;
    return (
      <SafeAreaView style={styles.containerPage}>
        <Spinner isVisible={requestStatus === RequestStatus.pending} />
        {this.renderAccountHeaderBig()}
        <KeyboardAwareScrollView
          style={{ ...StyleSheet.absoluteFillObject,
                   top: this.state.heightHeader,
                   height: scrollViewHEight }}
          keyboardOpeningTime={0}
          extraScrollHeight={customSizes.space}
          resetScrollToCoords={{ x: 0, y: 0 }}
          enableOnAndroid>
          {this.renderPersonalDetails()}
          {this.renderPaymentDetails()}
          {this.renderSignOutButton()}
          {this.renderBuildInfo()}
        </KeyboardAwareScrollView>
        <InteractiveModal
          title={t('account.deletePaymentModal.title')}
          text={t('account.deletePaymentModal.text')}
          textStyle={{marginVertical: customSizes.space / 2, marginBottom: customSizes.space}}
          isOpen={this.state.isRemoveCardModalOpen}
          cancel={this.closeRemoveCardModal}
          submit={this.removeCard}
        />
        <ErrorModal
          title={t('account.paymentErrorModal.title')}
          text={t('account.paymentErrorModal.text')}
          isOpen={paymentError}
          closeErrorModal={this.dismissPaymentError}
          buttonText={t('account.paymentErrorModal.buttonText')}
        />
        <PaymentForm
          visible={this.state.isPaymentFormOpen}
          submitData={this.addCard}
          cancel={this.closePaymentForm}
          paymentToken={paymentToken}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  containerPage: {
    backgroundColor: customColors.grey0,
    flex: 1,
  },
  creditCardField: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: customSizes.window.width,
    paddingTop: customSizes.main / 4,
    paddingBottom: customSizes.main / 4,
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

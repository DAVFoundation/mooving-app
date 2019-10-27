import React from 'react';
import { StyleSheet, SafeAreaView, View, Text, TextInput, Keyboard, TouchableOpacity, Image } from 'react-native';
import { translate } from 'react-i18next';
import { STORE_ACCOUNT, STORE_VEHICLE } from '../../constants';
import { observer, inject } from 'mobx-react';
import AccountPage, {
  IAccountProps as IAccountPropsCommon,
  IAccountState as IAccountStateCommon,
} from '../../../common/components/AccountPage';
import { RequestStatus } from '../../../common/lib/types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { customSizes, customColors, formStyles, textStyles, shadowStyles, customFonts } from '../../../common/styles';
import { AccountStore } from '../../stores/AccountStore';
import { VehicleStore } from '../../stores/VehicleStore';
import firebase from 'react-native-firebase';
import StatusChangeErrorModal from '../StatusChangeErrorModal';
import Spinner from '../../../common/components/Spinner';
import DetailsModal from '../../components/DetailsModal';
import { davSymbol, account, signOut } from '../../../common/components/Icons';
import Button from '../../../common/components/Button';

const PERSONAL_DETAILS = 'PERSONAL_DETAILS';
const DAV_WALLET = 'DAV_WALLET';

interface IAccountProps extends IAccountPropsCommon {
  [STORE_ACCOUNT]: AccountStore;
  [STORE_VEHICLE]: VehicleStore;
}

interface IAccountState extends IAccountStateCommon {
  openModal: string | undefined;
}

@translate('translations')
@inject(STORE_ACCOUNT, STORE_VEHICLE)
@observer
export default class Account extends AccountPage<IAccountProps, IAccountState> {

  public componentDidMount() {
    this.resetPersonalDetails();
    super.componentDidMount.call(this);
    firebase.analytics().logEvent('saw_account_screen');
  }

  public logOut() {
    this.props[STORE_VEHICLE].logOut();
    super.logOut.call(this);
  }

  public resetPersonalDetails() {
    const { firstName, lastName, email, companyName } = this.props[STORE_ACCOUNT];
    this.setState({ firstName, lastName, email, companyName });
    Keyboard.dismiss();
  }

  public fireAnalyticsEvents() {
    const { companyName } = this.props[STORE_ACCOUNT];
    if (!companyName && this.state.companyName) {
      firebase.analytics().logEvent('companyName_added');
    }
    super.fireAnalyticsEvents.call(this);
  }

  public isPersonalDetailsChanged() {
    const { firstName, lastName, email, companyName } = this.props[STORE_ACCOUNT];
    return (
      firstName !== this.state.firstName ||
      lastName !== this.state.lastName ||
      email !== this.state.email ||
      companyName !== this.state.companyName
    );
  }

  public openPersonalDetails = () => {
    this.setState({ openModal: PERSONAL_DETAILS });
  }

  public openDavWallet = () => {
    this.setState({ openModal: DAV_WALLET });
  }

  public closeModal = () => {
    this.setState({ openModal: '' });
  }

  public renderAccountHeaderSmall() {
    const { t } = this.props;
    return (
      <View style={styles.headerSmall}>
        <Text
          style={[
            textStyles.h2,
            textStyles.alignCenter,
            { color: customColors.black },
          ]}>
          {t('account.header')}
        </Text>
      </View>
    );
  }

  public renderPersonalDetails() {
    const { t } = this.props;
    const { phoneNumber } = this.props[STORE_ACCOUNT];
    return (
      <DetailsModal
        closeModal={this.closeModal}
        title={t('account.personalDetails.title')}
        headerButton={
          this.isPersonalDetailsChanged() ? (
          <Button
            text={t('account.buttons.save')}
            textStyle={[textStyles.button, { color: customColors.white, fontSize: 20 }]}
            onPress={this.savePersonalDetails}
          />
          ) : undefined}
        isVisible={this.state.openModal === PERSONAL_DETAILS}>
        <KeyboardAwareScrollView
          keyboardOpeningTime={0}
          extraScrollHeight={customSizes.space}
          resetScrollToCoords={{ x: 0, y: 0 }}
          enableOnAndroid>
          <View style={{ marginVertical: customSizes.space }}>
            <View style={formStyles.fieldContainer}>
              <Text style={[textStyles.metadata, formStyles.fieldLabel]}>
                {t('account.personalDetails.companyName')}
              </Text>
              <TextInput
                style={[textStyles.paragraph, formStyles.textInput]}
                value={this.state.companyName}
                editable={this.state.isScreenFocused}
                onChangeText={(companyName: any) => this.setState({ companyName })}
              />
            </View>
            <View style={formStyles.fieldContainer}>
              <Text style={[textStyles.metadata, formStyles.fieldLabel]}>
                {t('account.personalDetails.firstName')}
              </Text>
              <TextInput
                style={[textStyles.paragraph, formStyles.textInput]}
                value={this.state.firstName}
                editable={this.state.isScreenFocused}
                onChangeText={(firstName: any) => this.setState({ firstName })}
              />
            </View>
            <View style={formStyles.fieldContainer}>
              <Text style={[textStyles.metadata, formStyles.fieldLabel]}>
                {t('account.personalDetails.lastName')}
              </Text>
              <TextInput
                style={[textStyles.paragraph, formStyles.textInput]}
                value={this.state.lastName}
                editable={this.state.isScreenFocused}
                onChangeText={(lastName: any) => this.setState({ lastName })}
              />
            </View>
            <View style={formStyles.fieldContainer}>
              <Text style={[textStyles.metadata, formStyles.fieldLabel]}>
                {t('account.personalDetails.phone')}
              </Text>
              <TextInput
                style={[
                  textStyles.paragraph,
                  formStyles.textInput,
                  { color: customColors.grey2 },
                ]}
                value={phoneNumber}
                editable={false}
              />
            </View>
            <View
              style={[
                formStyles.fieldContainer,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: customColors.grey1,
                },
              ]}>
              <Text style={[textStyles.metadata, formStyles.fieldLabel]}>
                {t('account.personalDetails.email')}
              </Text>
              <TextInput
                style={[textStyles.paragraph, formStyles.textInput]}
                value={this.state.email}
                editable={this.state.isScreenFocused}
                onChangeText={(email: any) => this.setState({ email })}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </DetailsModal>
    );
  }

  public renderButton(icon: any, text: string, onPress: () => void) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.button, shadowStyles.large]}>
        <Image source={icon} resizeMode='contain' style={{
          width: 25,
          height: 20,
        }} />
        <Text style={styles.buttonText}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }

  public renderDavWallet() {
    const { t } = this.props;
    const { davBalance } = this.props[STORE_ACCOUNT];
    return (
      <DetailsModal
        closeModal={this.closeModal}
        title={t('account.davWallet.title')}
        isVisible={this.state.openModal === DAV_WALLET}>
        <View style={[styles.davWalletModal]}>
          <Text
            style={[
              textStyles.h4,
              {
                textAlign: 'center',
                color: customColors.grey7,
                marginVertical: customSizes.space / 2,
              },
            ]}>
            {t('account.davWallet.balance')}
          </Text>
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            marginBottom: customSizes.main / 2,
            }}>
            <Image source={davSymbol} resizeMode='contain' style={{
                width: 25,
                height: 20,
                marginTop: customSizes.space / 4,
                marginRight: customSizes.space / 4,
              }} />
            <Text style={[{
                color: customColors.grey7,
                fontSize: 24,
                fontFamily: customFonts.montserratRegular,
              }]}>{Math.floor(davBalance || 0)}</Text>
          </View>
          <Text
            style={[
              textStyles.paragraph,
              {
                textAlign: 'center',
                color: customColors.grey7,
                marginBottom: customSizes.main / 2,
              },
            ]}>
            {t('account.davWallet.text')}
          </Text>
          <Image source={require('../../../common/assets/images/dav_tokens_rewards.png')} />
        </View>
      </DetailsModal>
    );
  }

  public render() {
    const { requestStatus } = this.props[STORE_ACCOUNT];
    const { t } = this.props;
    return (
      <View style={{backgroundColor: customColors.grey0 , flex: 1}}>
        <SafeAreaView style={styles.containerPage}>
          <Spinner isVisible={requestStatus === RequestStatus.pending} />
          {this.renderAccountHeaderSmall()}
          {this.renderButton(account, t('account.personalDetails.title'), this.openPersonalDetails)}
          {this.renderButton(davSymbol, t('account.davWallet.title'), this.openDavWallet)}
          {this.renderButton(signOut, t('account.buttons.signout'), this.logOut)}
          {this.renderBuildInfo()}
        </SafeAreaView>
        <SafeAreaView>
          {this.renderPersonalDetails()}
          {this.renderDavWallet()}
          <StatusChangeErrorModal />
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerPage: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    maxHeight: customSizes.main * 7,
  },
  button: {
    padding: customSizes.main / 4,
    paddingHorizontal: customSizes.main,
    width: customSizes.window.width - customSizes.main,
    backgroundColor: customColors.white,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    width: customSizes.window.width - customSizes.main * 3,
    textAlign: 'center',
    color: customColors.grey5,
    fontSize: 16,
    fontFamily: customFonts.montserratRegular,
  },
  headerSmall: {
    zIndex: 2,
    paddingTop: customSizes.space * 2,
    display: 'flex',
  },
  saveButton: {
    position: 'relative',
    alignSelf: 'flex-end',
    marginRight: customSizes.spaceFluidSmall,
    paddingVertical: customSizes.space / 2.5,
    paddingHorizontal: customSizes.space / 1.5,
    borderRadius: customSizes.space,
    backgroundColor: customColors.black,
  },
  davWalletModal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    padding: customSizes.main / 2,
  },
});

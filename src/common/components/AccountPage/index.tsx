import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Image,
  Keyboard,
  Platform,
} from 'react-native';
import {
  NavigationScreenProp,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import { STORE_ACCOUNT } from '../../constants';
import { AccountStore } from '../../stores/AccountStore';
import Spinner from '../../../common/components/Spinner';
import { RequestStatus } from '../../../common/lib/types';
import {
  textStyles,
  customColors,
  customSizes,
  formStyles,
} from '../../../common/styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import firebase from 'react-native-firebase';
import BuildConfig from '../../../common/lib/build-config';
import Button, { buttonsStyle } from '../Button';
import { arrowBackwardWhite } from '../Icons';

export interface IAccountProps {
  [STORE_ACCOUNT]: AccountStore;
  navigation: NavigationScreenProp<any, any>;
  t(key?: string, options?: any): string;
}

export interface IAccountState {
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  isScreenFocused?: boolean;
  heightHeader: number;
}

export default abstract class AccountPage<
  U extends IAccountProps,
  V extends IAccountState
> extends React.Component<U, V> {
  public didFocusSubscription: any;
  public willBlurSubscription: any;

  constructor(props: U) {
    super(props);
    this.state = {
      isScreenFocused: true,
      heightHeader: 0,
    } as V;
    this.logOut = this.logOut.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.savePersonalDetails = this.savePersonalDetails.bind(this);
    this.resetPersonalDetails = this.resetPersonalDetails.bind(this);
    this.isPersonalDetailsChanged = this.isPersonalDetailsChanged.bind(this);

    this.renderSpinner = this.renderSpinner.bind(this);
    this.renderAccountHeaderBig = this.renderAccountHeaderBig.bind(this);
    this.renderPersonalDetails = this.renderPersonalDetails.bind(this);
    this.renderSignOutButton = this.renderSignOutButton.bind(this);
    this.renderBuildInfo = this.renderBuildInfo.bind(this);
    this.handleLayout = this.handleLayout.bind(this);
  }

  public componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      () => this.setState({ isScreenFocused: true }),
    );
    this.willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      () => {
        this.setState({ isScreenFocused: false });
        Keyboard.dismiss();
      },
    );
  }

  public handleLayout = ({ nativeEvent }) => {
    this.setState({ heightHeader: nativeEvent.layout.height });
  }

  public logOut() {
    const { logOut } = this.props[STORE_ACCOUNT];
    firebase.analytics().logEvent('sign_out_link_clicked');
    logOut();
    firebase.analytics().logEvent('user_signed_out');
    this.dropStackNavigationAndNavigateToLogin();
  }

  public dropStackNavigationAndNavigateToLogin() {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Login' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  public savePersonalDetails() {
    const { updatePersonalDetails } = this.props[STORE_ACCOUNT];
    updatePersonalDetails(this.state);
    Keyboard.dismiss();
    this.fireAnalyticsEvents();
  }

  public fireAnalyticsEvents() {
    const { firstName, lastName, email } = this.props[STORE_ACCOUNT];
    if (!firstName && this.state.firstName) {
      firebase.analytics().logEvent('first_name_added');
    }
    if (!lastName && this.state.lastName) {
      firebase.analytics().logEvent('last_name_added');
    }
    if (!email && this.state.email) {
      firebase.analytics().logEvent('email_added');
    }
  }

  public resetPersonalDetails() {
    const { firstName, lastName, email } = this.props[STORE_ACCOUNT];
    this.setState({ firstName, lastName, email });
    Keyboard.dismiss();
  }

  public isPersonalDetailsChanged() {
    const { firstName, lastName, email } = this.props[STORE_ACCOUNT];
    return (
      firstName !== this.state.firstName ||
      lastName !== this.state.lastName ||
      email !== this.state.email
    );
  }

  public renderAccountHeaderBig() {
    const { t } = this.props;
    return (
      <SafeAreaView onLayout={this.handleLayout} style={[styles.header]}>
        <View style={styles.saveDiscardButtons}>
          <Button
            style={[
              buttonsStyle.smallCircle,
              { backgroundColor: customColors.whiteTransparent },
            ]}
            icon={arrowBackwardWhite}
            onPress={this.navigateBack}
          />
          { this.isPersonalDetailsChanged() &&
            <Button
              text={t('account.buttons.save')}
              textStyle={[textStyles.button, { color: customColors.white }]}
              onPress={this.savePersonalDetails}
            />
          }
        </View>
        <Text
          style={[
            textStyles.h2,
            { color: customColors.white, padding: customSizes.space },
          ]}>
          {t('account.header')}
        </Text>
        <Image
          style={styles.headerBackground}
          source={require('../../../common/assets/bg-header_red.png')}
          resizeMode='stretch'
        />
      </SafeAreaView>
    );
  }

  public renderPersonalDetails() {
    const { t } = this.props;
    const { phoneNumber } = this.props[STORE_ACCOUNT];
    return (
      <View>
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
    );
  }

  public renderSignOutButton() {
    const { t } = this.props;
    return (
      <TouchableOpacity
        style={formStyles.inlineFieldButton}
        onPress={this.logOut}>
        <Text style={[textStyles.button, { color: customColors.davRed }]}>
          {t('account.buttons.signout')}
        </Text>
      </TouchableOpacity>
    );
  }

  public renderSpinner() {
    const { requestStatus } = this.props[STORE_ACCOUNT];
    return <Spinner isVisible={requestStatus === RequestStatus.pending} />;
  }

  public renderBuildInfo() {
    return (
      <Text
        style={[
          textStyles.metadata,
          { padding: customSizes.space, color: customColors.grey2, paddingBottom: customSizes.space * 2 },
        ]}>
        {`Version: ${BuildConfig.buildVersionName} - ${
        BuildConfig.buildVariant} (${BuildConfig.buildVersionCode})`}
      </Text>
    );
  }

  public navigateBack() {
    this.props.navigation.pop();
  }

}

export const styles = StyleSheet.create({
  header: {
    width: customSizes.window.width,
    top: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  headerBackground: {
    zIndex: -1,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
  },
  saveDiscardButtons: {
    paddingTop: customSizes.space,
    paddingHorizontal: customSizes.space,
    width: customSizes.window.width,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

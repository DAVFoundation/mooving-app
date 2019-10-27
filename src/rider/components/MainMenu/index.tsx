import React, { Component } from 'react';
import { View, StyleSheet, Image, Platform, Modal, Linking } from 'react-native';
import {
  customSizes,
  customColors,
  customFonts,
} from '../../../common/styles';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { crossWhite, davLogo, menu } from '../../../common/components/Icons';
import { NavigationScreenProp } from 'react-navigation';
import { translate } from 'react-i18next';
import firebase from 'react-native-firebase';

interface IMainMenuProps {
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

interface IMainMenuState {
  isOpen: boolean;
}

@translate('translations')
export default class MainMenu extends Component<IMainMenuProps, IMainMenuState> {

  constructor(props: IMainMenuProps) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  public toggleMenu = () => {
    this.setState(state => ({
      isOpen: !state.isOpen,
    }));
  }

  public showOnboarding = () => {
    this.props.navigation.navigate('Onboarding', {
      initialRouteName: 'Main',
    });
  }

  public render() {
    const { t, navigation } = this.props;
    return (
      <>
        <View style={[styles.menuButton]}>
          <Button
            style={[buttonsStyle.smallCircle,
                    styles.buttonShadow,
                    {
                      backgroundColor: customColors.white,
                    }]}
            icon={menu}
            onPress={() => {
              firebase.analytics().logEvent('menu_button_clicked');
              this.toggleMenu();
            }} />
        </View>
        {
          this.state.isOpen ?
            <View style={[styles.menuBackground]} />
            : null
        }
        {
          this.state.isOpen ?
            <View style={[styles.menuContent]}>
              <Button
                style={[styles.closeButtonPosition]}
                icon={crossWhite}
                onPress={this.toggleMenu} />

              <Button
                style={[styles.menuOptionButton]}
                text={t('menu.account')}
                textStyle={[styles.menuOptionText]}
                onPress={() => {
                  firebase.analytics().logEvent('account_menu_item_clicked');
                  navigation.navigate('Account');
                }} />

              <Button
                style={[styles.menuOptionButton]}
                text={t('menu.rideHistory')}
                textStyle={[styles.menuOptionText]}
                onPress={() => {
                  firebase.analytics().logEvent('ride_history_menu_item_clicked');
                  navigation.navigate('RideHistory');
                }} />

              <Button
                style={[styles.menuOptionButton]}
                text={t('menu.guide')}
                textStyle={[styles.menuOptionText]}
                onPress={() => {
                  firebase.analytics().logEvent('how_to_dav_menu_item_clicked');
                  this.showOnboarding();
                }} />

              <Button
                style={[styles.menuOptionButton]}
                text={t('menu.contactUs')}
                textStyle={[styles.menuOptionText]}
                onPress={() => {
                  firebase.analytics().logEvent('contact_us_menu_item_clicked');
                  Linking.openURL('mailto:rider.support@dav.city');
                }} />
              <Image
                style={styles.davLogo}
                source={davLogo} />
            </View> : null
        }
      </>
    );
  }
}

const styles = StyleSheet.create({
  menuButton: {
    width: customSizes.window.width,
    padding: customSizes.space,
    paddingTop: customSizes.space,
  },
  menuBackground: {
    position: 'absolute',
    backgroundColor: customColors.grey7,
    width: customSizes.main * 16,
    height: customSizes.main * 16,
    left: - customSizes.main * Platform.select({
      ios: 11.5,
      android: 11,
    }),
    top: - customSizes.main * Platform.select({
      ios: 8,
      android: 7,
    }),
    borderRadius: customSizes.main * 8,
    zIndex: 38,
    elevation: 100,
  },
  menuContent: {
    ...StyleSheet.absoluteFillObject,
    height: Platform.select({
      ios: customSizes.main * 6.5,
      android: customSizes.main * 7.5,
    }),
    display: 'flex',
    justifyContent: 'space-between',
    bottom: customSizes.main * 3,
    padding: customSizes.space,
    paddingTop: 0,
    paddingLeft: 0,
    zIndex: 39,
    elevation: 101,
  },
  menuOptionText: {
    fontFamily: customFonts.montserratBold,
    fontSize: 24,
    color: customColors.white,
    fontWeight: 'bold',
    width: customSizes.main * 4,
  },
  menuOptionButton: {
    width: customSizes.main * 3,
    paddingLeft: customSizes.space,
  },
  closeButtonPosition: {
    paddingLeft: customSizes.space * 1.5,
    paddingTop: customSizes.main / 2,
    marginTop: 0,
    width: customSizes.main * 1.5,
  },
  davLogo: {
    marginLeft: customSizes.space,
    marginTop: customSizes.space,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
    zIndex: 1,
    backgroundColor: customColors.blackTransparent1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: customColors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});

import React, { Component } from 'react';
import {Image, LayoutAnimation, Platform, StyleSheet, Text, UIManager, View} from 'react-native';
import {customColors, customFonts, customSizes} from '../../../../../common/styles';
import logo from '../../../../../common/assets/logos/logoLight.png';

interface ILogoHeaderProps {
  t(key: string, options?: any): string;
}

class LogoHeader extends Component <ILogoHeaderProps, ILogoHeaderState> {

  private imageWidth: number = customSizes.window.height / 5.5;

  constructor(props: ILogoHeaderProps) {
    super(props);
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  public render() {
    return (
      <View
        style={[styles.wrapperKeyboardInVisible, {alignItems: 'flex-start'}]}>
        <View style={styles.logoWrapper}>
          <Image
            resizeMode='contain'
            style={{  width: this.imageWidth, height: this.imageWidth }}
            source={logo}
          />
          <Text
            adjustsFontSizeToFit
            minimumFontScale={1}
            style={styles.manageText}>{this.props.t('signup.phone.manager')}
          </Text>
        </View>
      </View>
    );
  }
}

export default LogoHeader;

const styles = StyleSheet.create({
  wrapperKeyboardInVisible: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    zIndex: 2,
  },
  logoWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
  },
  manageText: {
    fontSize: 24,
    color: customColors.white,
    textAlign: 'center',
    marginTop: customSizes.space * 0.8,
    fontFamily: customFonts.montserratBold,
  },
});

import React from 'react';
import { Component } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { customSizes } from '../../styles';

const styles = StyleSheet.create({
  logoStandard: {
    width: customSizes.main * 1.5,
    height: customSizes.main * 1.5,
  },
});

interface ILogoProps {
  isDark: boolean;
}

export default class Logo extends Component<ILogoProps> {
  public render() {

    const logo = this.props.isDark
      ? require('../../assets/logos/logo-dav_dark.png')
      : require('../../assets/logos/logo-dav_light.png');

    return (
      <View>
        <Image style={styles.logoStandard} source={logo} />
      </View>
    );
  }
}

import React from 'react';
import { Component } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { customSizes, customColors } from '../../../../common/styles/variables';
import Logo from '../../../../common/components/Logo';

interface IAnimationProps {
  backgroundColor: string;
  logoDark: boolean;
  flex: number;
}

export default class AnimatedBackground extends Component<IAnimationProps> {

  public render() {
    const { backgroundColor, flex } = this.props;
    return (
      <View style={[styles.animatedBackground, { flex }]}>
        <SafeAreaView>
          <Logo isDark={false} />
        </SafeAreaView>
        <View
          style={[styles.animatedBackgroundBackground, { backgroundColor: 'black' }]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  animatedBackground: {
    position: 'absolute',
    top: customSizes.spaceFluidSmall,
    left: 0,
    zIndex: -1,
    flex: 0,
    padding: customSizes.spaceFluidBig,
  },
  animatedBackgroundBackground: {
    width: customSizes.window.width,
    height: customSizes.window.width * 1.1,
    borderRadius: customSizes.window.width,
    position: 'absolute',
    left: -customSizes.window.width / 2,
    top: customSizes.window.width / 4,
    zIndex: -1,
    transform: [{ scale: 2 }],
  },
  logoStandard: {
    width: 180,
  },
});

import React from 'react';
import { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { customSizes, customColors, customEasing } from '../../../../common/styles';
import AnimatedView from '../../../../common/components/AnimatedView';

export default class AnimatedBackground extends Component {
  public render() {
    return (
      <View style={[styles.animatedBackground]}>
        <AnimatedView
          start
          style={[styles.circle, styles.topCircle]}
          from={circleTopFrom}
          to={circleTopTo}
          duration={customSizes.window.height}
          easing={customEasing.EaseInOut}
        />
        <AnimatedView
          start
          style={[styles.circle, styles.bottomCircle]}
          from={circleBottomFrom}
          to={circleBottomTo}
          duration={customSizes.window.height}
          easing={customEasing.EaseInOut}
        />
      </View>
    );
  }
}
const circleTopFrom = {
  right: -customSizes.window.width * 4,
  top: -customSizes.window.width * 2,
};

const circleTopTo = {
  right: -customSizes.window.width * 2,
  top: -customSizes.window.width,
};

const circleBottomFrom = {
  left: -customSizes.window.width * 4,
  bottom: -customSizes.window.width * 2,
};

const circleBottomTo = {
  left: -customSizes.window.width * 2,
  bottom: -customSizes.window.width,
};

const styles = StyleSheet.create({
  animatedBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: -3,
  },
  circle: {
    width: customSizes.window.width * 3.05,
    height: customSizes.window.width * 3.05,
    borderRadius: customSizes.window.width * 3.05,
    position: 'absolute',
  },
  topCircle: {
    backgroundColor: customColors.davGreenSecondary,
    zIndex: -2,
  },
  bottomCircle: {
    backgroundColor: customColors.white,
    zIndex: -1,
  },
});

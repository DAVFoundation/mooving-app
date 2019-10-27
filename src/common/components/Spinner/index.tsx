import React from 'react';
import { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SpinnerBace from 'react-native-spinkit';
import { customColors, customSizes } from '../../styles';

interface ISpinnerProps {
    isVisible: boolean;
}

export default class Spinner extends Component<ISpinnerProps> {

  public render() {

    return this.props.isVisible ?
      (<View style={styles.overlay}>
        <SpinnerBace size={customSizes.main * 1.5}
          style={styles.spinner}
          type='ThreeBounce'
          color= {customColors.davRed}
          isVisible={ this.props.isVisible }/>
      </View>) : null;
  }
}

const styles = StyleSheet.create({
  spinner: {
    zIndex: 96,

  },
  overlay: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
    opacity: 1,
    zIndex: 95,
    backgroundColor: customColors.blackTransparent1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

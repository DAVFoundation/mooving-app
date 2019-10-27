import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { customSizes, customColors, textStyles } from '../../../common/styles';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { responsiveFont } from '../../../common/lib/helpers';

interface IUnlockButtonProps {
  buttonText: any;
  onPress: any;
}

export default class UnlockButton extends Component<IUnlockButtonProps> {
  public render() {
    return (
      <TouchableOpacity
        style={styles.circularBigButton}
        onPress={this.props.onPress}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          style={[textStyles.button, styles.buttonText]}
        >
          {this.props.buttonText}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  circularBigButton: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: customSizes.main * 1.5,
    height: customSizes.main * 1.5,
    borderRadius: customSizes.main * 1.5,
    bottom: customSizes.spaceFluidSmall,
    right: customSizes.spaceFluidSmall,
    backgroundColor: customColors.davRed,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: customColors.grey2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 2,
      },
    }),
    ...ifIphoneX(
      {
        bottom: customSizes.spaceFluidBig,
      },
      {
        bottom: customSizes.spaceFluidSmall,
      },
    ),
  },
  buttonText: {
    color: customColors.white,
    ...Platform.select({
      android: {
        fontSize: responsiveFont(2.2),
      },
    }),
  },
});

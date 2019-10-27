import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { customSizes, customColors } from '../../../../common/styles';
import { ifIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';

interface IBottomMenuProps {
  backgroundColor: any;
}

export default class BottomMenu extends Component<IBottomMenuProps> {
  public render() {
    return (
      <View style={styles.bottomMenu}>
        {this.props.children}
        <View
          style={[
            styles.bottomMenuBackground,
            { backgroundColor: this.props.backgroundColor },
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bottomMenu: {
    position: 'absolute',
    padding: customSizes.spaceFluidSmall,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    ...ifIphoneX(
      {
        marginBottom: getBottomSpace(),
      },
      {
        marginBottom: 0,
      },
    ),
  },
  bottomMenuBackground: {
    position: 'absolute',
    left: -customSizes.window.width,
    top: 0,
    borderRadius: customSizes.window.width * 1.5,
    width: customSizes.window.width * 3,
    height: customSizes.window.width * 3,
    backgroundColor: customColors.black,
    zIndex: -1,
  },
});

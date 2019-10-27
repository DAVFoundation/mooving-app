import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, PlatformIOS, Platform } from 'react-native';
import {
  customSizes,
  customColors,
  textStyles,
} from '../../../common/styles';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import Button, { buttonsStyle } from '../../../common/components/Button';

interface ITopMenuProps {
  text: string;
  textStyle?: any;
  goBack: () => void;
  icon: any;
  styles?: any;
}

export default class TopMenu extends Component<ITopMenuProps> {
  public render() {
    return (
      <View style={[styles.topMenu, this.props.styles || {}]}>
        <Button
          style={[buttonsStyle.smallCircle,
                  {
                    backgroundColor: customColors.blackTransparent,
                    marginBottom: customSizes.space,
                  }]}
          icon={this.props.icon}
          onPress={this.props.goBack} />
        <Text style={[
            textStyles.h2Responsive,
            styles.title,
            this.props.textStyle,
          ]}>
          {this.props.text}
        </Text>
        {this.props.children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  topMenu: {
    width: customSizes.window.width,
    padding: customSizes.spaceFluidSmall,
  },
  title: {
    color: customColors.white,
    marginBottom: 5,
  },
});

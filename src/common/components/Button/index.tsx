import React from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  View,
  StyleSheet,
} from 'react-native';
import { customSizes, customColors } from '../../styles';
import { isSmallDevice } from '../../lib/helpers';

interface IButtonProps {
  style?: any;
  textStyle?: any;
  iconStyle?: any;
  onPress?: () => void;
  text?: string;
  icon?: any;
  disabled?: boolean;
}

export default function Button(props: IButtonProps) {
  return (
    <TouchableOpacity
      style={[props.style, { opacity: props.disabled ? .4 : 1}]}
      disabled={props.disabled}
      onPress={props.onPress}>
      {
        props.icon ?
        <Image
          style={[{flexDirection: 'row', flexWrap: 'wrap', resizeMode: 'contain' }, props.iconStyle]}
          source={props.icon}/>
        :
        <View/>
      }
      {
        props.text ?
        <Text style={props.textStyle || {}} adjustsFontSizeToFit numberOfLines={1} ellipsizeMode='clip'>
        {props.text}
        </Text>
        :
        <View/>
      }
    </TouchableOpacity>
  );
}

const mainButtonSize = Math.min(customSizes.window.height / (isSmallDevice ? 7 : 8), customSizes.space * 5);

const commonStyles = StyleSheet.create({
  center: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const buttonsPosition = StyleSheet.create({
  mainBottom: {
    position: 'absolute',
    bottom: customSizes.spaceFluidBig,
    right: customSizes.spaceFluidSmall,
    zIndex: 6,
  },
  back: {
    marginLeft: customSizes.spaceFluidSmall,
    marginTop: customSizes.spaceFluidSmall,
  },
});

export const buttonsStyle = StyleSheet.create({
  bigCircle: StyleSheet.flatten([
    commonStyles.center,
    {
    width: mainButtonSize,
    height: mainButtonSize,
    borderRadius: Math.min(customSizes.window.height / 4, customSizes.space * 2.5),
  }]),
  mediumCircle: StyleSheet.flatten([
    commonStyles.center,
    {
    width: customSizes.main,
    height: customSizes.main,
    borderRadius: customSizes.main / 2,
  }]),
  smallCircle: StyleSheet.flatten([
    commonStyles.center,
    {
    width: customSizes.space * 2,
    height: customSizes.space * 2,
    borderRadius: customSizes.space,
  }]),
  extraSmallCircle: StyleSheet.flatten([
    commonStyles.center,
    {
    width: customSizes.space,
    height: customSizes.space,
    borderRadius: customSizes.space / 2,
  }]),
  primary: StyleSheet.flatten([
    commonStyles.center,
    {
    borderColor: customColors.black,
    backgroundColor: customColors.black,
    borderWidth: 2,
    height: customSizes.space * 2,
    borderRadius: customSizes.space,
    paddingHorizontal: customSizes.space,
  }]),
  secondary: StyleSheet.flatten([
    commonStyles.center,
    {
    height: customSizes.space * 2,
    borderRadius: customSizes.space,
    borderWidth: 2,
    borderColor: customColors.black,
    backgroundColor: customColors.white,
    paddingHorizontal: customSizes.space,
  }]),
  smallRectangle: StyleSheet.flatten([
    commonStyles.center,
    {
    height: customSizes.space * 2,
    borderRadius: customSizes.space / 2,
    backgroundColor: customColors.white,
    paddingHorizontal: customSizes.space / 2,
  }]),
});

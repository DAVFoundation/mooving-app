import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { customSizes, textStyles, customColors } from '../../../common/styles';
import Button, { buttonsStyle } from '../Button';

interface IErrorModalProps {
  onRequestClose?: () => void;
  closeErrorModal: () => void;
  isOpen: boolean;
  style?: any;
  title: string;
  text: string;
  buttonText?: string;
  buttonStyle?: any;
}

export function ErrorModal(props: IErrorModalProps) {
  return (
    <Modal
      animationType='fade'
      onRequestClose={props.onRequestClose || props.closeErrorModal}
      transparent
      visible={
        props.isOpen
      }>
      <View style={[styles.errorModal, props.style || {}]}>
        <Text
          style={[
            textStyles.h3,
            {
              textAlign: 'center',
              color: customColors.black,
              marginBottom: customSizes.space,
            },
          ]}>
          {props.title}
        </Text>
        <Text
          style={[
            textStyles.paragraph,
            { textAlign: 'center', color: customColors.black },
          ]}>
          {props.text}
        </Text>
        <Button
          style={[ buttonsStyle.secondary, { marginLeft: 0, marginTop: customSizes.space }, props.buttonStyle]}
          text={ props.buttonText || 'Close' }
          textStyle={[textStyles.button, {color: customColors.black}]}
          onPress={props.closeErrorModal}/>
      </View>
      <View style={styles.overlay} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  errorModal: {
    position: 'absolute',
    zIndex: 2,
    left: customSizes.main / 2,
    top: customSizes.window.height / 2 - customSizes.main * 2,
    width: customSizes.window.width - customSizes.main,
    backgroundColor: '#FFF',
    padding: customSizes.space,
    borderRadius: customSizes.main / 2,
    opacity: 1,
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
});

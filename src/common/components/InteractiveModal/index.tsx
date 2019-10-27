import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { customSizes, textStyles, customColors } from '../../../common/styles';
import Button, { buttonsStyle } from '../Button';

interface IInteractiveModalProps {
  submit: (v?: any) => void;
  cancel: () => void;
  isOpen: boolean;
  style?: any;
  title: string;
  titleStyle?: any;
  text?: string;
  textStyle?: any;
  buttonApproveText?: string;
  buttonApproveStyle?: any;
  buttonRejectText?: string;
  buttonRejectStyle?: any;
}

export function InteractiveModal(props: IInteractiveModalProps) {
  return (
    <Modal
      animationType='fade'
      transparent
      onRequestClose={props.cancel}
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
            },
            props.titleStyle || {},
          ]}>
          {props.title}
        </Text>
        <Text style={[
            textStyles.paragraph,
            { textAlign: 'center', color: customColors.black, marginVertical: customSizes.space },
            props.textStyle]}>
          {props.text}
        </Text>
        <View style={styles.buttonsContainer}>
          <Button onPress={props.cancel}
            style={[
              buttonsStyle.secondary,
              {flex: 1},
              props.buttonRejectStyle,
            ]}
            textStyle={[textStyles.button, {color: customColors.black}]}
            text={props.buttonRejectText || 'Cancel'}/>
          <Button onPress={props.submit}
            style={[
              buttonsStyle.primary,
              {
                flex: 1,
                marginLeft: customSizes.spaceFluidSmall,
                borderColor: customColors.davRed,
                backgroundColor: customColors.davRed,
              },
              props.buttonApproveStyle,
          ]}
            textStyle={[textStyles.button, {color: customColors.white}]}
            text={ props.buttonApproveText || 'Remove' }/>
        </View>
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: customSizes.space,
    borderRadius: customSizes.main / 2,
    opacity: 1,
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
    zIndex: 1,
    backgroundColor: customColors.blackTransparent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

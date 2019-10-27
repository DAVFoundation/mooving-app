import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  customSizes,
  customColors,
  textStyles,
} from '../../../common/styles';

interface INotificationBarProps {
  text: string;
  backgroundColor: any;
}

export class NotificationBar extends React.Component<INotificationBarProps> {
  public render() {
    return (
      <View
        style={[
          styles.notificationBar,
          { backgroundColor: this.props.backgroundColor },
        ]}>
        <Text style={[textStyles.paragraph, styles.notificationBarText]}>
          {this.props.text}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  notificationBar: {
    backgroundColor: customColors.black,
    padding: customSizes.space / 4,
    borderTopLeftRadius: customSizes.space,
    borderTopRightRadius: customSizes.space,
  },
  notificationBarText: {
    textAlign: 'center',
    color: customColors.white,
  },
});

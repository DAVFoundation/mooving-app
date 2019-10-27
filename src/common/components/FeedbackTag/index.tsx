import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { customSizes, customColors, textStyles } from '../../styles';

interface IFeedbackTagProps {
  onPress?: () => void;
  isActive?: boolean;
  text: string;
  disabled?: boolean;
}

export default class FeedbackTag extends Component<IFeedbackTagProps> {
  public render() {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={[
          styles.feedbackTag,
          this.props.isActive
            ? styles.feedbackTagActive
            : styles.feedbackTagInActive,
          this.props.disabled ? styles.disabled : null,
        ]}
        disabled={this.props.disabled}
        onPress={this.props.onPress}
      >
        <Text
          style={[
            textStyles.description,
            {
              color: this.props.isActive && !this.props.disabled ? customColors.white : customColors.black,
            },
          ]}
        >
          {this.props.text}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  feedbackTag: {
    marginRight: customSizes.space / 4,
    marginBottom: customSizes.space / 4,
    padding: customSizes.space / 4,
    borderRadius: 5,
    backgroundColor: customColors.white,
    borderColor: customColors.grey1,
    borderWidth: 1,
  },
  feedbackTagActive: {
    backgroundColor: customColors.black,
    borderColor: customColors.black,
  },
  feedbackTagInActive: {
    backgroundColor: customColors.white,
    borderColor: customColors.grey1,
  },
  disabled: {
    borderColor: customColors.grey1,
    backgroundColor: customColors.grey1,
  },
});

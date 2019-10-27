import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import {
  customSizes,
  customColors,
  textStyles,
  formStyles,
} from '../../../common/styles';
import { mainSize } from '../../../common/lib/helpers';

interface IFeedbackTextProps {
  placeholder: any;
  label: any;
  value: any;
  onChangeText: any;
  onFocus?: any;
  editable?: boolean;
}

export default class FeedbackText extends Component<IFeedbackTextProps> {
  public render() {
    return (
      <View style={[formStyles.fieldStandAlone, styles.feedbackTextContainer]}>
        <Text style={[textStyles.metadata, formStyles.fieldLabel]}>
          {this.props.label}
        </Text>
        <TextInput
          editable={this.props.editable || true}
          multiline={true}
          numberOfLines={4}
          placeholder={this.props.placeholder}
          style={[textStyles.paragraph, formStyles.textInput, { height: customSizes.main * 1.25 }]}
          onChangeText={this.props.onChangeText}
          value={this.props.value}
          textAlignVertical={'top'}
          autoFocus={true}
          onFocus={this.props.onFocus}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  feedbackTextContainer: {
    borderWidth: 1,
    borderColor: customColors.grey1,
    marginBottom: customSizes.space,
    borderRadius: 2,
    paddingTop: 5,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { customSizes, customColors, textStyles } from '../../../common/styles';

interface IFeedbackCounterProps {
  positiveNumber: number;
  negativeNumber: number;
}

export class FeedbackCounter extends React.Component<IFeedbackCounterProps> {
  public render() {
    return (
      <View style={styles.feedbackCounter}>
        <View style={styles.counterWrapper}>
        <Image
            source={require('../../../common/assets/icons/thumbUp.png')}
            accessible={true}
            accessibilityLabel={'Thumbs up icon'}
            style={styles.imageThumbs}
          />
          <View style={styles.counterNumber}>
            <Text style={[textStyles.button, {color: customColors.white}]}>{this.props.positiveNumber}</Text>
          </View>
        </View>
        <View style={styles.counterWrapper}>
        <Image
            source={require('../../../common/assets/icons/thumbDown.png')}
            accessible={true}
            accessibilityLabel={'Thumbs down icon'}
            style={styles.imageThumbs}

          />
          <View style={styles.counterNumber}>
            <Text style={[textStyles.button, {color: customColors.white}]}>{this.props.negativeNumber}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  feedbackCounter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: customSizes.space,
  },
  counterWrapper: {
    borderWidth: 2,
    borderRadius: customSizes.main,
    borderColor: customColors.grey2,
    height: customSizes.main * 1.5,
    width: customSizes.main * 1.5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: customColors.white,
  },
  counterNumber: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: customSizes.main / 2,
    height: customSizes.main / 2,
    width: customSizes.main / 2,
    backgroundColor: customColors.davRedSecondary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageThumbs: {
    height: customSizes.main / 2,
    width: customSizes.main / 2,
  },
});

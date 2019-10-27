import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import {
  customSizes,
  customColors,
  textStyles,
  formStyles,
} from '../../../common/styles';
import { capitalizeFirstLetter } from '../../../common/lib/helpers';
import currencySymbolMap from '../../../common/lib/currencySymbolMap';

interface ITotalAmountProps {
  category?: string;
  amount: number;
  style?: any;
  currencyCode?: string;
}

export class TotalAmount extends React.Component<ITotalAmountProps> {
  public render() {
    const amount = Math.round(Number(this.props.amount) * 100) / 100;
    const icon =
      this.props.category === 'rides'
        ? require('../../assets/glyphs/glyph-stats_rides.png')
        : require('../../assets/glyphs/glyph-stats_income.png');
    return (
      <View style={[styles.totalAmount, this.props.style]}>
        <Text style={[textStyles.metadata, {
          textAlign: 'left',
          marginBottom: customSizes.space / 4,
          color: customColors.grey4,
          }]}>
          {capitalizeFirstLetter(this.props.category || '')}
        </Text>
        <Image source={icon} style={styles.iconGraph} />
        <Text style={[textStyles.h3, {color: customColors.grey6}]}>
          {this.props.category !== 'rides' && this.props.currencyCode ?
              currencySymbolMap[this.props.currencyCode] : ''}
          {amount}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  totalAmount: {
    borderWidth: 1,
    borderColor: customColors.grey1,
    borderRadius: 5,
    minHeight: customSizes.main,
    padding: customSizes.space / 2,
    flex: 1,
    display: 'flex',
    backgroundColor: customColors.white,
  },
  iconGraph: {
    position: 'absolute',
    right: customSizes.space / 2,
    bottom: customSizes.space / 1.5,
    width: customSizes.space * 1.5,
    height: customSizes.space * 1.5,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { customSizes, customColors, textStyles, vehicleStatusColors } from '../../../common/styles';
import { translate } from 'react-i18next';
import { PieChart } from 'react-native-svg-charts';

interface IVehicleStatusGraphProps {
  amount: number;
  vehiclesByStatus: any;
  style?: any;
  t(key: string, options?: any): string;
}

@translate('translations')
export class VehicleStatusGraph extends React.Component<IVehicleStatusGraphProps> {
  public render() {
    const { t } = this.props;
    const isSingleScooter = this.props.amount === 1;
    const pieData = Object.keys(this.props.vehiclesByStatus)
        .map(status => ({
          status,
          amount: this.props.vehiclesByStatus[status].length,
        }))
        .filter(vehiclesByStatus => vehiclesByStatus.amount > 0)
        .map(vehiclesByStatus => ({
            value: vehiclesByStatus.amount,
            svg: {
                fill: vehicleStatusColors[vehiclesByStatus.status],
            },
            key: `pie-${vehiclesByStatus.status}`,
        }));
    if (!pieData.length) {
      pieData.push({
        value: 1,
        svg: {
            fill: customColors.grey1,
        },
        key: `pie-none`,
      });
    }
    return (
      <View style={[styles.vehicleStatusGraph, this.props.style]}>
        <Text style={[textStyles.paragraph, styles.vehicleAmount]}>
          {`${this.props.amount} ` + t(`pieChart.${isSingleScooter ? 'vehicle' : 'vehicles'}`)}
        </Text>
        <PieChart
              style={ { height: customSizes.main * 2.5, width: customSizes.main * 2.5 } }
              data={ pieData }
              innerRadius={customSizes.main + customSizes.space / 2}
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  vehicleStatusGraph: {
    height: customSizes.main * 2,
    width: customSizes.main * 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  vehicleAmount: {
    color: customColors.grey6,
    position: 'absolute',
    textAlign: 'center',
  },
});

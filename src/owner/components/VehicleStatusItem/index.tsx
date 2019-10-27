import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import {
  customSizes,
  customColors,
  textStyles,
  vehicleStatusColors,
} from '../../../common/styles';
import { translate } from 'react-i18next';

interface IVehicleStatusItemProps {
  vehicleStatus: string;
  vehicleCount: number;
  t(key: string, options?: any): string;
}

@translate('translations')
export class VehicleStatusItem extends React.Component<
  IVehicleStatusItemProps
> {
  public render() {
    const { t } = this.props;
    return (
      <TouchableHighlight>
        <View style={styles.vehicleStatusItem}>
          <View
            style={[
              styles.vehicleStatusIndicator,
              { backgroundColor: vehicleStatusColors[this.props.vehicleStatus] },
            ]}
          />
          <Text style={[textStyles.button, styles.vehicleStatusNumber]}>
            {this.props.vehicleCount}
          </Text>
          <Text style={[textStyles.description, styles.vehicleStatusText]}>
            {t(`rideStatus.${this.props.vehicleStatus}`)}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  vehicleStatusItem: {
    paddingHorizontal: customSizes.space / 2,
    paddingVertical: customSizes.space / 4,
    borderRadius: customSizes.space,
    borderColor: customColors.grey1,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customSizes.space / 2,
  },
  vehicleStatusIndicator: {
    width: customSizes.space / 2,
    height: customSizes.space / 2,
    borderRadius: customSizes.space / 2,
    marginRight: customSizes.space / 2,
    backgroundColor: customColors.black,
  },
  vehicleStatusNumber: {
    color: customColors.grey6,
    marginRight: customSizes.space / 2,
  },
  vehicleStatusText: {
    color: customColors.grey6,
  },
});

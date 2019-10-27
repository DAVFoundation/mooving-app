import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  customSizes,
  customColors,
  textStyles,
  vehicleStatusColors,
} from '../../../common/styles';
import { translate } from 'react-i18next';

interface IVehicleStatusLabelProps {
  nameScooter: string;
  vehicleStatus: any;
  style?: any;
  t?(key: string, options?: any): string;
}

@translate('translations')
export class VehicleStatusLabel extends React.Component<IVehicleStatusLabelProps> {
  public render() {
    const { t } = this.props;
    let backgroundColor = vehicleStatusColors.nosignal;
    if (vehicleStatusColors.hasOwnProperty(this.props.vehicleStatus)) {
      backgroundColor = vehicleStatusColors[this.props.vehicleStatus];
    }
    return (
      <View
        style={[
          styles.routeStatusLabel,
          this.props.style,
          { backgroundColor },
        ]}
      >
        <Text style={[textStyles.metadata, {color: customColors.black}]}>
          {t(`rideStatus.${this.props.vehicleStatus}`)}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  routeStatusLabel: {
    width: Platform.select({
      ios: customSizes.main * 2 - customSizes.space / 2,
      android: customSizes.main * 2,
    }),
    paddingHorizontal: customSizes.space / 2,
    height: customSizes.main / 2,
    backgroundColor: customColors.davGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
});

import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';
import { translate } from 'react-i18next';
import { customSizes } from '../../../common/styles';

interface IVehicleImageProps {
  imageUrl: string;
}

@translate('translations')
export default class VehicleImage extends Component<IVehicleImageProps> {

  public render() {
    const { imageUrl } = this.props;
    const defaultImage = require('../../assets/images/vehicles/default.png');
    return (
      <View style={styles.smallCircle}>
        <Image source={imageUrl ? {uri: imageUrl} : defaultImage} style={styles.vehiclePhoto}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  vehiclePhoto: {
    width: customSizes.space * 2.5,
    height: customSizes.space * 2.6,
  },
  smallCircle: {
    marginTop: customSizes.space,
    borderRadius: customSizes.space * 2,
    width: customSizes.space * 4,
    height: customSizes.space * 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

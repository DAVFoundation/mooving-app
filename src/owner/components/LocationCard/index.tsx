import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Linking,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { customSizes, customColors, textStyles } from '../../../common/styles';
import { shadowStyles } from '../../../common/styles/shadows';
import { LatLng } from 'react-native-maps';

interface ILocationCardProps {
  address?: string;
  image?: any;
  location: LatLng;
  openImage: (imageUrl: string) => void;
}

export class LocationCard extends React.Component<ILocationCardProps> {
  public openInMaps() {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${this.props.location.latitude},${
      this.props.location.longitude
    }`;
    const label = 'Custom Label';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url);
  }

  public openImage = () => {
    this.props.openImage(this.props.image);
  }

  public render() {
    return (
      <View style={[shadowStyles.large, styles.cardLocation]}>
        <View style={styles.cardLocationDetails}>
        <TouchableOpacity onPress={this.openImage}>
          <View style={styles.locationDetailsImage}>
            <Image
              source={this.props.image ? {uri: this.props.image} : require('../../../common/assets/illustrations/vehicles-illustration-grey.png')}
              accessible={true}
              resizeMode={this.props.image ? 'cover' : 'contain'}
              accessibilityLabel='Image of recent parked scooter location'
              style={{
                marginLeft: '5%',
                width: '90%',
                height: '90%',
              }}
            />
            </View>
          </TouchableOpacity>
          <View style={styles.locationDetailsText}>
            <Text style={textStyles.description} ellipsizeMode='tail' numberOfLines={3}>
            {this.props.address}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={this.openInMaps.bind(this)}
          style={styles.cardLocationToggle}
        >
          <Image
            source={require('../../assets/glyphs/glyph-location_red-medium.png')}
            accessible={true}
            accessibilityLabel='toggle down'
            style={{
              width: customSizes.main / 2,
              height: customSizes.main / 2,
            }}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardLocation: {
    borderRadius: 5,
    padding: customSizes.space / 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: customColors.white,
  },
  cardLocationDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDetailsImage: {
    height: customSizes.main,
    width: customSizes.main,
    borderRadius: 5,
    backgroundColor: customColors.grey0,
    marginRight: customSizes.space / 2,
    overflow: 'hidden',
  },
  locationDetailsText: {
    marginRight: customSizes.main + customSizes.space / 2,
  },
  cardLocationToggle: {
    width: customSizes.space * 2,
    height: customSizes.space * 2,
    borderRadius: customSizes.space * 2,
    backgroundColor: customColors.grey0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

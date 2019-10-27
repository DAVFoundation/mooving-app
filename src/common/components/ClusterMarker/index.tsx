import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Marker, LatLng, Region } from 'react-native-maps';
import { customColors, customSizes, textStyles } from '../../../common/styles';

interface IClusterMarkerProps {
  location: LatLng;
  pointCount: number;
  mapRegion: Region;
}

export default class ClusterMarker extends React.Component<IClusterMarkerProps> {

  public isVisible: boolean = false;
  public marker: any;

  constructor(props: any) {
    super(props);
    this.refMarker = this.refMarker.bind(this);
  }

  public shouldComponentUpdate(nextProps: IClusterMarkerProps) {
    const isVisible = this.isInsideMapBoundaries(nextProps.location);
    return isVisible;
  }

  public componentWillUpdate() {
    if (this.marker) {
      this.marker.redraw();
    }
  }

  public isInsideMapBoundaries(coordinate: LatLng) {
    const { mapRegion } = this.props;
    if (!mapRegion || !mapRegion.latitude || !mapRegion.longitude) {
      return false;
    }
    const northEast = {
      latitude: mapRegion.latitude + mapRegion.latitudeDelta,
      longitude: mapRegion.longitude + mapRegion.longitudeDelta,
    };
    const southWest = {
      latitude: mapRegion.latitude - mapRegion.latitudeDelta,
      longitude: mapRegion.longitude - mapRegion.longitudeDelta,
    };
    return (
      coordinate.latitude <= northEast.latitude &&
      coordinate.latitude >= southWest.latitude &&
      coordinate.longitude <= northEast.longitude &&
      coordinate.longitude >= southWest.longitude
    );
  }

  public refMarker(marker: any) {
    this.marker = marker;
  }

  public render() {
    const { location, pointCount } = this.props;
    return (
      <Marker
        ref={this.marker}
        tracksViewChanges={false}
        coordinate={location}>
        <View style={styles.circle}>
          <Text style={[textStyles.button, {color: customColors.white}]}>
            { pointCount }
          </Text>
        </View>
      </Marker>
    );
  }
}

const styles = StyleSheet.create({
  circle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: customColors.davRed,
    width: customSizes.space * 2,
    height: customSizes.space * 2,
    borderRadius: customSizes.main / 2,
    borderColor: customColors.white,
    borderWidth: 3,
  },
});

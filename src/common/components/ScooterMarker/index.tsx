import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Marker, Callout, LatLng, Region } from 'react-native-maps';
import { customColors, customSizes } from '../../../common/styles';
import BatteryLevel from '../../components/BatteryLevel';
import imageSource from '../../../common/assets/icons/icon-pin.png';

interface IScooterMarkerProps {
  location: LatLng;
  batteryLevel: number;
  qrCode: string;
  index?: number;
  mapRegion: Region;
  selectMarker?: (id: string, index: number) => void;
  refMarker?: (marker: any, id: string) => void;
}

export default class ScooterMarker extends React.Component<IScooterMarkerProps> {

  public isVisible: boolean = false;
  public marker: any;

  constructor(props: any) {
    super(props);
    this.refMarker = this.refMarker.bind(this);
    this.selectMarker = this.selectMarker.bind(this);
    this.isInsideMapBoundaries = this.isInsideMapBoundaries.bind(this);
  }

  public shouldComponentUpdate(nextProps: ScooterMarkerProps) {
    const isVisible = this.isInsideMapBoundaries(nextProps.location);
    return isVisible;
  }

  public componentWillUpdate() {
    if (this.marker) {
      this.marker.redraw();
    }
  }

  public selectMarker() {
    const { index, selectMarker, qrCode } = this.props;
    if (selectMarker && index) {
      selectMarker(qrCode, index);
    }
  }

  public refMarker(marker: any) {
    this.marker = marker;
    const { qrCode, refMarker } = this.props;
    if (refMarker) {
      refMarker(marker, qrCode);
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

  public render() {
    const { location, batteryLevel, qrCode } = this.props;
    return (
      <Marker
        identifier={qrCode}
        coordinate={location}
        image={imageSource}>
        <Callout tooltip={true}>
          <View style={styles.tooltip}>
            <BatteryLevel batteryLevel={batteryLevel} />
          </View>
        </Callout>
      </Marker>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  containerButtons: {
    ...StyleSheet.absoluteFillObject,
    top: customSizes.space,
    zIndex: 2,
  },

  tooltip: {
    borderRadius: 3,
    padding: 5,
    flexDirection: 'row',
    backgroundColor: customColors.blackTransparent,
    marginBottom: 5,
  },
  markerIcon: {
    resizeMode: 'contain',
    flex: 1,
    height: customSizes.main,
    width: customSizes.main,
    ...Platform.select({
      ios: {
        shadowColor: customColors.grey0,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
      },
      android: {
        // elevation: 2,
      },
    }),
  },
});

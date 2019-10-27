import React from 'react';
import { Component } from 'react';
import { View, TouchableOpacity, Image, Platform } from 'react-native';
import { PROVIDER_GOOGLE, Circle, Marker, Region } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import ClusteredMapView from 'react-native-maps-super-cluster';
import styles from './styles';
import { customColors, customSizes } from '../../styles';
import { STORE_LOCATION } from '../../constants';
import { LocationStore, defaultRegion } from '../../stores/LocationStore';
import ScooterMarker from '../ScooterMarker';
import ClusterMarker from '../ClusterMarker';
import Button, { buttonsStyle } from '../Button';
import { location } from '../Icons';

interface IMapState {
  region: any;
  isMapReady: boolean;
  accuracy: any;
}

export interface IMapProps {
  [STORE_LOCATION]: LocationStore;
  children: Array<string | JSX.Element> | JSX.Element | string;
  centerOnUserLocation?: boolean;
  clusteringEnabled?: boolean;
  userLocationIcon?: any;
  accuracyCircleColor?: string;
  updateMapCenter?: boolean;
  data: any;
  onPressMap?: () => void;
}

const mapDefaultFocus = {
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};

export default abstract class Map extends Component<IMapProps, IMapState> {
  protected map: any;
  constructor(props: IMapProps) {
    super(props);
    const { userLocation, init } = this.props[STORE_LOCATION];
    const userLocationIsReady = userLocation.longitude && userLocation.latitude;
    const region = userLocationIsReady
      ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          ...mapDefaultFocus,
        }
      : defaultRegion;
    this.state = {
      region,
      accuracy: 0,
      isMapReady: false,
    };
    this.animateToUserLocation = this.animateToUserLocation.bind(this);
    this.onRegionChange = this.onRegionChange.bind(this);
    this.renderMarker = this.renderMarker.bind(this);
    this.renderCluster = this.renderCluster.bind(this);
    this.setRegion = this.setRegion.bind(this);
    this.onPress = this.onPress.bind(this);
  }

  public async setRegion(position: any) {
    const region = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    this.setState(state => ({ region: { ...state.region, ...region } }));
  }

  public async animateToUserLocation() {
    if (!this.state.isMapReady) {
      return;
    }
    const { userLocation } = this.props[STORE_LOCATION];
    if (userLocation.longitude && userLocation.latitude) {
      this.map.mapview.animateToRegion(
        { ...mapDefaultFocus,
          longitude: userLocation.longitude,
          latitude: userLocation.latitude,
        },
        1000,
      );
    } else {
      const { init } = this.props[STORE_LOCATION];
      const hasLocationPermission = await init();
      if (hasLocationPermission) {
        const { longitude, latitude } = this.props[STORE_LOCATION].userLocation;
        this.map.mapview.animateToRegion(
          { ...mapDefaultFocus,
            longitude, latitude          },
          1000,
        );
      }
    }
  }

  public onRegionChange(region: Region) {
    if (this.props.updateMapCenter) {
      this.setState({ region });
      const { setMapRegion } = this.props[STORE_LOCATION];
      setMapRegion(region);
    }
  }

  public onPress() {
    if (this.props.onPressMap) {
      this.props.onPressMap();
    }
  }

  public renderMarker(data: any) {
    return <ScooterMarker {...data} mapRegion={this.state.region} key={data.qrCode} />;
  }

  public renderCluster(cluster: any) {
    const { pointCount, coordinate } = cluster;

    return (
      <ClusterMarker
        pointCount={pointCount}
        mapRegion={this.state.region}
        location={coordinate}/>
    );
  }

  public renderUserLocationMarker({ userLocation }) {
    if (userLocation.latitude && userLocation.longitude) {
      return (
        <Marker
          anchor={{ x: 0.5, y: 0.5 }}
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}>
          {this.props.userLocationIcon || (
            <Image
              style={{
                width: customSizes.iconButton / 1.5,
                height: customSizes.iconButton / 1.5,
              }}
              source={require('../../assets/glyphs/glyph-userlocation_blue-medium.png')}
            />
          )}
        </Marker>
      );
    }
  }

  public renderGpsAccuracyCircle({ userLocation }) {
    const { accuracy } = this.state;
    if (userLocation.latitude && userLocation.longitude) {
      return (
        <Circle
          center={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          fillColor={
            this.props.accuracyCircleColor || customColors.blueTransparent
          }
          radius={accuracy * 2}
          strokeWidth={0}/>
      );
    }
  }

  public render() {
    const { userLocation } = this.props[STORE_LOCATION];
    const { region } = this.state;

    return (
      <View style={[styles.container]}>
        <ClusteredMapView
          ref={ref => {
            this.map = ref;
          }}
          maxZoom={14}
          radius={customSizes.window.width * 0.1}
          extent={1024}
          renderMarker={this.renderMarker}
          renderCluster={this.renderCluster}
          data={this.props.data || []}
          onPress={this.onPress}
          clusteringEnabled={this.props.clusteringEnabled}
          initialRegion={region}
          onRegionChangeComplete={this.onRegionChange}
          provider={PROVIDER_GOOGLE}
          onMapReady={this.onMapReady}
          showsCompass={false}
          style={[styles.map]}
          animateClusters={false}>
          {this.props.children}
          {this.renderGpsAccuracyCircle({ userLocation })}
          {this.renderUserLocationMarker({ userLocation })}
        </ClusteredMapView>
        <Button
          style={[ buttonsStyle.smallCircle, styles.animateToUserLocationButton, {
              ...Platform.select({
                ios: {
                  shadowColor: customColors.black,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                },
                android: {
                  elevation: 10,
                },
              }),
          }]}
          icon={location}
          onPress={this.animateToUserLocation}/>
      </View>
    );
  }
}

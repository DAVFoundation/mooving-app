import MapBase, { IMapProps } from '../../../common/components/Map';
import { inject, observer } from 'mobx-react/native';
import { STORE_LOCATION } from '../../constants';
import { IOpsVehicle } from '../../../common/lib/types';
import React from 'react';
import { View } from 'react-native';
import styles from '../../../common/components/Map/styles';
import { customSizes } from '../../../common/styles';
import ClusteredMapView from 'react-native-maps-super-cluster';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { location } from '../../../common/components/Icons';
import { PROVIDER_GOOGLE } from 'react-native-maps';

@inject(STORE_LOCATION)
@observer
export default class Map extends MapBase {
  constructor(props: IMapProps) {
    super(props);
    this.onMapReady = this.onMapReady.bind(this);
  }

  public onMapReady() {
    this.setState({ isMapReady: true });
    const vehicles = this.props.data.map((vehicle: IOpsVehicle) => vehicle.qrCode);
    this.map.mapview.fitToSuppliedMarkers(vehicles,
      {edgePadding: { top: 20, left: 20, bottom: 20, right: 20 }});
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
          radius={customSizes.window.width * 0.1}
          extent={1024}
          renderMarker={this.renderMarker}
          renderCluster={this.renderCluster}
          data={this.props.data || []}
          onPress={this.onPress}
          clusteringEnabled={false}
          initialRegion={region}
          toolbarEnabled={false}
          onRegionChangeComplete={this.onRegionChange}
          provider={PROVIDER_GOOGLE}
          onMapReady={this.onMapReady}
          showsCompass={false}
          style={[styles.map]}
          mapPadding={{bottom: customSizes.space}}
          animateClusters={false}>
          {this.props.children}
          {this.renderGpsAccuracyCircle({ userLocation })}
          {this.renderUserLocationMarker({ userLocation })}
        </ClusteredMapView>
        <Button
          style={[ buttonsStyle.smallCircle,
                   styles.animateToUserLocationButton,
                   {
                     bottom: customSizes.main / 2,
                   },
                ]}
          icon={location}
          onPress={this.animateToUserLocation}/>
      </View>
    );
  }
}

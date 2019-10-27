import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VehicleStatusItem } from '../VehicleStatusItem';
import { VehicleStatus } from '../../../common/lib/types';

interface IVehicleStatusListProps {
  vehiclesByStatus?: any;
}

export class VehicleStatusList extends React.Component<
  IVehicleStatusListProps
> {
  public render() {
    return (
      <View style={styles.vehicleStatusList}>
        {Object.keys(VehicleStatus).map(status => (
          <VehicleStatusItem
            vehicleStatus={status}
            key={status}
            vehicleCount={this.props.vehiclesByStatus[status].length}
          />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  vehicleStatusList: {
    flex: 1,
    flexDirection: 'column',
    alignSelf: 'stretch',
  },
});

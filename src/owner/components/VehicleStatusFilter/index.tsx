import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  customSizes,
  customColors,
  textStyles,
  vehicleStatusColors,
} from '../../../common/styles';
import { VehicleStatus } from '../../../common/lib/types';
import { translate } from 'react-i18next';

interface IVehicleStatusFilterProps {

  manageState: any;
  manageFilter: any;
  manageClick: any;
  t?(key: string, options?: any): string;
}

@translate('translations')
export class VehicleStatusFilter extends React.Component<
  IVehicleStatusFilterProps
> {

  public render() {
    const  statusFilter = this.props.manageState;
    const { t } = this.props;
    return (
      <ScrollView horizontal={true}>
        <TouchableOpacity
          style={[
            styles.statusFilter,
            {
              backgroundColor:
                statusFilter === 'all'
                  ? customColors.davRed
                  : customColors.grey0,
              borderColor:
                statusFilter === 'all'
                  ? customColors.davRed
                  : customColors.grey1,
            },
          ]}
          onPress={() => this.props.manageClick('all')}

        >
          <Text
            style={[
              textStyles.description,
              styles.statusFilterText,
              {
                color:
                  statusFilter === 'all'
                    ? customColors.white
                    : customColors.black,
              },
            ]}
          >
            {t('rideStatus.all')}
          </Text>
        </TouchableOpacity>
        {Object.keys(VehicleStatus).map(key => (
          <TouchableOpacity
            key={key}
            style={[
              styles.statusFilter,
              {
                backgroundColor:
                  statusFilter === key
                    ? customColors.davRed
                    : customColors.grey0,
                borderColor:
                  statusFilter === key
                    ? customColors.davRed
                    : customColors.grey1,
              },
            ]}
            onPress={() => this.props.manageClick(key)}
            >
            <View
              style={[
                styles.dot,
                { backgroundColor: vehicleStatusColors[key] },
              ]}
            />
            <Text
              style={[
                textStyles.description,
                styles.statusFilterText,
                {
                  color:
                    statusFilter === key
                      ? customColors.white
                      : customColors.black,
                },
              ]}
            >
              {t(`rideStatus.${key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  statusFilter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: customSizes.space / 2,
    borderColor: customColors.grey1,
    height: Platform.select({
      ios: customSizes.main / 2,
      android: customSizes.space * 2,
    }),
    borderRadius: Platform.select({
      ios: customSizes.main / 4,
      android: customSizes.space,
    }),
    margin: customSizes.space / 2,
    marginRight: customSizes.space / 4,
    borderWidth: 1,
  },
  statusFilterText: {
    color: customColors.white,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginVertical: 6,
    marginLeft: 0,
    marginRight: 6,
  },
});

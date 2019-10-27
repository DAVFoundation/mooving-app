import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  customSizes,
  customColors,
  textStyles,
} from '../../../common/styles';
import { NotificationBar } from '../../components/NotificationBar';
import { TotalAmount } from '../../components/TotalAmount';
import { VehicleStatusList } from '../../components/VehicleStatusList';
import { VehicleStatusGraph } from '../../components/VehicleStatusGraph';
import { Row, Column } from '../../components/Layout';
import { capitalizeFirstLetter } from '../../../common/lib/helpers';
import { inject, observer } from 'mobx-react/native';
import { STORE_VEHICLE, STORE_ACCOUNT } from '../../constants';
import { VehicleStore } from '../../stores/VehicleStore';
import { AccountStore } from '../../stores/AccountStore';
import { VehicleStatus } from '../../../common/lib/types';
import { translate } from 'react-i18next';
import { TimePeriodPicker } from '../../components/TimePeriodPicker';
import { TimePeriods } from '../../lib/types';

interface IDashboardCardProps {
  [STORE_VEHICLE]: VehicleStore;
  [STORE_ACCOUNT]: AccountStore;
  position?: any;
  t(key: string, options?: any): string;
}

interface IDashboardState {
  period: string;
  isPickerOpen: boolean;
}

@translate('translations')
@inject(STORE_VEHICLE, STORE_ACCOUNT)
@observer
export class DashboardCard extends React.Component<IDashboardCardProps, IDashboardState> {

  constructor(props: IDashboardCardProps) {
    super(props);
    this.state = {
      period: TimePeriods.today,
      isPickerOpen: false,
    };
  }

  public changePeriod = (period: string) => {
    this.setState({period, isPickerOpen: false});
  }

  public togglePicker = () => {
    this.setState(({isPickerOpen}) => ({isPickerOpen: !isPickerOpen}));
  }

  public render() {
    const { t } = this.props;
    const { currencyCode } = this.props[STORE_ACCOUNT];
    const vehicles = Object.values(this.props[STORE_VEHICLE].vehicles);
    const vehiclesByStatus: any = {};
    const stats = this.props[STORE_ACCOUNT][this.state.period];
    Object.keys(VehicleStatus).forEach(status => {
      vehiclesByStatus[status] = vehicles.filter(
        (vehicle: any) => vehicle.status === status,
      );
    });
    return (
      <View style={styles.detailsCard}>
        {!vehicles.length && (
          <NotificationBar
            backgroundColor={customColors.davOrangeSecondary}
            text={t('notifications.noVehicles')}
          />
        )}
          <View style={{padding: customSizes.space / 2}}>
            <Text style={[textStyles.h2, styles.cardHeader]}>
              {capitalizeFirstLetter(this.state.period)}
            </Text>

            <View style={{ display: 'flex', flexDirection: 'row' }}>
              <TotalAmount category='income'
                amount={stats && stats.income ? stats.income : 0}
                style={{marginRight: customSizes.space / 2}} currencyCode={currencyCode} />
              <TotalAmount category='rides' amount={stats && stats.income ? stats.rides : 0} />
            </View>
            <Row
              style={{
                justifyContent: 'space-between',
                marginTop: customSizes.space,
              }}>
              <Column
                distanceRight={customSizes.space / 2}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                  marginBottom: customSizes.space / 2,
                }}>
                <VehicleStatusGraph
                  style={{marginTop: customSizes.space}}
                  amount={vehicles.length}
                  vehiclesByStatus={vehiclesByStatus}
                />
              </Column>
              <Column style={{ flex: 1 }}>
                <VehicleStatusList vehiclesByStatus={vehiclesByStatus} />
              </Column>
            </Row>
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  detailsCard: {
    backgroundColor: customColors.white,
    borderTopLeftRadius: customSizes.space,
    borderTopRightRadius: customSizes.space,
    marginTop: -customSizes.space,
  },
  cardHeader: {
    color: customColors.black,
    paddingHorizontal: customSizes.space / 2,
    paddingVertical: customSizes.space / 2,
  },
  picker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

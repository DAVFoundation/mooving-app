import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import { translate } from 'react-i18next';
import { ListItem } from '../../components/ListItem';
import { customColors, customSizes, textStyles } from '../../../common/styles';
import { RequestStatus, IOpsVehicle } from '../../../common/lib/types';
import { VehicleModal } from '../VehicleModal';
import { SearchBar } from '../../components/SearchBar';
import { STORE_VEHICLE } from '../../constants';
import { observer, inject } from 'mobx-react/native';
import { VehicleStore } from '../../stores/VehicleStore';
import { VehicleStatusFilter } from '../../components/VehicleStatusFilter';
import { shadowStyles } from '../../../common/styles/shadows';
import StatusChangeErrorModal from '../StatusChangeErrorModal';
import { NavigationScreenProp } from 'react-navigation';

interface IVehiclesProps {
  [STORE_VEHICLE]: VehicleStore;
  isFetching: false;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

interface IVehiclesState {
  searchFilter: string;
  statusFilter: string;
  activeVehicleModal: string;
}

@translate('translations')
@inject(STORE_VEHICLE)
@observer
export default class Vehicles extends React.Component<
  IVehiclesProps,
  IVehiclesState
> {
  constructor(props?: any) {
    super(props);
    this.state = {
      searchFilter: '',
      statusFilter: 'all',
      activeVehicleModal: '',
    };
    this.onRefresh = this.onRefresh.bind(this);
    this.filterVehicles = this.filterVehicles.bind(this);
    this.renderListItem = this.renderListItem.bind(this);
    this.updateStatusFilter = this.updateStatusFilter.bind(this);
    this.updateSearchFilter = this.updateSearchFilter.bind(this);
    this.openSingleVehicleModal = this.openSingleVehicleModal.bind(this);
  }

  private keyExtractor(item: any) {
    return item.qrCode;
  }

  public componentWillMount() {
    this.props.navigation.addListener('willBlur', Keyboard.dismiss);
  }

  public onRefresh() {
    const { getVehicles } = this.props[STORE_VEHICLE];
    getVehicles();
  }

  public updateSearchFilter(value: string) {
    this.setState({ searchFilter: value });
  }

  public updateStatusFilter(value: string) {
    this.setState({ statusFilter: value });
  }

  public closeModal = () => {
    this.setState({
      activeVehicleModal: '',
    });
  }

  public filterVehicles(vehicle: IOpsVehicle): boolean {
    const filterStatus =
      this.state.statusFilter === 'all' ||
      vehicle.status === this.state.statusFilter;
    const filterName =
      !vehicle.name ||
      vehicle.name
        .toLowerCase()
        .includes(this.state.searchFilter.toLowerCase());
    return filterStatus && filterName;
  }

  public openSingleVehicleModal(vehicle: IOpsVehicle) {
    this.props[STORE_VEHICLE].getVehicleFullDetails(vehicle.id);
    this.setState({activeVehicleModal: vehicle.id});
  }

  public renderListItem(props: any) {
    const { item } = props;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => this.openSingleVehicleModal(item)}
        key={item.qrCode}>
        <ListItem
          showSpinner={item.isWaitingForStatusChange || item.inTransition}
          nameScooter={item.name || ''}
          vehicleStatus={item.status || ''}
          batteryLevel={item.batteryLevel || 0}
          profitDaily={0}/>
      </TouchableOpacity>
    );
  }

  public renderEmptyList() {
    const { t } = this.props;
    return (
      <View>
      <View style={styles.pageHeader}>
        <Text
          style={[
            textStyles.h2,
            textStyles.alignCenter,
            { color: customColors.black },
          ]}>
          {t('vehicles.title')}
        </Text>
      </View>
      <View style={[shadowStyles.large, styles.emptyScootersContainer]}>
        <Image
          source={require('../../../common/assets/illustrations/vehicles-illustration.png')}
          style={{
            width: customSizes.window.width - customSizes.main,
            height: (customSizes.window.width - customSizes.main) / 2.4,
          }}
          resizeMode='cover'
          />
        <Text
          style={[textStyles.calloutResponsive, textStyles.alignCenter]}
        >
          {t('vehicles.novehicles.description')}
        </Text>
      </View>
    </View>
    );
  }

  public loadMoreFeedbacks = (vehicleId: string) => {
    this.props[STORE_VEHICLE].loadMoreFeedbacksForVehicle(vehicleId);
  }

  public render() {
    const { requestStatus } = this.props[STORE_VEHICLE];
    const vehicles = Object.values(this.props[STORE_VEHICLE].vehicles);
    const isRefreshing = requestStatus === RequestStatus.pending;
    const { t } = this.props;
    const { searchFilter, activeVehicleModal } = this.state;
    let activeVehicle;
    if (activeVehicleModal) {
      activeVehicle = this.props[STORE_VEHICLE].vehicles[activeVehicleModal];
    }
    const filteredVehicles = vehicles.filter(this.filterVehicles);
    return (
      <View style={StyleSheet.absoluteFill}>
        <VehicleModal
          vehicleId={activeVehicle && activeVehicle.id}
          loadMoreFeedbacks={this.loadMoreFeedbacks}
          isVisible={!!(activeVehicleModal && activeVehicle && activeVehicle.feedbacks)}
          closeModal={this.closeModal}/>
        <ScrollView
          style={styles.pageContainer}
          keyboardShouldPersistTaps='always'
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={this.onRefresh}
              title={t('vehicles.refresh')}
            />
          }>
          {vehicles.length ? (
            <View>
              <View style={styles.pageHeader}>
                <Text
                  style={[
                    textStyles.h2,
                    textStyles.alignCenter,
                    { color: customColors.black },
                  ]}>
                  {t('vehicles.title')}
                </Text>
                <SearchBar
                  style={{marginVertical: customSizes.space / 2}}
                  placeholder={t('vehicles.searchbar')}
                  value={searchFilter}
                  onChangeText={this.updateSearchFilter}
                />
                <VehicleStatusFilter
                  manageFilter={this.filterVehicles}
                  manageClick={this.updateStatusFilter}
                  manageState={this.state.statusFilter}
                />
              </View>
              {
                filteredVehicles.length ?
                <FlatList
                  keyboardShouldPersistTaps='always'
                  data={filteredVehicles}
                  style={styles.flatListContainer}
                  keyExtractor={this.keyExtractor}
                  renderItem={this.renderListItem}
                  />
                :
                <View style={styles.noVehiclesOfTypeContainer}>
                  <Image source={require('../../../common/assets/illustrations/vehicles-illustration-grey.png')}
                         style={{
                            width: customSizes.window.width - customSizes.main,
                            height: (customSizes.window.width - customSizes.main) / 2.4,
                         }}
                         resizeMode='cover'
                         />
                  <Text style={[textStyles.description, styles.noVehiclesOfTypeText]}>
                    {t('vehicles.noVehiclesOfType.text')}
                  </Text>
                </View>
              }
            </View>
          ) : this.renderEmptyList()
          }
        </ScrollView>
        <StatusChangeErrorModal/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pageContainer: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    flexDirection: 'column',
    backgroundColor: customColors.grey0,
  },
  pageHeader: {
    marginHorizontal: customSizes.space / 2,
    marginTop: customSizes.space * 2,
  },
  flatListContainer: {
    marginTop: customSizes.space / 2,
    marginBottom: customSizes.space * 2,
  },
  emptyScootersContainer: {
    margin: customSizes.space / 2,
    backgroundColor: customColors.white,
    minHeight: customSizes.window.height / 2,
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 10,
    padding: customSizes.space,
  },
  noVehiclesOfTypeText: {
    marginTop: customSizes.space / 2,
    color: customColors.grey4,
    fontWeight: 'bold',
  },
  noVehiclesOfTypeContainer: {
    marginTop: customSizes.space * 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

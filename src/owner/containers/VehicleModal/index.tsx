import React from 'react';
import { View, Text, StyleSheet, SectionList, Image, TouchableWithoutFeedback, BackHandler } from 'react-native';
import { customSizes, customColors, textStyles } from '../../../common/styles';
import Modal from 'react-native-modal';
import { TotalAmount } from '../../components/TotalAmount';
import { Row } from '../../components/Layout';
import { viewportHeight } from '../../../common/lib/helpers';
import { VehicleStatusLabel } from '../../components/VehicleStatusLabel';
import BatteryLevel from '../../../common/components/BatteryLevel';
import { LocationCard } from '../../components/LocationCard';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { crossWhite } from '../../../common/components/Icons';
import Feedback from '../../components/Feedback';
import { ModeBar } from '../../components/ModeBar';
import { translate } from 'react-i18next';
import { inject, observer } from 'mobx-react/native';
import { STORE_VEHICLE, STORE_APP, STORE_ACCOUNT } from '../../constants';
import { VehicleStore } from '../../stores/VehicleStore';
import { AppStore } from '../../stores/AppStore';
import { AccountStore } from '../../stores/AccountStore';
import StatusChangeErrorModal from '../../containers/StatusChangeErrorModal';
import { IOpsVehicle, DBVehicleStatus } from '../../../common/lib/types';
import { InteractiveModal } from '../../../common/components/InteractiveModal';
interface IVehicleModalProps {
  [STORE_VEHICLE]: VehicleStore;
  [STORE_APP]: AppStore;
  [STORE_ACCOUNT]: AccountStore;
  closeModal?: any;
  vehicleId?: string;
  isVisible?: any;
  style?: any;
  loadMoreFeedbacks: (feedbackId: string) => void;
  t(key: string, options?: any): string;
}

interface IState {
  openedImage?: string;
  statusChangeAlert?: string;
  isWaitingForStatusChange?: boolean;
}

@translate('translations')
@inject(STORE_VEHICLE, STORE_APP, STORE_ACCOUNT)
@observer
export class VehicleModal extends React.Component<IVehicleModalProps, IState> {

  constructor(props: IVehicleModalProps) {
    super(props);
    this.state = { };
    this.initComponent(props.vehicleId);
  }

  private setVehicleWaitingForStatusChange(vehicleId: string, isWaitingForStatusChange: boolean) {
    if (!!vehicleId) {
      this.props[STORE_VEHICLE].setVehicleWaitingForStatusChange(vehicleId, isWaitingForStatusChange);
      if (vehicleId === this.props.vehicleId) {
        this.setState({ isWaitingForStatusChange });
      }
    }
  }

  public shouldComponentUpdate(nextProps: IVehicleModalProps) {
    if (nextProps.vehicleId !== this.props.vehicleId) {
      this.initComponent(nextProps.vehicleId);
    }
    return !!nextProps.vehicleId || !nextProps.isVisible;
  }

  public async initComponent(vehicleId = this.props.vehicleId) {
    if (!!vehicleId) {
      const vehicle = this.props[STORE_VEHICLE].vehicles[vehicleId];
      this.setState({
        openedImage: '',
        statusChangeAlert: '',
        isWaitingForStatusChange: vehicle.isWaitingForStatusChange,
      });
    }
  }

  public changeVehicleStatus = async (vehicleStatus: string) => {
    if (!this.props[STORE_APP].statusChangeAlert[vehicleStatus]) {
      this.setState({ statusChangeAlert: vehicleStatus });
      return;
    }
    const { vehicleId } = this.props;
    if (vehicleId) {
      this.setVehicleWaitingForStatusChange(vehicleId, true);
      setImmediate(async () => {
        const jobId = await this.props[STORE_VEHICLE].updateVehicleStatus(vehicleId, vehicleStatus);
        this.props[STORE_VEHICLE].watchStatus(vehicleId, vehicleStatus, jobId).subscribe(
          () => {
            this.setVehicleWaitingForStatusChange(vehicleId, false);
            this.props[STORE_VEHICLE].deleteSubscription(vehicleId);
          },
          () => {
            this.setVehicleWaitingForStatusChange(vehicleId, false);
            this.props[STORE_VEHICLE].setChangeStatusError(vehicleId, vehicleStatus);
            this.props[STORE_VEHICLE].deleteSubscription(vehicleId);
          },
        );
      });
    }
  }

  public acceptChangeVehicleStatus = () => {
    if (this.state.statusChangeAlert) {
      const vehicleStatus = this.state.statusChangeAlert;
      this.props[STORE_APP].setStatusChangeAlert(vehicleStatus);
      this.dismissStatusChangeAlert();
      this.changeVehicleStatus(vehicleStatus);
    }
  }

  public renderFeedback = (props: any) => {
    return (
      <View style={{ backgroundColor: customColors.grey0, padding: customSizes.space / 2, marginTop: -1 }}>
        <Feedback {...props.item} openParkingPhoto={this.openParkingPhoto} />
      </View>
    );
  }

  public loadMoreFeedbacks = () => {
    if (this.props.vehicleId) {
      this.props.loadMoreFeedbacks(this.props.vehicleId);
    }
  }

  public openParkingPhoto = (imageUrl: string) => {
    this.setState({ openedImage: imageUrl });
    BackHandler.addEventListener('hardwareBackPress', this.closeParkingPhoto);
  }

  public closeParkingPhoto = () => {
    this.setState({ openedImage: '' });
    BackHandler.removeEventListener('hardwareBackPress', this.closeParkingPhoto);
  }

  public dismissStatusChangeAlert = () => {
    this.setState({ statusChangeAlert: '' });
  }

  public renderParkingImage(imageUrl: string) {
    return (
      <TouchableWithoutFeedback onPress={this.closeParkingPhoto}>
        <View style={[styles.overlay, StyleSheet.absoluteFill]}>
          <Image style={{
            position: 'absolute',
            left: customSizes.space * 2,
            right: customSizes.space * 2,
            top: customSizes.main * 2,
            bottom: customSizes.main,
          }} source={{ uri: imageUrl }}
            resizeMethod='scale' />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  public renderHeaderSection = () => {
    const { t } = this.props;
    const vehicle = this.props[STORE_VEHICLE].vehicles[this.props.vehicleId];
    const { currencyCode } = this.props[STORE_ACCOUNT];
    if (!vehicle) {
      return null;
    }
    return (
      <View>
        <View style={styles.cardContainer}>
          <ModeBar showSpinner={!!this.state.isWaitingForStatusChange || !!vehicle.inTransition}
            vehicleStatus={vehicle.status}
            disabled={vehicle.status === DBVehicleStatus.onmission || !!vehicle.inTransition}
            modeChanged={this.changeVehicleStatus} />
          <Row>
            <TotalAmount
              category='income'
              style={{ marginRight: customSizes.space / 2 }}
              amount={vehicle.totalProfit || 0}
              currencyCode={currencyCode}
            />
            <TotalAmount category='rides' amount={vehicle.totalUse || 0} />
          </Row>
          <Text style={[textStyles.h3, styles.containerSubtitle, { marginBottom: customSizes.space }]}>
            {t('vehicles.vehicleModal.location')}
          </Text>
          <LocationCard
            openImage={this.openParkingPhoto}
            address={vehicle.formattedAddress}
            location={vehicle.location}
            image={vehicle.lastParkingImageUrl}
          />
          <Text style={[textStyles.h3, styles.containerSubtitle]}>
            {t('vehicles.vehicleModal.feedback')}
          </Text>
        </View>
        {
          !vehicle.feedbacks || !vehicle.feedbacks.length ?
            this.renderEmptyFeedbackList() : null
        }
      </View>
    );
  }

  public renderEmptyFeedbackList = () => {
    const { t } = this.props;
    return (
      <View style={styles.emptyFeedbackList}>
        <Text style={[textStyles.description, {
          color: customColors.grey3,
          fontWeight: 'bold',
        }]}>
          {t('vehicles.vehicleModal.emptyFeedbackListText')}
        </Text>
      </View>
    );
  }

  public renderFeedbackList(vehicle: IOpsVehicle) {
    if (!vehicle.feedbacks) {
      return null;
    }
    return (
      <SectionList
        style={{
          paddingTop: customSizes.space * 4,
          marginTop: -customSizes.space * 4,
          flex: 1,
        }}
        ListHeaderComponent={this.renderHeaderSection}
        ListEmptyComponent={this.renderEmptyFeedbackList}
        contentContainerStyle={{ paddingBottom: customSizes.main * 1.5 }}
        keyExtractor={(item, index) => item + index}
        onEndReached={this.loadMoreFeedbacks}
        sections={[
          { renderItem: this.renderFeedback, data: vehicle.feedbacks.slice() },
        ]}>
      </SectionList>
    );
  }

  public render() {
    if (!this.props.isVisible || !this.props.vehicleId) {
      return null;
    }
    const { t } = this.props;
    const vehicle = this.props[STORE_VEHICLE].vehicles[this.props.vehicleId];
    return (
      <View>
        <Modal
          isVisible={this.props.isVisible}
          style={styles.detailsModal}
          hideModalContentWhileAnimating={true}
          onBackdropPress={this.props.closeModal}
          onBackButtonPress={this.props.closeModal}
          deviceHeight={customSizes.window.height}
          deviceWidth={customSizes.window.width}
          animationInTiming={360}>
          <StatusChangeErrorModal/>
          <InteractiveModal
            submit={this.acceptChangeVehicleStatus}
            cancel={this.dismissStatusChangeAlert}
            isOpen={!!this.state.statusChangeAlert}
            title={t(`vehicles.vehicleModal.alerts.${this.state.statusChangeAlert}.title`)}
            titleStyle={{ fontSize: 18 }}
            text={t(`vehicles.vehicleModal.alerts.${this.state.statusChangeAlert}.text`)}
            buttonApproveText='Switch'
            buttonRejectText='Cancel'
          />
          <View style={styles.detailsCard}>
            <View style={styles.cardHeader}>
              <Button
                style={[buttonsStyle.smallCircle, { backgroundColor: customColors.whiteTransparent }]}
                icon={crossWhite}
                onPress={this.props.closeModal} />
              <Text
                style={[
                  textStyles.h2,
                  {
                    color: customColors.white,
                    marginVertical: customSizes.space / 2,
                  },
                ]}>
                {vehicle.name}
              </Text>
              <View style={styles.secondaryHeader}>
                <Text style={[textStyles.calloutResponsive, { color: customColors.white }]}>
                  {vehicle.model}
                </Text>
                <Row style={{ marginTop: customSizes.space / 2 }}>
                  <VehicleStatusLabel
                    nameScooter={vehicle.name}
                    vehicleStatus={vehicle.status}
                    style={{ marginRight: customSizes.space / 2 }}
                  />
                  <BatteryLevel
                    isDark={false}
                    batteryLevel={vehicle.batteryLevel}
                  />
                </Row>
              </View>
            </View>
            {
              this.renderFeedbackList(vehicle)
            }
          </View>
          {this.state.openedImage ? this.renderParkingImage(this.state.openedImage) : null}
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  detailsModal: {
    marginHorizontal: customSizes.space / 2,
    marginVertical: 0,
    padding: 0,
  },
  cardHeader: {
    backgroundColor: customColors.davRed,
    padding: customSizes.spaceFluidSmall,
    paddingBottom: customSizes.space,
  },
  secondaryHeader: {
    backgroundColor: customColors.davRed,
  },
  detailsCard: {
    flex: 1,
    minHeight: customSizes.window.height / 2,
    borderTopLeftRadius: customSizes.space,
    borderTopRightRadius: customSizes.space,
    backgroundColor: customColors.grey0,
    marginTop: viewportHeight(10),
    overflow: 'hidden',
  },
  closeButton: {
    backgroundColor: customColors.blackTransparent2,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  cardContainer: {
    padding: customSizes.space / 2,
    backgroundColor: customColors.grey0,
    display: 'flex',
    justifyContent: 'flex-start',
    flex: 1,
  },
  containerSubtitle: {
    marginLeft: customSizes.space / 2,
    color: customColors.grey7,
    marginTop: customSizes.space,
  },
  overlay: {
    margin: -customSizes.space,
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
    zIndex: 95,
    backgroundColor: customColors.blackTransparent1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFeedbackList: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: customSizes.space / 2,
  },
});

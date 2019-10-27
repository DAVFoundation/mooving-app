import React from 'react';
import { translate } from 'react-i18next';
import { STORE_VEHICLE } from '../../constants';
import { observer, inject } from 'mobx-react';
import { VehicleStore } from '../../stores/VehicleStore';
import { ErrorModal } from '../../../common/components/ErrorModal';

interface IStatusChangeErrorModalProps {
  [STORE_VEHICLE]: VehicleStore;
  onDismiss?: () => void;
}

@translate('translations')
@inject(STORE_VEHICLE)
@observer
export default class StatusChangeErrorModal extends React.Component<IStatusChangeErrorModalProps> {

  public closeErrorModal = () => {
    this.props[STORE_VEHICLE].dismissChangeStatusError();
  }

  public render() {
    const { t } = this.props;
    const error = this.props[STORE_VEHICLE].error;
    if (!error) {
      return null;
    }
    const scooterName = this.props[STORE_VEHICLE].vehicles[error.vehicleId].name;
    const status = error.status;
    return (
      <ErrorModal
        title={t('errors.changeVehicleStatus.title')}
        text={
          t('errors.changeVehicleStatus.text')
            .replace('$scooterName', scooterName)
            .replace('$status', t(`rideStatus.${status}`))
        }
        onRequestClose={this.props[STORE_VEHICLE].dismissChangeStatusError}
        closeErrorModal={this.closeErrorModal}
        isOpen={true} />
    );
  }
}

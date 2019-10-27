import React from 'react';
import { StyleSheet } from 'react-native';
import { customSizes } from '../../../common/styles';
import { TimePeriods } from '../../lib/types';
import { capitalizeFirstLetter } from '../../../common/lib/helpers';
import ModalSelector from 'react-native-modal-selector';

interface ITimePeriodPickerProps {
  changePeriod: (period: string) => void;
  selectedPeriod: string;
  visible: boolean;
}

const periods = Object.keys(TimePeriods);

export class TimePeriodPicker extends React.Component<ITimePeriodPickerProps> {

  public changePeriod = (value: any) => {
    this.props.changePeriod(value.label.toLocaleLowerCase());
  }
  public render() {
    const data = periods.map((label, key) =>
      ({label: capitalizeFirstLetter(label),
        key,
        section: label === this.props.selectedPeriod}));
    return (
      <ModalSelector
        overlayStyle={styles.picker}
        visible={this.props.visible}
        touchableStyle={{display: 'none'}}
        onChange={this.changePeriod}
        data={data}>
      </ModalSelector>
    );
  }
}

const styles = StyleSheet.create({
  picker: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
    paddingBottom: customSizes.main,
  },
});

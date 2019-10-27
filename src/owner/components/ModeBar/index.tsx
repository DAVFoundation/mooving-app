import React from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image, Animated, Platform } from 'react-native';
import { customColors, customSizes, textStyles, formStyles, customFonts, customEasing } from '../../../common/styles';
import { shadowStyles } from '../../../common/styles/shadows';
import { availableActive, availableInactive, maintenanceActive, maintenanceInactive, notAvailableInactive, notAvailableActive } from '../../../common/components/Icons';
import { DBVehicleStatus } from '../../../common/lib/types';
interface IModeBarProps {
  vehicleStatus: string;
  modeChanged: (mode: string) => void;
  showSpinner: boolean;
  disabled: boolean;
}

export class ModeBar extends React.Component<IModeBarProps, any> {

  constructor(props: IModeBarProps) {
    super(props);
    this.state = {
      spinnerTransform: new Animated.Value(-customSizes.window.width + customSizes.space),
      spinnerOpacity: new Animated.Value(0),
    };
  }

  public componentDidUpdate() {
    this.animateSpinner();
  }

  public animateSpinner() {
    Animated.parallel([
      Animated.timing(this.state.spinnerOpacity, {
        toValue: 0.5,
        duration: 400,
        easing: customEasing.linear,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(this.state.spinnerTransform, {
            toValue: - customSizes.space,
            duration: 4000,
            easing: customEasing.linear,
          }),
          Animated.timing(this.state.spinnerTransform, {
            toValue: -customSizes.window.width + customSizes.space,
            duration: 4000,
            easing: customEasing.linear,
          }),
        ]),
      ),
    ]).start();
  }

  public render() {
    const selectedModeStyle = StyleSheet.flatten([
      styles.selectedStatus,
      shadowStyles.large,
    ]);
    const isAvailable = this.props.vehicleStatus === DBVehicleStatus.available;
    const isNotAvailable = this.props.vehicleStatus === DBVehicleStatus.notavailable;
    const isMaintenance = this.props.vehicleStatus === DBVehicleStatus.maintenance;
    return (
      <View style={styles.modeBar} >
        {
          this.props.showSpinner ?
          <View style={[styles.spinner]}>
            <Animated.Image
            style={[
              {transform: [{translateX: this.state.spinnerTransform}] },
              { opacity: this.state.spinnerOpacity },
            ]}
            source={require('../../../common/assets/illustrations/loader.png')}/>
          </View> : null
        }
        <View style={isAvailable ? selectedModeStyle : styles.status}>
          <TouchableWithoutFeedback
            disabled={this.props.disabled || isAvailable}
            onPress={() => this.props.modeChanged('available')}>
            <View style={styles.statusButtonContainer}>
              <View style={styles.imageContainer}>
                <Image source={ isAvailable ? availableActive : availableInactive } />
              </View>
              <Text style={[textStyles.metadata, isAvailable ? styles.selectedStatusText : styles.greyTextColor]}>
                Available
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={isNotAvailable ? selectedModeStyle : styles.status}>
          <TouchableWithoutFeedback
            disabled={this.props.disabled || isNotAvailable}
            onPress={() => this.props.modeChanged('notavailable')}>
            <View style={styles.statusButtonContainer}>
              <View style={styles.imageContainer}>
                <Image source={ isNotAvailable ? notAvailableActive : notAvailableInactive } />
              </View>
              <Text style={[textStyles.metadata, isNotAvailable ? styles.selectedStatusText : styles.greyTextColor]}>
                Not available
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={isMaintenance ? selectedModeStyle : styles.status}>
          <TouchableWithoutFeedback
            disabled={this.props.disabled || isMaintenance}
            onPress={() => this.props.modeChanged('maintenance')}>
            <View style={styles.statusButtonContainer}>
              <View style={styles.imageContainer}>
                <Image source={ isMaintenance ? maintenanceActive : maintenanceInactive } />
              </View>
              <Text style={[textStyles.metadata, isMaintenance ? styles.selectedStatusText : styles.greyTextColor]}>
                Maintenance
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modeBar: {
    borderWidth: 1,
    borderColor: customColors.white,
    borderRadius: 5,
    minHeight: customSizes.main,
    marginBottom: customSizes.space,
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  },
  status: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: customColors.grey1,
    padding: customSizes.space / 4 ,
  },
  selectedStatus: {
    flex: 1,
    padding: customSizes.space / 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: customColors.grey0,
    transform: [{scale: 1.05}],
    borderRadius: customSizes.space / 4,
    ...Platform.select({
      ios: {zIndex: 1},
      android: {elevation: 1},
    }),
},
  selectedStatusText: {
    color: customColors.davRed,
    fontWeight: 'bold',
  },
  statusButtonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    padding: customSizes.space / 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greyTextColor: {
    color: customColors.grey4,
  },
  spinner: {
    ...StyleSheet.absoluteFillObject,
    top: -customSizes.space / 2,
    ...Platform.select({
      ios: {zIndex: 2},
      android: {elevation: 9},
    }),
  },
});

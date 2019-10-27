import React from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import {
  customSizes,
  customColors,
  textStyles,
  customEasing,
} from '../../../common/styles';
import BatteryLevel from '../../../common/components/BatteryLevel';
import { VehicleStatusLabel } from '../VehicleStatusLabel';
import { shadowStyles } from '../../../common/styles/shadows';

interface IListItemProps {
  nameScooter: string;
  vehicleStatus: any;
  batteryLevel: number;
  profitDaily: number;
  showSpinner: boolean;
}

interface IState {
  spinnerTransform: Animated.Value;
  spinnerOpacity: Animated.Value;
}

export class ListItem extends React.Component<IListItemProps, IState> {

  constructor(props: IListItemProps) {
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
        toValue: 0.7,
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
    return (
      <View style={[shadowStyles.large, styles.listItemCard]}>
        <Text style={[styles.nameScooter, textStyles.calloutResponsive]}
              numberOfLines={1} ellipsizeMode='tail'>
          {this.props.nameScooter}
        </Text>
        <View style={{overflow: 'hidden', marginRight: customSizes.space / 2}}>
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
          <VehicleStatusLabel
            nameScooter={this.props.nameScooter}
            vehicleStatus={this.props.vehicleStatus}
          />
        </View>
        <View style={styles.batteryLevelLabel}>
          <BatteryLevel isDark={true} batteryLevel={this.props.batteryLevel} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listItemCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    width: customSizes.window.width - customSizes.space,
    backgroundColor: customColors.white,
    marginBottom: customSizes.space,
    marginHorizontal: customSizes.space / 2,
    borderRadius: 5,
    padding: customSizes.space,
    minHeight: customSizes.main,
  },
  nameScooter: {
    width: customSizes.window.width / 2 - customSizes.space * 4,
    color: customColors.black,
  },
  batteryLevelLabel: {
    minWidth: customSizes.main,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    borderRadius: 2,
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

import React from 'react';
import { Text, StyleSheet, View, Image } from 'react-native';
import BatteryLevel from '../../../common/components/BatteryLevel';
import { customSizes, customColors, textStyles } from '../../../common/styles';

interface IRideStatsProps {
  startTime?: Date;
  distance?: number;
  batteryLevel?: number;
  style?: any;
  endTime?: Date;
}

interface IRideStatsState {
  timePassed: string;
}

export default class RideStats extends React.Component<
  IRideStatsProps,
  IRideStatsState
> {
  public interval: number | undefined;

  constructor(props: IRideStatsProps) {
    super(props);
    this.state = {
      timePassed: this.calculateTimePassed(),
    };
    this.calculateTimePassed = this.calculateTimePassed.bind(this);
    if (!props.endTime) {
      this.interval = setInterval(
        () => this.setState({ timePassed: this.calculateTimePassed() }),
        1000,
      );
    }
  }

  public componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  public calculateTimePassed() {
    const endTime = this.props.endTime
      ? new Date(this.props.endTime)
      : new Date();
    let diff = endTime - this.props.startTime;
    let minutes = String(Math.floor(diff / 60000));
    minutes = minutes.length < 2 ? `0${minutes}` : minutes;
    diff = diff % 60000;
    let seconds = String(Math.floor(diff / 1000));
    seconds = seconds.length < 2 ? `0${seconds}` : seconds;
    return `${minutes}:${seconds}`;
  }

  public renderDistance(distance: number | undefined) {
    if (distance || distance === 0) {
      return (
        <View style={styles.box}>
          <View style={styles.flexRow}>
            <View style={styles.alignBaseline}>
              <Text
                style={[textStyles.metadata, { color: customColors.white }]}
              >
                {Number(distance).toFixed(2)}
              </Text>
              <Text style={[textStyles.metadata, { color: customColors.white, marginLeft: 5 }]}>km</Text>
            </View>
            <Image style={styles.icon} source={require('../../../common/assets/glyphs/glyph-ride-distance-medium.png')} />
          </View>
        </View>
      );
    }
  }

  public renderTime(timePassed: string | undefined) {
    if (timePassed) {
      return (
        <View style={styles.box}>
          <View style={styles.flexRow}>
            <Text style={[textStyles.metadata, { color: customColors.white }]}>
              {timePassed}
            </Text>
            <Image style={styles.icon} source={require('../../../common/assets/glyphs/glyph-ride-time-medium.png')} />
          </View>
        </View>
      );
    }
  }

  public renderBattery(batteryLevel: number | undefined) {
    if (batteryLevel || batteryLevel === 0) {
      return (
        <View style={styles.box}>
          <BatteryLevel batteryLevel={batteryLevel} />
        </View>
      );
    }
  }

  public render() {
    return (
      <View style={this.props.style}>
        {this.renderTime(this.state.timePassed)}
        {this.renderDistance(this.props.distance)}
        {this.renderBattery(this.props.batteryLevel)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  box: {
    minWidth: customSizes.main * 1.5,
    maxWidth: customSizes.main * 3,
    height: customSizes.space * 2,
    borderRadius: 5,
    backgroundColor: customColors.blackTransparent,
    marginBottom: customSizes.space / 2,
    padding: customSizes.space / 2,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  icon: {
    height: customSizes.space,
    width: customSizes.space,
  },
  alignBaseline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
});

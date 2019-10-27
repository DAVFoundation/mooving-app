import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { customColors, customSizes } from '../../styles';

interface IBatteryLevelProps {
  batteryLevel: number;
  style?: any;
  isDark?: boolean;
}

export default class BatteryLevel extends React.Component<IBatteryLevelProps> {
  constructor(props: IBatteryLevelProps) {
    super(props);
  }

  public render() {
    const { batteryLevel, style } = this.props;
    return (
      <View style={[style ? style : {}, styles.container]}>
        <Text
          style={[
            styles.chargePercentage,
            this.props.isDark ? styles.darkText : styles.lightText,
          ]}>
          {batteryLevel}%
        </Text>
        <View
          style={[
            styles.chargeIndicatorOuter,
            this.props.isDark ? styles.darkBorder : styles.lightBorder,
          ]}>
          <View
            style={[
              styles.chargeIndicatorInner,
              this.props.isDark ? styles.darkBackground : styles.lightBackground,
              { width: batteryLevel * .24 },
            ]}/>
          <View
            style={[
              styles.batteryTop,
              this.props.isDark ? styles.darkBorder : styles.lightBorder,
            ]}/>
        </View>
      </View>
    );
  }
}
const borderRadius = 4;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: 75,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  chargePercentage: {
    color: customColors.white,
    lineHeight: 15,
    marginRight: 5,
  },
  chargeIndicatorOuter: {
    borderRadius,
    borderWidth: 1,
    width: 30,
    height: 16,
    position: 'relative',
  },
  chargeIndicatorInner: {
    borderRadius: borderRadius / 2,
    borderWidth: 1,
    borderColor: 'transparent',
    margin: 2,
    width: 20,
    height: 10,
  },
  batteryTop: {
    borderTopRightRadius: borderRadius * 2,
    borderBottomRightRadius: borderRadius * 2,
    marginLeft: 3,
    width: 2,
    height: 6,
    borderWidth: 1,
    top: 4,
    right: -4,
    position: 'absolute',
  },
  darkText: {
    color: customColors.black,
  },
  lightText: {
    color: customColors.white,
  },
  darkBackground: {
    backgroundColor: customColors.black,
  },
  lightBackground: {
    backgroundColor: customColors.white,
  },
  darkBorder: {
    borderColor: customColors.blackTransparent,
  },
  lightBorder: {
    borderColor: customColors.whiteTransparent,
  },
});

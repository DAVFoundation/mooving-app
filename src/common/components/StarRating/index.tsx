import React from 'react';
import { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import { customSizes, textStyles, customColors } from '../../styles';
import { AnimatedValue } from 'react-navigation';

interface IRateProps {
  setRate?: (value: number) => void;
  rate: number;
  style?: any;
  iconSize: AnimatedValue;
  disabled?: boolean;
  fontSize?: number;
}

export function RateIcon(props: any) {
  const isActive = props.active;
  const iconImages: any = {
    active: require('../../assets/icons/icon-star_active.png'),
    inactive: require('../../assets/icons/icon-star_inactive.png'),
  };

  return (
    <Animated.View
      style={{
        height: props.iconSize,
        width: props.iconSize,
        marginRight: customSizes.space / 2,
      }}>
      <TouchableOpacity
        style={styles.starIcon}
        onPress={props.onPress}
        activeOpacity={0.75}
        disabled={props.disabled}
      >
        <Text
          style={[
            textStyles.buttonLightResponsive,
            styles.starNumber,
            { color: isActive ? customColors.white : customColors.black },
            props.fontSize ? {fontSize: props.fontSize} : null,
          ]}>
          {props.number}
        </Text>
        <Animated.Image
          style={{
            height: props.iconSize,
            width: props.iconSize,
          }}
          source={isActive ? iconImages.active : iconImages.inactive}
          resizeMode={'cover'}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default class StarRating extends Component<IRateProps> {
  public shouldComponentUpdate() {
    return true;
  }
  public setRank(rank: number) {
    if (!this.props.disabled) {
      return () => this.props.setRate ? this.props.setRate(rank) : 0;
    }
  }
  public render() {
    const rankOptions = [1, 2, 3, 4, 5];

    return (
      <View style={[styles.starRow, this.props.style]}>
        {rankOptions.map(rank => (
          <RateIcon
            key={String(rank)}
            number={rank}
            onPress={this.setRank(rank)}
            active={rank <= this.props.rate}
            iconSize={this.props.iconSize}
            disabled={this.props.disabled}
            fontSize={this.props.fontSize}
          />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  starRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  starContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  starIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    paddingBottom: 5,
  },
  starNumber: {
    zIndex: 2,
    position: 'absolute',
  },
});

import React, { Component } from 'react';
import {ImageBackground, View, Animated, StyleSheet, Easing, Platform} from 'react-native';
import * as uuid from 'uuid';
import map from '../../../../assets/images/map.png';
import marker from '../../../../assets/images/scooter.png';
import { mapMarkers } from './config';
import {customEasing, customSizes} from '../../../../../common/styles';
import { isIphoneX } from 'react-native-iphone-x-helper';

interface IAnimatedMapProps {
  isKeyboardVisible: boolean;
}

interface IAnimatedMapState {
  markersVisible: any;
  mapScale: Animated.Value;
  mapComponentVisibility: any;
}

class AnimatedMap extends Component<IAnimatedMapProps, IAnimatedMapState> {
  constructor(props: IAnimatedMapProps) {
    super(props);
    this.state = {
      mapScale: new Animated.Value(customSizes.window.width),
      // this value should be 0.01 because Android have a problem with value = 0
      markersVisible:  Object.assign(mapMarkers.map(() => new Animated.Value(0.01))),
      mapComponentVisibility:  new Animated.Value(1),
    };
  }

  public componentDidMount() {
    Object.values(this.state.markersVisible).forEach(
      (value: any, index: number) => {
        Animated.timing(
          value,
          {
            toValue: 1,
            duration: 500,
            delay: 400 + index * 120,
            easing: Easing.bezier(0.2, 0.7, 0.5, 1.3),
          },
        ).start();
    });
  }

  public componentDidUpdate(prevProps: IAnimatedMapProps) {
    if (!this.props.isKeyboardVisible && prevProps.isKeyboardVisible) {
      Animated.parallel([
        Animated.timing(
          this.state.mapComponentVisibility,
          {
            toValue: 1,
            duration: 500,
            easing: customEasing.EaseOut,
          },
        ),
        Animated.timing(
          this.state.mapScale,
          {
            toValue: customSizes.window.width,
            duration: 500,
          },
        ),
      ]).start();
    } else if (this.props.isKeyboardVisible && !prevProps.isKeyboardVisible) {
      Animated.parallel([
        Animated.timing(
          this.state.mapComponentVisibility,
          {
            // Because Android have problem with scale value 0, property opacity have added
            toValue: 0,
            duration: 500,
            easing: customEasing.EaseOut,
          },
        ),
        Animated.timing(
          this.state.mapScale,
          {
            toValue: 0,
            duration: 500,
            easing: customEasing.EaseOut,
          },
        ),
      ]).start();
    }
  }

  public render() {
    const { markersVisible } = this.state;
    const mapTopPosition = Animated.divide(
      Animated.subtract(customSizes.window.height, this.state.mapScale),
      2);
    return (
      <Animated.View style={[
        styles.mapWrapper,
        {
          opacity: this.state.mapComponentVisibility,
          transform: [{scale: this.state.mapComponentVisibility}],
          top: mapTopPosition,
        },
        ]}>
        <Animated.View style={[styles.animatedImageBackgroundWrapper, { height: this.state.mapScale, width: this.state.mapScale}]}>
          <ImageBackground source={map} style={styles.styledImageBackground} resizeMode='contain'>
            {mapMarkers.map((markerCoords, index) => (
              <Animated.Image
                source={marker}
                key={index}
                style={{
                  position: 'absolute',
                  left: markerCoords.x,
                  top: markerCoords.y,
                  transform: [{scale: markersVisible[index]}],
                }}
              />
            ))}
          </ImageBackground>
        </Animated.View>
      </Animated.View>
    );
  }
}

export default AnimatedMap;

const styles = StyleSheet.create({
  mapWrapper: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  styledImageBackground: {
    position: 'relative',
    flex: 1,
  },
  animatedImageBackgroundWrapper: {
    marginBottom: 10,
  },
});

import React from 'react';
import { Component } from 'react';
import { Animated, Easing } from 'react-native';

interface IAnimatedViewProps {
  style?: any;
  from: any;
  to: any;
  duration: number;
  delay?: number;
  children?: any;
  easing?: any;
  start?: boolean;
}

export default class AnimatedView extends Component<IAnimatedViewProps, any> {
  constructor(props: IAnimatedViewProps) {
    super(props);
    const state = { ...props.to };
    Object.keys(state).forEach(key => {
      const styleProp = props.from[key];
      state[key] = new Animated.Value(styleProp);
    });
    this.state = state;
  }

  public componentDidMount() {
    if (this.props.start) {
      this.startAnimation();
    }
  }

  public shouldComponentUpdate(nextProps: IAnimatedViewProps) {
    if (nextProps.start && !this.props.start) {
      this.startAnimation();
    }
    return true;
  }

  public startAnimation() {
    const animationProps = Object.keys(this.state).map(key => {
      const stylePropFrom = this.state[key];
      const stylePropTo = this.props.to[key];
      return Animated.timing(stylePropFrom, {
        duration: this.props.duration,
        toValue: stylePropTo,
        easing: this.props.easing,
        delay: this.props.delay || 0,
      });
    });
    Animated.parallel(animationProps).start();
  }

  public render() {
    return (
      <Animated.View style={[this.props.style, this.state]}>
        {this.props.children}
      </Animated.View>
    );
  }
}

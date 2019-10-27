import { Easing } from 'react-native';

export const fadeOut = {
  opacity: 0,
};

export const fadeIn = {
  opacity: 1,
};

export const customEasing = {
  // Based on https://gist.github.com/bendc/ac03faac0bf2aee25b49e5fd260a727d
  linear: Easing.bezier(.5, .5, .5, .5),
  EaseIn: Easing.bezier(0.895, 0.03, 0.685, 0.22),
  EaseOut: Easing.bezier(0.165, 0.84, 0.44, 1),
  EaseInOut: Easing.bezier(0.77, 0, 0.175, 1),
};

import { StyleSheet, Platform } from 'react-native';
import { customSizes, customColors } from '../../styles';
import { ifIphoneX } from 'react-native-iphone-x-helper';

export default StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width: customSizes.window.width,
    height: customSizes.window.height,
  },
  animateToUserLocationButton: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: customColors.white,
    left: customSizes.spaceFluidSmall,
    bottom: customSizes.spaceFluidBig,
  },
  buttonIcon: {
    resizeMode: 'contain',
    flex: 1,
    height: customSizes.iconButton / 2,
    width: customSizes.iconButton / 2,
  },
});

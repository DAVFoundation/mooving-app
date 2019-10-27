import { PixelRatio, Dimensions, StatusBar, Platform } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { height, width } = Dimensions.get('window');

// Detect the pixel density of device, used later for determining sizes
export const detectDeviceSize = () => {
  const pixelRatio = PixelRatio.get();

  switch (pixelRatio) {
    case 1:
      return 'x-small'; // mdpi Android devices
    case 1.5:
      return 'small'; // hdpi Android devices
    case 2:
      return 'medium'; // iPhone 4, 4S, iPhone 5, 5c, 5s, iPhone 6, 7, 8, xhdpi Android devices
    case 3:
      return 'large'; // iPhone 6 Plus, 7 Plus, 8 Plus, iPhone X, Pixel, Pixel 2, xxhdpi Android devices
    case 3.5:
      return 'x-large'; // Nexus 6, Pixel XL, Pixel 2 XL, xxxhdpi Android devices
    default:
      return 'medium';
  }
};

export const isSmallDevice = ['x-small', 'small', 'medium'].includes(detectDeviceSize());

// Calculating the 'magic number' a.k.a mainSize for styling elements in various screen sizes
export function calculateSizeScale() {
  const deviceSize = detectDeviceSize();

  switch (deviceSize) {
    case 'x-small':
      return 35;
    case 'small':
      return 40;
    case 'medium':
      return 55;
    case 'large':
      return 65;
    case 'x-large':
      return 70;
    default:
      return 60;
  }
}

export const mainSize = calculateSizeScale();

// Returning VW and VW measument units (like CSS) for styling elements in various screen sizes
export const viewportWidth = (number: number) => {
  return (width / 100) * number;
};

export const viewportHeight = (number: number) => {
  return (height / 100) * number;
};

// Calculating height of device and returning a dynamic number, used for styling responsive typography
export function responsiveFont(deviceHeightPercent: number) {
  const deviceHeight = isIphoneX()
    ? height - 78 // iPhone X style SafeAreaView size in portrait
    : Platform.OS === 'android'
    ? height - StatusBar.currentHeight!
    : height;
  const heightPercent = (deviceHeightPercent * deviceHeight) / 100;
  return Math.round(heightPercent);
}

// Capitalize first letter of string
export function capitalizeFirstLetter(string: string) {
  return typeof string === 'string' && string.charAt(0).toUpperCase() + string.slice(1);
}

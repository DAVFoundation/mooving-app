import { Dimensions } from 'react-native';
import { mainSize, viewportWidth } from '../lib/helpers';
import { ifIphoneX } from 'react-native-iphone-x-helper';

export const customColors = {
  white: '#FFFFFF',
  grey0: '#F6F6F6',
  grey1: '#EDEDED',
  grey2: '#DEDEDE',
  grey3: '#C3C3C3',
  grey4: '#A0A0A0',
  grey5: '#686868',
  grey6: '#3A3A3A',
  grey7: '#242424',
  black: '#040404',
  whiteTransparent: 'rgba(255, 255, 255, 0.35)',
  whiteTransparent1: 'rgba(255, 255, 255, 0.1)',
  whiteTransparent2: 'rgba(255, 255, 255, 0.05)',
  blackTransparent: 'rgba(0, 0, 0, 0.70)',
  blackTransparent1: 'rgba(0, 0, 0, 0.35)',
  blackTransparent2: 'rgba(0, 0, 0, 0.05)',
  blueTransparent: 'rgba(136, 198, 252, 0.30)',
  davRed: '#FF4163',
  davBlue: '#88C6FC',
  davOrange: '#FF8A58',
  davYellow: '#FFDF70',
  davGreen: '#71D88B',
  davRedSecondary: '#FF8A9C',
  davBlueSecondary: '#B1D8FA',
  davOrangeSecondary: '#FFAE84',
  davYellowSecondary: '#FEF2B4',
  davGreenSecondary: '#BCE3C6',
  ...ifIphoneX({
    davRed: '#FF3962',
  }, {
    davRed: '#FF4163',
  }),
};

export const customFonts = {
  gilroyRegular: 'Gilroy-Regular',
  gilroyBold: 'Gilroy-Bold',
  montserratRegular: 'Montserrat-Regular',
  montserratBold: 'Montserrat-Bold',
};

export const vehicleStatusColors: any = {
  onmission: customColors.davBlueSecondary,
  available: customColors.davGreenSecondary,
  maintenance: customColors.davYellowSecondary,
  notavailable: customColors.davRedSecondary,
};

const window = Dimensions.get('window');

export const customSizes = {
  window,
  main: mainSize,
  space: mainSize / 3,
  spaceFluidSmall: viewportWidth(5),
  spaceFluidBig: viewportWidth(10),
  headerHeight: (mainSize / 3) * 4,
  iconButton: mainSize / 1.5,
};

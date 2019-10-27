import { StyleSheet, Platform } from 'react-native';
import { customColors } from './variables';

export const shadowStyles = StyleSheet.create({
  large: {
    ...Platform.select({
      ios: {
        shadowColor: customColors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  medium: {
    ...Platform.select({
      ios: {
        shadowColor: customColors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  small: {
    ...Platform.select({
      ios: {
        shadowColor: customColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
});

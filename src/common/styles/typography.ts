import { StyleSheet, Platform } from 'react-native';
import { customSizes, customColors, customFonts } from './variables';
import { responsiveFont } from '../lib/helpers';

export const textStyles = StyleSheet.create({
  h1: {
    flexShrink: 1,
    fontFamily: customFonts.montserratBold,
    fontWeight: '800',
    fontSize: 48,
    lineHeight: 48,
  },
  h1Responsive: {
    flexShrink: 1,
    fontFamily: customFonts.montserratBold,
    fontWeight: '800',
    fontSize: responsiveFont(7),
    lineHeight: responsiveFont(7.),
  },
  h2: {
    flexShrink: 1,
    fontFamily: customFonts.montserratBold,
    fontWeight: '800',
    fontSize: 36,
    lineHeight: 38,
  },
  h2Responsive: {
    flexShrink: 1,
    fontFamily: customFonts.montserratBold,
    fontWeight: '800',
    fontSize: responsiveFont(6),
    lineHeight: responsiveFont(6),
  },
  h3: {
    flexShrink: 1,
    fontFamily: customFonts.montserratBold,
    fontWeight: '800',
    fontSize: 24,
    lineHeight: 26,
  },
  h3Responsive: {
    flexShrink: 1,
    fontFamily: customFonts.montserratBold,
    fontWeight: '800',
    fontSize: responsiveFont(5),
    lineHeight: responsiveFont(5),
  },
  h4: {
    flexShrink: 1,
    fontFamily: customFonts.montserratBold,
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 22,
  },
  h4Responsive: {
    flexShrink: 1,
    fontFamily: customFonts.montserratBold,
    fontWeight: '800',
    fontSize: responsiveFont(4),
    lineHeight: responsiveFont(4),
  },
  subtitle: {
    fontFamily: customFonts.montserratRegular,
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 20,
  },
  subtitleResponsive: {
    fontFamily: customFonts.montserratRegular,
    fontWeight: '400',
    fontSize: responsiveFont(3.5),
    lineHeight: responsiveFont(3.5),
  },
  callout: {
    fontFamily: customFonts.montserratRegular,
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 18,
  },
  calloutResponsive: {
    fontFamily: customFonts.montserratRegular,
    fontWeight: '400',
    fontSize: responsiveFont(2.5),
    lineHeight: responsiveFont(2.5),
  },
  paragraph: {
    fontFamily: customFonts.montserratRegular,
    fontWeight: '200',
    fontSize: 16,
    lineHeight: 20,
  },
  paragraphLink: {
    fontFamily: customFonts.montserratRegular,
    fontWeight: '200',
    fontSize: 16,
    lineHeight: 20,
    textDecorationLine: 'underline',
    color: customColors.davOrange,
  },
  description: {
    fontFamily: customFonts.montserratRegular,
    fontSize: 14,
    fontWeight: '400',
  },
  metadata: {
    fontFamily: customFonts.montserratRegular,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14,
  },
  button: {
    fontFamily: customFonts.montserratBold,
    fontWeight: '800',
    fontSize: 16,
  },
  mainButton: {
    fontFamily: customFonts.montserratBold,
    fontWeight: '800',
    fontSize: responsiveFont(2.6),
  },
  buttonResponsive: {
    fontFamily: customFonts.montserratBold,
    fontSize: responsiveFont(2.5),
    fontWeight: '800',
  },
  buttonLight: {
    fontFamily: customFonts.montserratRegular,
    fontWeight: '400',
    fontSize: 16,
  },
  buttonLightResponsive: {
    fontFamily: customFonts.montserratRegular,
    fontWeight: '400',
    fontSize: responsiveFont(2.5),
  },
  alignCenter: {
    textAlign: 'center',
  },
  alignLeft: {
    textAlign: 'left',
  },
  alignRight: {
    textAlign: 'right',
  },
});

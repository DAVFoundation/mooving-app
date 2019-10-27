import { StyleSheet } from 'react-native';
import { customSizes, customColors, textStyles } from '../../../common/styles';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, .7)',
    ...StyleSheet.absoluteFillObject,
  },
  topMenu: {
    position: 'absolute',
    backgroundColor: customColors.davRed,
    zIndex: -1,
  },
  topMenuFrom: {
    left: - customSizes.window.width * 2,
    top: - customSizes.window.width * 2,
  },
  topMenuTo: {
    left: - customSizes.window.width * 2,
    top: - customSizes.window.width * 1.5,
  },
  mainSection: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mainSectionContent: {
    height: customSizes.main * 3,
    padding: customSizes.space,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: {
    flexShrink: 0,
    marginTop: customSizes.space / 2,
    paddingRight: customSizes.space,
    color: customColors.white,
  },
  bottomMenu: {
    position: 'absolute',
    padding: customSizes.space,
    backgroundColor: customColors.white,
    zIndex: -1,
  },
  bottomMenuFrom: {
    right: - customSizes.window.width * 2,
    bottom: - customSizes.window.width * 2 - customSizes.main * 4,
  },
  bottomMenuTo: {
    right: - customSizes.window.width,
    bottom: - customSizes.window.width * 2 + customSizes.main * 1.5,
  },
  topCircle: {
    borderRadius: customSizes.window.width * 1.5,
    width: customSizes.window.width * 3,
    height: customSizes.window.width * 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCircle: {
    borderRadius: customSizes.window.width,
    width: customSizes.window.width * 2,
    height: customSizes.window.width * 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallCircle: {
    borderRadius: customSizes.main * .75,
    width: customSizes.main * 1.5,
    height: customSizes.main * 1.5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;

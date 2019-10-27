import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  View,
} from 'react-native';
import { customSizes, customColors } from '../../../common/styles';

export default class Header extends React.Component<any> {

  private translateX: any;
  private colorRight: any;
  private colorCenter: any;
  private colorLeft: any;
  private scaleLeft: any;
  private scaleCenter: any;
  private scaleRight: any;

  constructor(props: any) {
    super(props);
    this.navigateToMain = this.navigateToMain.bind(this);
    this.navigateToAccount = this.navigateToAccount.bind(this);
    this.navigateToVehicles = this.navigateToVehicles.bind(this);
    this.initAnimations();
  }

  public shouldComponentUpdate(nextProps: any) {
    return false;
  }

  public initAnimations() {
    const limit = (customSizes.window.width - customSizes.space) / 2;
    const translateXCalc = Animated.add(
      Animated.divide(
        Animated.add(
          this.props.offsetX,
          this.props.panX,
        ), 2), customSizes.window.width / 2);
    const translateX = translateXCalc.interpolate({
      inputRange: [-100, 100],
      outputRange: [-100 + customSizes.space, 100 - customSizes.space],
    });
    const colorLeft = translateXCalc.interpolate({
      inputRange: [-limit, 0, limit],
      outputRange: [customColors.grey2, customColors.grey2, customColors.davRed],
    });
    const colorCenter = translateXCalc.interpolate({
      inputRange: [-limit, 0, limit],
      outputRange: [customColors.grey2, customColors.davRed, customColors.grey2],
    });
    const colorRight = translateXCalc.interpolate({
      inputRange: [-limit, 0, limit],
      outputRange: [customColors.davRed, customColors.grey2, customColors.grey2],
    });
    const scaleLeft = translateXCalc.interpolate({
      inputRange: [-limit, 0, limit],
      outputRange: [1, 1, 1.5],
    });
    const scaleCenter = translateXCalc.interpolate({
      inputRange: [-limit, 0, limit],
      outputRange: [1, 1.5, 1],
    });
    const scaleRight = translateXCalc.interpolate({
      inputRange: [-limit, 0, limit],
      outputRange: [1.5, 1, 1],
    });
    this.translateX = translateX;
    this.colorLeft = colorLeft;
    this.colorCenter = colorCenter;
    this.colorRight = colorRight;
    this.scaleLeft = scaleLeft;
    this.scaleCenter = scaleCenter;
    this.scaleRight = scaleRight;
  }

  public navigateToAccount() {
    this.props.navigation.navigate('Account');
  }

  public navigateToMain() {
    this.props.navigation.navigate('Dashboard');
  }

  public navigateToVehicles() {
    this.props.navigation.navigate('Vehicles');
  }

  public render() {
    return (
      <SafeAreaView style={[styles.headerWrapper]}>
        <Animated.View
          style={[
            styles.headerContainer,
            {
              transform: [{ translateX: this.translateX }],
            },
          ]}>
          <TouchableOpacity
            onPress={this.navigateToAccount}
            activeOpacity={0.9}>
            <Animated.View
              style={[styles.sideIcon,
                      {
                  backgroundColor: this.colorLeft,
                  transform: [
                    { scale: this.scaleLeft },
                    { translateY: Animated.subtract(Animated.multiply(this.scaleLeft, 10), 10) },
                  ],
                },
                ]}>
              <Image
                style={styles.iconImage}
                source={require('../../assets/icons/icon-nav_user-medium.png')}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.navigateToMain}
            activeOpacity={0.9}>
            <Animated.View style={[
              styles.sideIcon,
              {
                backgroundColor: this.colorCenter,
                transform: [
                  { scale: this.scaleCenter },
                  { translateY: Animated.subtract(Animated.multiply(this.scaleCenter, 10), 10) },
                ],
              },
              ]}>
              <Image
                style={styles.logoImage}
                source={require('../../assets/logos/dav-logo_nocircle_grey0.png')}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.navigateToVehicles}
            activeOpacity={0.9}>
            <Animated.View style={[
              styles.sideIcon,
              {
                backgroundColor: this.colorRight,
                transform: [
                  { scale: this.scaleRight },
                  { translateY: Animated.subtract(Animated.multiply(this.scaleRight, 10), 10) },
                ],
              },
            ]}>
              <Image
                style={styles.iconImage}
                source={require('../../assets/icons/icon-nav_sooter-medium.png')}
              />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  headerWrapper: {
    width: customSizes.window.width,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    zIndex: 10,
    left: 0,
    top: 0,
    right: 0,
    position: 'relative',
    backgroundColor: customColors.grey0,
  },
  headerContainer: {
    paddingHorizontal: customSizes.space,
    paddingTop: customSizes.space / 2,
    marginBottom: customSizes.space / 2,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sideIcon: {
    backgroundColor: customColors.grey1,
    width: customSizes.space * 2,
    height: customSizes.space * 2,
    borderRadius: customSizes.space,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: customSizes.space * 1.75,
    height: customSizes.space * 1.75,
  },
  logoImage: {
    marginTop: 2,
    width: customSizes.space * 2,
    height: customSizes.space * 2,
  },
});

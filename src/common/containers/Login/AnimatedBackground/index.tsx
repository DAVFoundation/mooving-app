import React from 'react';
import { Component } from 'react';
import { View, StyleSheet, Text, Image, Animated, Easing, ImageBackground, Keyboard, Platform } from 'react-native';
import { textStyles, customSizes, customColors } from '../../../styles';
import { translate } from 'react-i18next';

interface IProps {
  t(key: string, options?: any): string;
}

interface IState {
  animateImagePosition: Animated.Value;
  willRotation: Animated.Value;
  davLogoMargin: Animated.Value;
  isKeyboardUp: boolean;
}

const isLargeScreen = customSizes.window.height > 600;

@translate('translations')
export default class AnimatedBackground extends Component<IProps, IState> {

  private streetUri = require('../../../../common/assets/images/streetStrip.png');
  private imageWidth: number = 0;
  private keyboardDidShowListener: any;
  private keyboardDidHideListener: any;

  constructor(props: IProps) {
    super(props);
    const { width, height } = Image.resolveAssetSource(this.streetUri);
    this.imageWidth = (customSizes.window.height / 3) * (width / height);
    const imagePosition = this.imageWidth - customSizes.window.width;
    this.state = {
      animateImagePosition: new Animated.Value(-imagePosition),
      willRotation: new Animated.Value(1),
      isKeyboardUp: false,
      davLogoMargin: new Animated.Value(isLargeScreen ? -customSizes.space : -customSizes.main / 2),
    };
  }

  public componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  public componentDidMount() {
    Animated.parallel([
      Animated.timing(this.state.animateImagePosition, {
        toValue: 0,
        useNativeDriver: true,
        duration: 10000,
        easing: Easing.bezier(.5, .60, .60, .90),
      }),
      Animated.timing(
        this.state.willRotation, {
        toValue: 0,
        duration: 10000,
        easing: Easing.bezier(.5, .60, .60, .90),
      }),
    ]).start();
    this.keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'android' ?
      'keyboardDidShow' :
      'keyboardWillShow',
      this.keyboardShow.bind(this),
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'android' ?
      'keyboardDidHide' :
      'keyboardWillHide',
      this.keyboardHide.bind(this),
    );
  }

  public keyboardShow() {
    this.setState({ isKeyboardUp: true });
    Animated.timing(this.state.davLogoMargin, {
      toValue: isLargeScreen ? 0 : -customSizes.space,
      duration: 400,
      easing: Easing.bezier(.5, .60, .60, .90),
    }).start();
  }

  public keyboardHide() {
    this.setState({ isKeyboardUp: false });
    Animated.timing(this.state.davLogoMargin, {
      toValue: isLargeScreen ? -customSizes.space : -customSizes.main / 2,
      duration: 400,
      easing: Easing.bezier(.5, .60, .60, .90),
    }).start();
  }

  public render() {
    const { t } = this.props;
    const spin = this.state.willRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '3600deg'],
    });
    return (
      <View style={[styles.animatedBackground]}>
        <Image
          resizeMode='contain'
          style={{ height: customSizes.window.height / 6 }}
          source={require('../../../../common/assets/images/streetStripSky.png')} />
        <Animated.View style={[
                styles.davLogoContainer,
                {
                  marginTop: this.state.davLogoMargin,
                },
          ]}>
          <Image
            resizeMode='contain'
            style={{ height: customSizes.window.height / 6 }}
            source={require('../../../../common/assets/images/davLogoBig.png')} />
        </Animated.View>
        <Text style={[
          textStyles.h3,
          {
            textAlign: 'center',
            color: customColors.white,
            marginBottom: customSizes.spaceFluidSmall,
            display: this.state.isKeyboardUp ? 'none' : 'flex',
          },
        ]}>
          {t('signup.phone.title')}
        </Text>
        <View style={{ position: 'relative', display: this.state.isKeyboardUp ? 'none' : 'flex' }}>
          <Animated.View style={{ transform: [{ translateX: this.state.animateImagePosition }] }}>
            <Image
              style={{
                width: this.imageWidth,
                height: customSizes.window.height / 3,
              }}
              source={this.streetUri} />
          </Animated.View>
          <View style={styles.scooterImageContainer}>
            <View style={{ position: 'relative' }}>
              <ImageBackground
                resizeMode='contain'
                style={{
                  height: customSizes.window.height / 4,
                  width: customSizes.window.height / 4,
                  zIndex: 1,
                }}
                source={require('../../../../common/assets/images/scooter3d.png')}>
                <Animated.View style={{
                  transform: [{ rotate: spin }],
                  position: 'absolute',
                  right: -2,
                  bottom: - customSizes.window.height / 55,
                  zIndex: -1,
                }}>
                  <Image
                    style={{
                      height: customSizes.window.height / 20, width: customSizes.window.height / 20,
                    }}
                   source={require('../../../../common/assets/images/wheel.png')} />
                </Animated.View>
                <Animated.View style={
                  {
                    transform: [{ rotateZ: spin }],
                    position: 'absolute',
                    left: - customSizes.window.height / 160,
                    bottom: - customSizes.window.height / 55,
                  }}>
                  <Image
                  style={{
                    height: customSizes.window.height / 20, width: customSizes.window.height / 20,
                  }}
                  source={require('../../../../common/assets/images/wheel.png')} />
                </Animated.View>
              </ImageBackground>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    backgroundColor: customColors.davRed,
    paddingTop: customSizes.space,
  },
  davLogoContainer: {
    marginBottom: customSizes.spaceFluidSmall,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scooterImageContainer: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: customSizes.main / 2,
  },
});

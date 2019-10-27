import React from 'react';
import {
  Image,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import Video from 'react-native-video';
import { customColors, customSizes } from '../../../common/styles/variables';
import { textStyles } from '../../../common/styles/typography';
import {
  NavigationScreenProp,
  StackActions,
  NavigationActions,
} from 'react-navigation';

import { ISlide, Slide, IProgressEvent } from './types';
import { translate } from 'react-i18next';
import firebase from 'react-native-firebase';

interface IOnBoardingScreensProps {
  navigation: NavigationScreenProp<any, any>;
  t?(key: string, options?: any): string;
}

interface IOnBoardingState {
  paused: boolean;
  activeSlide: number;
}

const SLIDE_TIMEOUT = 3000;

@translate('translations')
export default class OnBoardingScreens extends React.Component<
IOnBoardingScreensProps, IOnBoardingState> {

  private videoAsset;
  private imageAsset;
  private video: Video;
  private slider: AppIntroSlider;
  private timeout: any;
  private useTimeout: boolean;
  private slides: Slide[] = [
    {
      key: 'slide1',
      index: 0,
      titleStyle: firstSlideH2Style,
      startTime: 0,
      endTime: 2.65,
    },
    {
      key: 'slide2',
      index: 1,
      titleStyle: h2Style,
      startTime: 3,
      endTime: 3.65,
    },
    {
      key: 'slide3',
      index: 2,
      titleStyle: h2Style,
      startTime: 4.04,
      endTime: 5.72,
    },
    {
      key: 'slide4',
      index: 3,
      titleStyle: h2Style,
      startTime: 6.25,
      endTime: 11.5,
    },
    {
      key: 'slide5',
      index: 4,
      titleStyle: h2Style,
      startTime: 12.4,
      // should pause in this time, because if we want to repeat, we can't let the video end
      endTime: 14.5,
    },
    {
      key: 'last',
      index: 5,
    },
  ];

  constructor(props: IOnBoardingScreensProps) {
    super(props);
    this.videoAsset = require('../../assets/videos/onBoarding.mp4');
    this.imageAsset = require('../../assets/images/onBoardingSky.png');
    this.useTimeout = true;
    this.state = { paused: false, activeSlide: 0 };
    this.timeout = null;
    this.onSlideChange = this.onSlideChange.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onSeek = this.onSeek.bind(this);
    this.goToSlide = this.goToSlide.bind(this);
    this.startSlide = this.startSlide.bind(this);
    this.fireSawOnboardingEvent();
  }

  private fireSawOnboardingEvent() {
    firebase.analytics().logEvent('saw_onboarding_flow');
  }

  private renderItem(props: ISlide) {
    const { t } = this.props;
    if (props.key === 'last') {
      return (
        <View style={lastSlideStyle} />);
    } else {
      return (
        <View style={style.containerSlide}>
          <Text style={[props.titleStyle, { marginBottom: customSizes.space, paddingTop: customSizes.space }]}>{t(`onboarding.${ props.key }.title`)}</Text>
          <Text style={subtitleStyle}>{t(`onboarding.${ props.key }.subtitle`)}</Text>
        </View>
      );
    }
  }

  private onSlideChange(index: number, lastIndex: number) {
    this.useTimeout = false;
    if (!!this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (index < this.slides.length - 1) {
      const nextSlide: ISlide = this.slides[index] as ISlide;
      const shouldSeek = !this.state.paused || index !== lastIndex + 1;
      this.startSlide(nextSlide, shouldSeek);
    } else {
      this.dropStackNavigationAndNavigate();
    }
  }

  private onProgress(event: IProgressEvent) {
    const currentSlide: ISlide = this.slides[this.state.activeSlide] as ISlide;
    if (currentSlide.key === 'slide4' && event.currentTime >= currentSlide.endTime) {
      if (this.useTimeout) {
        this.slider.goToSlide(this.state.activeSlide + 1);
        this.setState({ activeSlide: this.state.activeSlide + 1 });
      } else {
        this.setState({ paused: true });
      }
    } else if (currentSlide.index < this.slides.length - 2 && event.currentTime >= currentSlide.endTime) {
      if (this.useTimeout) {
        this.timeout = setTimeout(() => this.goToSlide(this.state.activeSlide + 1), SLIDE_TIMEOUT);
      }
      this.setState({ paused: true });
    } else if (currentSlide.index === this.slides.length - 2 && event.currentTime >= currentSlide.endTime) {
      if (this.useTimeout && !this.timeout) {
        this.timeout = setTimeout(() => {
          this.dropStackNavigationAndNavigate();
        }, SLIDE_TIMEOUT);
      }
      this.setState({ paused: true });
    }
  }

  private onSeek() {
    this.setState({ paused: false });
  }

  private goToSlide(index: number) {
    if (!!this.timeout) {
      this.slider.goToSlide(index);
      const nextSlide: ISlide = this.slides[index] as ISlide;
      this.startSlide(nextSlide, false);
    }
  }

  private startSlide(slide: ISlide, shouldSeek: boolean) {
    if (shouldSeek) {
      this.video.seek(slide.startTime);
    }
    // after video finishes, seek and disable paused prop is not enough for replaying the video,
    // you have to set repeat prop to true
    this.setState({ paused: false, activeSlide: slide.index });
    this.timeout = null;
  }

  public dropStackNavigationAndNavigate = () => {
    const routeName = this.props.navigation.getParam('initialRouteName') || 'Login';
    firebase.analytics().logEvent('completed_onboarding_flow');
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  public render() {
    return (
      <View style={style.containerOnboarding}>
        <Image
          resizeMode='contain'
          style={{ height: customSizes.window.height / 6 }}
          source={this.imageAsset} />
        <AppIntroSlider slides={this.slides} renderItem={this.renderItem} onSlideChange={this.onSlideChange}
          dotStyle={{ ...{ backgroundColor: customColors.white }, transform: [{ scale: 0.9 }] }}
          activeDotStyle={{ ...{ backgroundColor: customColors.white, transform: [{ scale: 1.5 }] } }}
          showNextButton={false} showDoneButton={false} ref={(ref: AppIntroSlider) => this.slider = ref}>
        </AppIntroSlider>
        <View style={style.containerVideo}>
          <Video source={this.videoAsset} ref={ref => {
            if (!!ref) {
              this.video = ref;
            }
          }} style={style.video} paused={this.state.paused} resizeMode={'stretch'} onSeek={this.onSeek}
            progressUpdateInterval={40} onProgress={this.onProgress} />
        </View>
        <View style={style.containerBottomBackground} />
      </View>
    );
  }
}

const style = StyleSheet.create({
  containerOnboarding: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: customColors.davRed,
    zIndex: 0,
  },
  skipButton: {
    paddingLeft: customSizes.main / 2,
  },
  containerBottomBackground: {
    backgroundColor: customColors.black,
    width: customSizes.window.width * 2,
    height: customSizes.window.width * 2,
    borderRadius: customSizes.window.width,
    position: 'absolute',
    left: customSizes.window.width * -0.5,
    top: customSizes.window.height - customSizes.main * 2,
    zIndex: -1,
  },
  containerSlide: {
    height: (customSizes.window.height) * (5 / 6) - (customSizes.main * 2),
    width: customSizes.window.width,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  containerVideo: {
    position: 'absolute',
    top: customSizes.window.height / 3 + customSizes.main,
    height: customSizes.window.height * (2 / 5),
    flex: 1,
    width: customSizes.window.width,
    alignItems: 'center',
    zIndex: -3,
  },
  generalText: {
    color: customColors.white,
    textAlign: 'center',
    paddingLeft: customSizes.space / 2,
    paddingRight: customSizes.space / 2,
  },
  video: {
    width: customSizes.window.width - customSizes.main,
    height: customSizes.window.width - customSizes.main * 2,
  },
});

const firstSlideH2Style = StyleSheet.flatten([
  style.generalText,
  textStyles.h2,
  { paddingLeft: customSizes.space / 8, paddingRight: customSizes.space / 8 },
]);

const h2Style = StyleSheet.flatten([textStyles.h2, style.generalText]);

const subtitleStyle = StyleSheet.flatten([textStyles.subtitle, style.generalText, { lineHeight: 24 }]);

const lastSlideStyle = StyleSheet.flatten([style.containerSlide, { backgroundColor: customColors.davRed, zIndex: -2 }]);

import React, { createRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
  Platform,
  findNodeHandle,
} from 'react-native';
import { inject, observer } from 'mobx-react/native';
import {
  NavigationScreenProp,
  StackActions,
  NavigationActions,
  AnimatedValue,
} from 'react-navigation';
import { RideStore } from '../../stores/RideStore';
import { translate } from 'react-i18next';
import { STORE_RIDE, STORE_APP, STORE_ACCOUNT } from '../../constants';
import StarRating from '../../../common/components/StarRating';
import {
  textStyles,
  customColors,
  customSizes,
  customEasing,
} from '../../../common/styles';
import FeedbackTag from '../../../common/components/FeedbackTag';
import ThankYouModal from '../../components/ThankYouModal';
import FeedbackText from '../../components/FeedbackText';
import { ifIphoneX, getStatusBarHeight, isIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';

const statusBarHeight = getStatusBarHeight();
import firebase from 'react-native-firebase';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { calculateSizeScale } from '../../../common/lib/helpers';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { AppStore } from '../../../common/stores/AppStore';
import { AccountStore } from '../../stores/AccountStore';
import { RIDE_STATE } from '../../constants/ride';

const THANKYOU_TIME = 3200;
const ICON_HEIGHT = customSizes.space * 2.5;
const ICON_HEIGHT_SMALL = customSizes.space * 1.5;
const HEADER_MARGIN_TOP = ifIphoneX ? statusBarHeight : 0;
const HEADER_MARGIN_INITIAL = 0;
const OTHER_TAG_NAME = 'Other';

const topbarHeight = getStatusBarHeight();
const bottomSpace = getBottomSpace();
const heightPage = customSizes.window.height - topbarHeight;
const heightContentBox = 180;
const offsetContentBox = 2 * (heightPage - heightContentBox) / 3 - customSizes.space;

const offsetFeedbackModal = () => {
  const offset = heightPage - offsetContentBox + topbarHeight;
  if (isIphoneX()) {
    return offset + bottomSpace - customSizes.spaceFluidSmall;
  } else {
    return offset;
  }
};
interface IFeedbackProps {
  [STORE_RIDE]: RideStore;
  [STORE_APP]: AppStore;
  [STORE_ACCOUNT]: AccountStore;
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

interface IFeedbackState {
  isToggleActive: boolean;
  feedbackText: string;
  rate: number;
  yTranslate: AnimatedValue;
  iconHeight: AnimatedValue;
  headerMarginTop: AnimatedValue;
  selectedTags: string[];
  showThankYou: boolean;
}

@translate('translations')
@inject(STORE_RIDE, STORE_APP, STORE_ACCOUNT)
@observer([STORE_RIDE, STORE_APP])
export default class RideFeedback extends React.Component<
  IFeedbackProps,
  IFeedbackState
> {
  private scrollView: any;
  private timeoutCanceled: boolean;
  public keyboardWillShowSub: any;
  public keyboardWillHideSub: any;
  public modalOffset: number;
  public analyticsTags: string[] = [];

  constructor(props: IFeedbackProps) {
    super(props);
    this.timeoutCanceled = false;
    this.state = {
      isToggleActive: false,
      feedbackText: '',
      selectedTags: [],
      rate: 0,
      showThankYou: false,
      yTranslate: new Animated.Value(0),
      iconHeight: new Animated.Value(ICON_HEIGHT),
      headerMarginTop: new Animated.Value(HEADER_MARGIN_INITIAL),
    };
    this.sendFeedback = this.sendFeedback.bind(this);
    this.showThankYou = this.showThankYou.bind(this);
    this.addRemoveTag = this.addRemoveTag.bind(this);
    this.toggleFeedbackModal = this.toggleFeedbackModal.bind(this);
    this.changeFeedbackText = this.changeFeedbackText.bind(this);
    this.toggleFeedbackField = this.toggleFeedbackField.bind(this);
    this.modalOffset = -offsetFeedbackModal();
  }

  private dropStackNavigationAndNavigateToMain() {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Main' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  public componentWillMount() {
    this.keyboardWillShowSub = Keyboard.addListener(
      'keyboardWillShow',
      this.keyboardWillShow,
    );
    this.keyboardWillHideSub = Keyboard.addListener(
      'keyboardWillHide',
      this.keyboardWillHide,
    );
    this.state.yTranslate.setValue(-1);
    Animated.timing(this.state.yTranslate, {
      toValue: 0,
      duration: customSizes.window.height,
      delay: customSizes.window.height,
      easing: customEasing.EaseInOut,
    }).start();
  }

  public componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  public keyboardWillShow = (event: any) => {
    Animated.timing(this.state.iconHeight, {
      duration: event.duration,
      toValue: ICON_HEIGHT_SMALL,
    }).start();
  }

  public keyboardWillHide = (event: any) => {
    Animated.timing(this.state.iconHeight, {
      duration: event.duration,
      toValue: ICON_HEIGHT,
    }).start();
  }

  public rate(rating: number) {
    const feedbackHasChanged = this.state.rate;

    if (feedbackHasChanged) {
      firebase.analytics().logEvent('ride_rating_changed', {
        rating,
      });
    } else {
      firebase.analytics().logEvent('ride_rating', {
        rating,
      });
    }
    if (rating !== 5) {
      this.toggleFeedbackModal();
    }
    this.setState(
      {
        rate: rating,
      },
      () => {
        if (rating === 5) {
          this.sendFeedback();
        }
      },
    );
  }

  public toggleFeedbackModal() {
    if (!this.state.rate) {
      this.state.yTranslate.setValue(0);
      Animated.timing(this.state.yTranslate, {
        toValue: 1,
        duration: Math.abs(this.modalOffset),
        easing: customEasing.EaseInOut,
      }).start();
      Animated.timing(this.state.headerMarginTop, {
        duration: Math.abs(this.modalOffset) / 2,
        toValue: HEADER_MARGIN_TOP,
      }).start();
    }
  }

  public addRemoveTag(tagName: string) {
    this.setState(({ selectedTags }) => {
      const tagIndex = selectedTags.indexOf(tagName);
      if (tagIndex > -1) {
        selectedTags.splice(tagIndex, 1);
      } else {
        selectedTags.push(tagName);
      }
      return { selectedTags };
    });
    if (!this.analyticsTags.includes(tagName)) {
      this.analyticsTags.push(tagName);
      firebase.analytics().logEvent('feedback_tag_selected', {
        feedbackTag: tagName,
      });
    }
  }

  public dismissThankYou = () => {
    this.timeoutCanceled = true;
    this.props[STORE_RIDE].setRideState(RIDE_STATE.NONE);
    this.dropStackNavigationAndNavigateToMain();
    const davAwarded = this.props[STORE_RIDE].davAwarded;
    if (davAwarded) {
      setTimeout(() => this.props[STORE_ACCOUNT].addDavTokens(davAwarded));
    }
  }

  public sendFeedback() {
    const { rate, clearStoreData } = this.props[STORE_RIDE];
    const selectedTags = this.state.selectedTags;
    if (this.state.isToggleActive) {
      selectedTags.push(this.state.feedbackText);
    }
    rate(this.state.rate, selectedTags);
    clearStoreData();
    this.showThankYou();
    firebase.analytics().logEvent('continue_button_clicked');
  }

  public showThankYou() {
    Keyboard.dismiss();
    this.setState({ showThankYou: true }, () =>
      setTimeout(() => {
        if (!this.timeoutCanceled) {
          this.dismissThankYou();
        }
      }, THANKYOU_TIME));
  }

  public toggleFeedbackField() {
    if (!this.analyticsTags.includes(OTHER_TAG_NAME)) {
      this.analyticsTags.push(OTHER_TAG_NAME);
      firebase.analytics().logEvent('feedback_tag_selected', {
        feedbackTag: OTHER_TAG_NAME,
      });
    }
    this.setState({
      isToggleActive: !this.state.isToggleActive,
    });
  }

  public changeFeedbackText = (feedbackText: string, event: any) => {
    this.setState({ feedbackText });
  }

  public detectSmallDevice() {
    const deviceScale = calculateSizeScale();

    if (deviceScale < 2) {
      return true;
    } else {
      return false;
    }
  }

  public _scrollToInput(reactNode: any) {
    // Add a 'scroll' ref to your ScrollView
    this.scrollView.props.scrollToFocusedInput(reactNode);
  }

  public render() {
    const tags = this.props[STORE_APP].feedbackTags;
    const { t } = this.props;
    const { isToggleActive } = this.state;
    const { rate } = this.state;
    const isFeedbackModalOpen = !this.state.rate;
    const isIos = Platform.OS === 'ios';

    const modalMoveY = this.state.yTranslate.interpolate({
      inputRange: [0, 1],
      outputRange: [0, this.modalOffset],
    });

    const translateStyle = { transform: [{ translateY: modalMoveY }] };

    return (
      <>
        <ThankYouModal
          t={t}
          isVisible={!!this.state.showThankYou}
          rate={this.state.rate}
          dismiss={this.dismissThankYou}
          style={{ zIndex: 3 }}
        />
        <View
          style={{
            flex: 1,
            marginTop: ifIphoneX ? -customSizes.spaceFluidSmall : 0,
          }}
        >
          <Animated.View
            style={[
              styles.container,
              translateStyle,
              { bottom: this.modalOffset },
            ]}
          >
            <Animated.View
              style={[
                styles.ratingContainer,
                isFeedbackModalOpen ? null : styles.borderBottom,

                { marginTop: this.state.headerMarginTop },
              ]}
            >
              <Text
                style={[
                  textStyles.h4Responsive,
                  textStyles.alignLeft,
                  styles.ratingTitle,
                ]}
              >
                {t('rideSummary.rate')}
              </Text>
              <StarRating
                rate={this.state.rate}
                setRate={this.rate.bind(this)}
                iconSize={this.state.iconHeight}
                disabled={false}
              />
            </Animated.View>

            {rate ? (
              <>
                <KeyboardAwareScrollView
                  innerRef={ref => {
                    this.scrollView = ref;
                  }}
                  extraHeight={60}
                  keyboardOpeningTime={0}
                  extraScrollHeight={isIos ? customSizes.main * 3 : customSizes.main * 2}
                  enableOnAndroid={true}
                  resetScrollToCoords={{ x: 0, y: 0 }}
                  style={styles.feedbackContainer}
                  enableAutomaticScroll={true}
                >
                  <Text style={[textStyles.subtitleResponsive, textStyles.alignLeft, styles.ratingSubtitle]}>
                    {t('rideSummary.subtitle')}
                  </Text>
                  <View style={styles.feedbackTagContainer}>
                    {tags.map(name => (
                      <FeedbackTag
                        onPress={() => this.addRemoveTag(name)}
                        isActive={this.state.selectedTags.includes(name)}
                        text={name}
                        key={name}
                      />
                    ))}
                    <FeedbackTag
                      onPress={this.toggleFeedbackField}
                      isActive={this.state.isToggleActive}
                      text={OTHER_TAG_NAME}
                    />
                  </View>
                  <View>
                    {isToggleActive && (
                      <FeedbackText
                        placeholder={t('rideSummary.feedbackText.placeholder')}
                        label={t('rideSummary.feedbackText.label')}
                        value={this.state.feedbackText}
                        onChangeText={this.changeFeedbackText}
                        onFocus={(event: any) => {
                          // `bind` the function if you're using ES6 classes
                          this._scrollToInput(findNodeHandle(event.target));
                        }}
                      />
                    )}
                  </View>
                </KeyboardAwareScrollView>
                <KeyboardAvoidingView
                  behavior={'padding'}
                  keyboardVerticalOffset={
                    isIos ? customSizes.spaceFluidSmall : 0
                  }
                  style={styles.bottomButton}
                >
                  <View style={{ minHeight: customSizes.main }}>
                  <Button onPress={this.sendFeedback}
                    style={[buttonsStyle.secondary, {
                      position: 'absolute',
                      right: 0,
                      bottom: isIphoneX() ? customSizes.main / 2 : 0,
                    }]}
                    textStyle={[textStyles.button, {color: customColors.black}]}
                    text='Continue'/>
                  </View>
                </KeyboardAvoidingView>
              </>
            ) : null}
          </Animated.View>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flex: 1,
    height: customSizes.window.height,
    width: customSizes.window.width,
    backgroundColor: customColors.white,
    zIndex: 2,
  },
  ratingContainer: {
    paddingHorizontal: customSizes.spaceFluidSmall,
    paddingVertical: customSizes.spaceFluidSmall,
  },
  borderBottom: {
    backgroundColor: customColors.white,
    borderBottomColor: customColors.grey2,
    borderBottomWidth: 1,
  },
  ratingTitle: {
    marginTop: customSizes.spaceFluidSmall,
    paddingBottom: customSizes.space / 2,
    color: customColors.black,
  },
  ratingSubtitle: {
    marginBottom: customSizes.spaceFluidSmall,
    color: customColors.black,
  },
  feedbackContainer: {
    backgroundColor: customColors.white,
    padding: customSizes.spaceFluidSmall,
    zIndex: -1,
  },
  feedbackTagContainer: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginHorizontal: -2,
    marginBottom: customSizes.space / 2,
  },
  feedbackTag: {
    margin: customSizes.space / 8,
    padding: customSizes.space / 4,
    borderRadius: 5,
    backgroundColor: customColors.white,
    borderColor: customColors.grey1,
    borderWidth: 1,
  },
  feedbackTagActive: {
    backgroundColor: customColors.black,
    borderColor: customColors.black,
  },
  feedbackTagInActive: {
    backgroundColor: customColors.white,
    borderColor: customColors.grey1,
  },
  bottomButton: {
    marginHorizontal: customSizes.spaceFluidSmall,
    marginBottom: customSizes.spaceFluidSmall,
    minWidth: customSizes.main * 2,
    minHeight: customSizes.main,
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
  },
});

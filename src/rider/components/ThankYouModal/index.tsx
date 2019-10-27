import React from 'react';
import { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { customColors, textStyles, customSizes, customFonts } from '../../../common/styles';
import { translate } from 'react-i18next';

interface IThankYouPageProps {
  isVisible: boolean;
  rate: number;
  style?: any;
  dismiss: () => void;
  t(key: string, options?: any): string;
}

@translate('translations')
export default class ThankYouModal extends Component<IThankYouPageProps> {
  public render() {
    const { t } = this.props;
    const isFeedback5 = () => {
      if (this.props.rate === 5) {
        return true;
      } else {
        return false;
      }
    };
    return this.props.isVisible ? (
      <TouchableWithoutFeedback style={this.props.style} onPress={this.props.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Image
              style={styles.iconThankYou}
              overflow={'visible'}
              ImageResizeMode={'cover'}
              source={require('../../../common/assets/glyphs/glyph-thankyou.png')}
            />
            <Text style={[textStyles.h2,
                          {
                            color: customColors.black,
                            marginBottom: customSizes.space / 2,
                          },
              ]}>{t('ThankYouModal.title')}</Text>
            <Text style={[textStyles.alignCenter,
                          {
                            color: customColors.black,
                            fontFamily: customFonts.montserratRegular,
                            fontWeight: '400',
                            fontSize: 18,
                            lineHeight: 24,
                          },
              ]}>
              {isFeedback5()
                ? t('ThankYouModal.subtitle.perfectRating')
                : t('ThankYouModal.subtitle.lowerRating')}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    ) : null;
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
    opacity: 1,
    zIndex: 95,
    backgroundColor: customColors.white,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: customSizes.spaceFluidBig,
  },
  iconThankYou: {
    width: customSizes.main,
    height: customSizes.main,
    marginBottom: customSizes.space,
  },
});

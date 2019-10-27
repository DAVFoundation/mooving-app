import React, { Component } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { translate } from 'react-i18next';
import { customSizes, customColors, customFonts, textStyles } from '../../../common/styles';
import { Image, Text } from 'react-native-animatable';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { davSymbol } from '../../../common/components/Icons';
import firebase from 'react-native-firebase';

interface IDavTokenProps {
  tokenBalance: number;
  userGotDavReward: boolean;
  t(key: string, options?: any): string;
}

interface IDavTokenState {
  tokenBalance: number;
  isModalOpen: boolean;
  tokenTranslateX: Animated.Value[];
  tokenTranslateY: Animated.Value[];
  tokenScale: Animated.Value[];
}

const MAX_COIN_IN_THE_AIR = 4;
const coinXPositionOffset = -customSizes.window.width / 2 + customSizes.space * 2;
const coinYPositionOffset = customSizes.window.height / 2 - customSizes.space * 2;

@translate('translations')
export default class DavToken extends Component<IDavTokenProps, IDavTokenState> {

  private davTokenImage = require('../../assets/images/davCoin.png');

  constructor(props: IDavTokenProps) {
    super(props);
    this.state = {
      tokenBalance: props.tokenBalance,
      isModalOpen: false,
      tokenTranslateX: [],
      tokenTranslateY: [],
      tokenScale: [],
    };
  }

  private round(tokenBalance: number) {
    return Math.floor(tokenBalance);
  }

  public shouldComponentUpdate(nextProps: IDavTokenProps) {
    const lastTokenBalance = this.props.tokenBalance;
    const userGotDavReward = this.props.userGotDavReward;
    if (((!lastTokenBalance && lastTokenBalance !== 0) && userGotDavReward)
    && !!nextProps.tokenBalance) {
      this.setState({tokenBalance: nextProps.tokenBalance});
      return true;
    }
    if (this.round(nextProps.tokenBalance) > this.round(this.props.tokenBalance)) {
      this.addCoins(nextProps.tokenBalance - this.props.tokenBalance);
    } else if (this.round(nextProps.tokenBalance) < this.round(this.props.tokenBalance)) {
      this.setState({tokenBalance: nextProps.tokenBalance});
    }
    return true;
  }

  public addCoins = (tokenBalance: number) => {
    const coinsInTheAir = Math.min(MAX_COIN_IN_THE_AIR, this.round(tokenBalance));
    if (coinsInTheAir <= 0) {
      return;
    }
    const tokenTranslateX = new Array(coinsInTheAir)
      .fill(null).map(() => new Animated.Value(coinXPositionOffset));
    const tokenTranslateY = new Array(coinsInTheAir)
      .fill(null).map(() => new Animated.Value(coinYPositionOffset));
    const tokenScale = new Array(coinsInTheAir)
      .fill(null).map(() => new Animated.Value(0));
    this.setState(
      {
        tokenTranslateX,
        tokenTranslateY,
        tokenScale,
      },
      () => this.animateCoins(tokenBalance),
    );
  }

  public animateCoins = (tokenBalance: number) => {
    Animated.timing(this.state.tokenScale[0],
      {
        duration: 200,
        toValue: 1.5,
        useNativeDriver: true,
      }).start(() => {
        this.state.tokenScale.map(animatedValue => animatedValue.setValue(1.5));
        this.state.tokenTranslateX.map((animatedValue, index) => {
          Animated.parallel([
            Animated.timing(animatedValue,
              {
                duration: 200,
                toValue: 0,
                useNativeDriver: true,
                delay: index * 60,
              }),
            Animated.timing(this.state.tokenTranslateY[index],
              {
                duration: 200,
                toValue: 0,
                useNativeDriver: true,
                delay: index * 60,
              }),
            Animated.timing(this.state.tokenScale[index],
              {
                duration: 200,
                toValue: 1,
                useNativeDriver: true,
                delay: index * 60,
              }),
          ]).start(() => {
            this.setState(state =>
            ({ tokenBalance:
                index === this.state.tokenTranslateX.length - 1 ?
                this.props.tokenBalance :
                Math.min(state.tokenBalance + tokenBalance / this.state.tokenTranslateX.length, this.props.tokenBalance),
            }));
          });
        });
      });
  }

  public renderAnimatedToken = (animatedValue: Animated.Value, index: number) => {
    return (
      <Animated.Image source={this.davTokenImage} key={index}
        style={[styles.animatedToken, {
          transform: [
            {
              translateX: animatedValue,
            },
            {
              translateY: this.state.tokenTranslateY[index],
            },
            {
              scale: this.state.tokenScale[index],
            },
          ],
        }]} />
    );
  }
  public closeModal = () => {
    this.setState({ isModalOpen: false });
  }

  public openModal = () => {
    this.setState({ isModalOpen: true });
  }

  public renderModal() {
    const { t, tokenBalance } = this.props;
    return (
      <Modal
        animationType='fade'
        onRequestClose={this.closeModal}
        transparent
        visible={
          this.state.isModalOpen
        }>
        <View style={[styles.modal]}>
          <Image source={require('../../../common/assets/images/dav_tokens_rewards.png')} />
          <Text
            style={[
              textStyles.h3,
              {
                textAlign: 'center',
                color: customColors.black,
                marginVertical: customSizes.space / 2,
              },
            ]}>
            {t('davBalancePopup.title')}
            <Image source={davSymbol} resizeMode='contain' style={{
              width: 20,
              height: 16,
              marginBottom: 8,
            }} />
            <Text style={[textStyles.h3, { color: customColors.davRed }]}>{this.round(tokenBalance)}</Text>
          </Text>
          <Text
            style={[
              textStyles.paragraph,
              { textAlign: 'center', color: customColors.black },
            ]}>
            {t('davBalancePopup.text')}
            <Text
              style={[
                textStyles.paragraph,
                { textAlign: 'center', color: customColors.black, fontWeight: 'bold' },
              ]}>
              {t('davBalancePopup.textBold')}
            </Text>
            .
          </Text>
          <Button
            style={[
              buttonsStyle.primary,
              {
                justifyContent: 'center',
                marginTop: customSizes.space,
                width: customSizes.main * 2,
              }]}
            text={'OK'}
            textStyle={[textStyles.button, { color: customColors.white }]}
            onPress={this.closeModal} />
        </View>
        <View style={styles.overlay} />
      </Modal>
    );
  }

  public render() {
    return (
      <>
        {
          this.props.userGotDavReward ?
            <View style={styles.container}>
              <TouchableOpacity style={styles.button} onPress={() => {
                firebase.analytics().logEvent('dav_balance_button_clicked');
                this.openModal();
              }}>
                <Text style={styles.tokenBalance}>{this.round(this.state.tokenBalance)}</Text>
                <Image source={this.davTokenImage} />
                {this.state.tokenTranslateX.map(this.renderAnimatedToken)}
              </TouchableOpacity>
            </View> : null
        }
        {this.state.isModalOpen ? this.renderModal() : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: customSizes.space,
    right: customSizes.space,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  animatedToken: {
    position: 'absolute',
    top: 4,
    right: 6,
    transform: [
      { translateX: coinXPositionOffset },
      { translateY: coinYPositionOffset },
    ],
  },
  button: {
    height: customSizes.space * 2,
    borderRadius: customSizes.space,
    padding: customSizes.space / 4,
    backgroundColor: customColors.white,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: customFonts.montserratBold,
    color: customColors.davRed,
    paddingHorizontal: customSizes.space / 2,
  },
  modal: {
    position: 'absolute',
    zIndex: 2,
    left: customSizes.main / 2,
    top: customSizes.window.height / 2 - customSizes.main * 3,
    width: customSizes.window.width - customSizes.main,
    backgroundColor: '#FFF',
    padding: customSizes.space,
    paddingVertical: customSizes.main / 2,
    borderRadius: customSizes.main / 2,
    flex: 1,
    alignItems: 'center',
    opacity: 1,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
    zIndex: 1,
    backgroundColor: customColors.blackTransparent1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

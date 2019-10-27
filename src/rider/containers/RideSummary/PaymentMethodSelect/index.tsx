import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { translate } from 'react-i18next';
import { customColors, customFonts, customSizes, shadowStyles } from '../../../../common/styles';
import { davSymbolWhite, creditCard } from '../../../../common/components/Icons';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { PaymentMethod } from '../../../stores/RideStore';

interface IPaymentMethodSelectProps {
  choosePaymentMethod: (method: PaymentMethod) => void;
  t(key: string, options?: any): string;
}

function PaymentMethodSelect(props: IPaymentMethodSelectProps) {

  const renderButton = (icon: any, text: string, onPress: () => void) =>
    (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.button, shadowStyles.large]}>
        <Image source={icon} resizeMode='contain' style={{
          width: 25,
          height: 20,
        }} />
        <Text style={styles.buttonText}>
          {text}
        </Text>
      </TouchableOpacity>
    );

  const chooseDav = () => {
    props.choosePaymentMethod(PaymentMethod.dav);
  };

  const chooseFiat = () => {
    props.choosePaymentMethod(PaymentMethod.fiat);
  };

  const { t } = props;
  return (
    <View style={styles.container}>
      <Text style={{
        color: customColors.black,
        fontSize: 20,
        fontFamily: customFonts.montserratRegular,
        marginBottom: customSizes.space,
        textAlign: 'center',
      }}>
        <Text style={{ fontWeight: '800' }}>
          {t('rideSummary.texts.wowza')}
        </Text>
        {`${t('rideSummary.texts.wowzaText')}`}
      </Text>
      {renderButton(davSymbolWhite, t('rideSummary.texts.dav'), chooseDav)}
      {renderButton(creditCard, t('rideSummary.texts.fiat'), chooseFiat)}
    </View>
  );
}

const isLargeScreen = customSizes.window.height > 720;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: isLargeScreen ? customSizes.main * 2 : customSizes.space,
    flex: 1,
    width: customSizes.window.width,
    zIndex: 2,
    padding: customSizes.space,
  },
  button: {
    padding: customSizes.main / 4,
    width: customSizes.window.width - customSizes.main,
    backgroundColor: customColors.grey5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: customSizes.space / 2,
    marginLeft: customSizes.space / 2,
    marginTop: customSizes.space / 2,
  },
  buttonText: {
    width: customSizes.window.width - customSizes.main * 2,
    textAlign: 'center',
    color: customColors.white,
    fontSize: 20,
    fontFamily: customFonts.montserratBold,
  },
});

export default translate('translations')(PaymentMethodSelect);

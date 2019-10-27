import React from 'react';
import { Image, View } from 'react-native';

interface ICreditCardLogoProps {
  brand: string;
  style?: any;
}

const brands = {
  americanexpress: 'https://files.readme.io/97e7acc-Amex.png',
  cartebleau: 'https://files.readme.io/5da1081-cb.png',
  diners: 'https://files.readme.io/8c73810-Diners_Club.png',
  discover: 'https://files.readme.io/caea86d-Discover.png',
  jcb: 'https://files.readme.io/e076aed-JCB.png',
  maestrouk: 'https://files.readme.io/daeabbd-Maestro.png',
  mastercard: 'https://files.readme.io/5b7b3de-Mastercard.png',
  solo: 'https://bluesnap.com/services/hosted-payment-fields/cc-types/solo.png',
  visa: 'https://files.readme.io/9018c4f-Visa.png',
} as any;

export default class CreditCardLogo extends React.Component<ICreditCardLogoProps> {

  public render() {
    const formattedBrandName = this.props.brand.toLowerCase().replace(/\s/g, '');
    const uri = brands[formattedBrandName] || 'https://files.readme.io/d1a25b4-generic-card.png';
    return (
      <View style={this.props.style}>
        <Image source={{uri}} style={{width: 32, height: 24, borderRadius: 2}}/>
      </View>
    );
  }
}

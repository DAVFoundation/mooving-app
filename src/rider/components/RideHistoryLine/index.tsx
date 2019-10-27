import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { customColors, customSizes, textStyles, shadowStyles, customFonts } from '../../../common/styles';
import { IRideHistory } from '../../stores/AccountStore';
import { distance as distanceIcon, payment, clock, receipt } from '../../../common/components/Icons';
import moment from 'moment';
import Button from '../../../common/components/Button';
import currencySymbolMap from '../../../common/lib/currencySymbolMap';
import firebase from 'react-native-firebase';

interface IRideHistoryLineProps extends IRideHistory {
  openReceipt: (v: any) => void;
  invoiceSupportedDate: Date;
}

export default class RideHistoryLine extends React.Component<IRideHistoryLineProps> {
  constructor(props: IRideHistoryLineProps) {
    super(props);
  }

  public openReceipt = () => {
    firebase.analytics().logEvent('pdf_button_clicked');
    const { endTime, openReceipt } = this.props;
    openReceipt({endTime});
  }

  public render() {
    const { distance, price, endTime, startTime, currencyCode } = this.props;
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    return (
      <View style={[styles.container]}>
        <View>
          <Text style={[
            {
              fontFamily: customFonts.montserratRegular,
              fontWeight: '400',
              fontSize: 18,
              color: customColors.grey7,
              marginBottom: customSizes.space / 4,
            }]}>
            { moment(endTime).format('MMMM Do YYYY, hh:mm') }
          </Text>
          <View style={styles.itemData}>
            <View style={styles.itemData}>
              <Image style={{marginRight: customSizes.space / 4}}
                source={clock} />
              <Text style={[textStyles.description, styles.itemDataText]}>
                {`${Math.floor(duration / 60)}:${duration % 60}`} mins
              </Text>
            </View>
            <View style={styles.itemData}>
              <Image style={{marginRight: customSizes.space / 4}}
                source={distanceIcon} />
              <Text style={[textStyles.description, styles.itemDataText]}>
                {Math.round(distance * 100) / 100} km
              </Text>
            </View>
            <View style={styles.itemData}>
              <Image style={{marginRight: customSizes.space / 4}}
                source={payment} />
                <Text style={[textStyles.description, styles.itemDataText]}>
                {currencyCode ? currencySymbolMap[currencyCode] : '$'}{price}
                </Text>
            </View>
          </View>
        </View>
        {
          this.props.invoiceSupportedDate &&
          this.props.invoiceSupportedDate.getTime() < endTime.getTime() ?
            <Button
            icon={receipt}
            onPress={this.openReceipt}/> : null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: customSizes.space / 2,
    margin: customSizes.space / 2,
    marginTop: 0,
    backgroundColor: customColors.white,
    ...shadowStyles.large,
  },
  itemData: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: customSizes.space / 6,
  },
  itemDataText: {
    color: customColors.grey5,
    paddingRight: customSizes.spaceFluidSmall / 2,
  },
});

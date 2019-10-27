import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  WebView,
} from 'react-native';
import {
  NavigationScreenProp, SectionList,
} from 'react-navigation';
import {
  textStyles,
  customColors,
  customSizes,
} from '../../../common/styles';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { arrowBackwardWhite } from '../../../common/components/Icons';
import { translate } from 'react-i18next';
import { inject, observer } from 'mobx-react/native';
import { STORE_ACCOUNT } from '../../constants';
import { AccountStore, IRideHistory } from '../../stores/AccountStore';
import RideHistoryLine from '../../components/RideHistoryLine';
import PDFModal from '../../components/PDFModal';
import { Api } from '../../lib/api';
import firebase from 'react-native-firebase';

export interface IRideHistoryProps {
  [STORE_ACCOUNT]: AccountStore;
  navigation: NavigationScreenProp<any, any>;
  t(key?: string, options?: any): string;
}

export interface IRideHistoryState {
  heightHeader: number;
  openedRecipe: Date | null;
}

@translate('translations')
@inject(STORE_ACCOUNT)
@observer
export default class RideHistory extends React.Component<IRideHistoryProps, IRideHistoryState> {

  private invoiceSupportedDate: Date | undefined;

  constructor(props: IRideHistoryProps) {
    super(props);
    this.state = {
      heightHeader: 0,
      openedRecipe: null,
    };
    firebase.analytics().logEvent('saw_ride_history_page');
  }

  public async componentWillMount() {
    this.invoiceSupportedDate = await getInvoiceSupportedDate();
    this.props[STORE_ACCOUNT].getRideHistory();
  }

  public handleLayout = ({ nativeEvent }) => {
    this.setState({ heightHeader: nativeEvent.layout.height });
  }

  public closeModal = () => {
    this.setState({openedRecipe: null});
  }

  public navigateBack = () => {
    this.props.navigation.pop();
  }

  public openReceipt = (lineData: IRideHistory) => {
    this.setState({openedRecipe: lineData.endTime});
  }

  public renderHeader = () => {
    const { t } = this.props;
    return (
      <SafeAreaView onLayout={this.handleLayout} style={[styles.header]}>
        <View style={styles.headerButtons}>
          <Button
            style={[
              buttonsStyle.smallCircle,
              { backgroundColor: customColors.whiteTransparent },
            ]}
            icon={arrowBackwardWhite}
            onPress={this.navigateBack}
          />
        </View>
        <Text
          style={[
            textStyles.h2,
            { color: customColors.white, padding: customSizes.space },
          ]}>
          {t('rideHistory.header')}
        </Text>
        <Image
          style={styles.headerBackground}
          source={require('../../../common/assets/bg-header_red.png')}
          resizeMode='stretch'
        />
      </SafeAreaView>
    );
  }

  public renderEmptyList() {
    const { t } = this.props;
    return (
      <View>
        <View style={[styles.emptyList]}>
        <Image
          style={{width: customSizes.window.width - customSizes.main,
                  height: (customSizes.window.width - customSizes.main) / 2.45}}
          resizeMode='cover'
          source={require('../../../common/assets/illustrations/vehicles-illustration-grey.png')}
          />
        <Text
          style={[
            textStyles.calloutResponsive,
            textStyles.alignCenter,
            {
              marginTop: customSizes.space,
              color: customColors.grey3,
            }]}>
        {t('rideHistory.noRidesText')}
        </Text>
      </View>
    </View>
    );
  }

  public renderRideData = (props: any) => {
    return <RideHistoryLine {...props.item }
     openReceipt={this.openReceipt}
     invoiceSupportedDate={this.invoiceSupportedDate}/>;
  }

  public render() {
    const { rideHistory } = this.props[STORE_ACCOUNT];
    return (
      <View style={styles.containerPage}>
        { this.renderHeader() }
        {
        rideHistory.length ?
        <SectionList
          ListEmptyComponent={this.renderEmptyList}
          contentContainerStyle={{
            paddingTop: this.state.heightHeader + customSizes.space / 2,
            paddingBottom: customSizes.space,
          }}
          keyExtractor={(item, index) => item + index}
          sections={[
            { renderItem: this.renderRideData, data: rideHistory.slice() },
          ]} /> :
          this.renderEmptyList()
        }
        {
          this.state.openedRecipe ?
          <PDFModal closeModal={this.closeModal}
          source={Api.getInstance().getInvoiceRequest(this.state.openedRecipe)}/> :
          null
        }
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  containerPage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: customColors.grey0,
    height: customSizes.window.height,
  },
  header: {
    width: customSizes.window.width,
    top: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  headerBackground: {
    zIndex: -1,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
  },
  headerButtons: {
    paddingTop: customSizes.space,
    paddingHorizontal: customSizes.space,
    width: customSizes.window.width - customSizes.space * 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyList: {
    display: 'flex',
    height: customSizes.window.height,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: customSizes.space / 2,
  },
});

// This is an huck to keep Lior satisfied
let invoiceSupportedDate: Date;
async function getInvoiceSupportedDate() {
  if (!invoiceSupportedDate) {
    try {
      const remoteConfig = firebase.config();
      await remoteConfig.fetch(0);
      await remoteConfig.activateFetched();
      let invoiceSupportedDateString = await remoteConfig.getValue('invoiceSupportedDate');
      invoiceSupportedDateString = invoiceSupportedDateString.val();
      invoiceSupportedDate = new Date(invoiceSupportedDateString);
    } catch (err) {
      invoiceSupportedDate = new Date('07/10/19');
    }
  }
  return invoiceSupportedDate;
}

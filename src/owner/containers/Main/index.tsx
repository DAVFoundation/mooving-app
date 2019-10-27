import React from 'react';
import {
  StyleSheet,
  Animated,
  SafeAreaView,
  Platform,
  View,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { translate } from 'react-i18next';
import Map from '../../components/Map';
import { customColors, customSizes } from '../../../common/styles/variables';
import { STORE_VEHICLE, STORE_ACCOUNT } from '../../constants';
import { VehicleStore } from '../../stores/VehicleStore';
import { AccountStore } from '../../stores/AccountStore';
import { DashboardCard } from '../DashboardCard';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { collapse, expand } from '../../../common/components/Icons';
import StatusChangeErrorModal from '../StatusChangeErrorModal';
import { ifIphoneX } from 'react-native-iphone-x-helper';

interface IMainProps {
  [STORE_VEHICLE]: VehicleStore;
  [STORE_ACCOUNT]: AccountStore;
  t(key: string, options?: any): string;
}

interface IMainSate {
  openedCallout: any;
  detailsCardBackground?: Animated.Value;
  touched: boolean;
  isCardOpen: boolean;
  detailsCardTopPosition: Animated.Value;
}

@translate('translations')
@inject(STORE_VEHICLE, STORE_ACCOUNT)
@observer
export default class Main extends React.Component<IMainProps, IMainSate> {
  private markers: any;
  private cardHeight: number = 0;

  constructor(props: IMainProps) {
    super(props);
    this.state = {
      openedCallout: null,
      touched: false,
      isCardOpen: true,
      detailsCardTopPosition: new Animated.Value(customSizes.window.height),
    };
    this.markers = {};
    this.selectMarker = this.selectMarker.bind(this);
    this.closeOpenedCallout = this.closeOpenedCallout.bind(this);
  }

  public setCardHeight = ({nativeEvent}) => {
    if (this.cardHeight) {
      return;
    }
    const cardHeight = nativeEvent.layout.height;
    this.cardHeight = customSizes.window.height - ifIphoneX(cardHeight + 170, Platform.select({
      android: cardHeight + 140,
      ios: cardHeight + 120,
    }));
    Animated.timing(
      this.state.detailsCardTopPosition,
      {
        duration: 300,
        toValue: this.cardHeight,
      },
    ).start();
  }

  public toggleMap() {
    if (this.state.isCardOpen) {
      Animated.timing(
        this.state.detailsCardTopPosition,
        {
          duration: 300,
          toValue: customSizes.window.height - customSizes.main * 2,
        },
      ).start();
      this.setState({isCardOpen: false});
    } else {
      Animated.timing(
        this.state.detailsCardTopPosition,
        {
          duration: 300,
          toValue: this.cardHeight,
        },
      ).start();
      this.setState({isCardOpen: true});
    }
  }

  public componentWillMount() {
    this.props[STORE_ACCOUNT].getOwnerStats();
  }

  public selectMarker(index: number) {
    this.setState({ openedCallout: this.markers[index] });
  }

  public closeOpenedCallout() {
    if (this.state.openedCallout) {
      this.state.openedCallout.hideCallout();
      this.setState({ openedCallout: null });
    }
  }

  public refMarker(marker: any, qrCode: string) {
    this.markers[qrCode] = marker;
  }

  public generateMarkers() {
    const { vehicles } = this.props[STORE_VEHICLE];
    return Object.values(vehicles)
    .map((vehicle: any, index: number) => {
      const { location, batteryLevel, qrCode } = vehicle;
      const { latitude, longitude } = location;
      if (vehicle && location) {
        return {
          location: { latitude, longitude },
          batteryLevel,
          qrCode,
          index,
          selectMarker: this.selectMarker,
          refMarker: this.refMarker,
        };
      } else {
        return null;
      }
    })
    .filter(v => v);
  }

  public render() {
    const { vehicles } = this.props[STORE_VEHICLE];
    const vehicleAmount = Object.values(vehicles).length;
    const detailsCardTopPosition = vehicleAmount ?
      Animated.add(this.state.detailsCardTopPosition, customSizes.space) :
      this.state.detailsCardTopPosition;
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[{ height: detailsCardTopPosition }]}>
          <Map
            onPressMap={this.closeOpenedCallout}
            data={this.generateMarkers()}
          />
          <Button
          style={[buttonsStyle.smallRectangle, styles.expandMapButton]}
          onPress={this.toggleMap.bind(this)}
          icon={this.state.isCardOpen ? expand : collapse}/>
        </Animated.View>
        <Animated.View>
          <View onLayout={this.setCardHeight}>
            <DashboardCard />
          </View>
        </Animated.View>
        <StatusChangeErrorModal/>
      </SafeAreaView>
    );
  }
}

const sizeIcon = customSizes.main / 1.25;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  markerIcon: {
    resizeMode: 'contain',
    flex: 1,
    height: sizeIcon,
    width: sizeIcon / 1.25,
  },
  tooltip: {
    borderRadius: 3,
    padding: 5,
    flexDirection: 'row',
    backgroundColor: customColors.blackTransparent,
    marginBottom: 5,
  },
  expandMapButton: {
    position: 'absolute',
    bottom: customSizes.main / 2,
    right: customSizes.spaceFluidSmall,
    backgroundColor: customColors.white,
    zIndex: 9,
  },
});

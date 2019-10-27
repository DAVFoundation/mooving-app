import React from 'react';
import {
  View,
  StyleSheet,
  Linking,
  Text,
  Modal,
  Platform,
} from 'react-native';
import { customColors, customSizes, textStyles } from '../../../common/styles';
import { getStatusBarHeight, ifIphoneX } from 'react-native-iphone-x-helper';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { translate } from 'react-i18next';
import { support, crossBlack } from '../../../common/components/Icons';
import { ISupportInfo } from '../../../common/lib/types';
import { DEFAULT_SUPPORT_EMAIL } from '../../../common/constants';

interface IProps {
  riderId?: string;
  vehicleId?: string;
  supportInfo: ISupportInfo;
  t?(key: string, options?: any): string;
}

interface IState {
  isOpen: boolean;
}

@translate('translations')
export default class HelpSection extends React.Component<IProps, IState> {

  constructor(props: any) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  public toggleHelpSection = () => {
    let link = this.props.supportInfo && this.props.supportInfo.link;
    if (link) {
      link += `?riderId=${this.props.riderId}&vehicleId:=${this.props.vehicleId}`;
      Linking.canOpenURL(link).then(supported => {
        if (supported) {
          return Linking.openURL(link);
        }
      });
    } else {
      const isOpen = this.state.isOpen;
      this.setState({isOpen: !isOpen});
    }
  }

  public openEmail() {
    const email = (this.props.supportInfo && this.props.supportInfo.email) ||
      DEFAULT_SUPPORT_EMAIL;
    const rideDetails = `Ride details:\nriderId: ${this.props.riderId}\nvehicleId: ${this.props.vehicleId}`;
    const mailUrl = `${Platform.select({ios: 'message', android: 'mailto'})}:${email}?body=${rideDetails}`;
    Linking.canOpenURL(mailUrl).then(supported => {
      if (supported) {
        return Linking.openURL(mailUrl);
      }
    });
  }

  public openPhoneCall() {
    const phone = this.props.supportInfo && this.props.supportInfo.phone;
    if (phone) {
      const phoneUrl = `tel:${phone}`;
      Linking.canOpenURL(phoneUrl).then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        }
      });
    }
  }

  public renderModal() {
    const { t } = this.props;
    return(
      <Modal
        animationType='fade'
        transparent
        onRequestClose={this.toggleHelpSection}
        visible={
          this.state.isOpen
        }>
      <View style={[style.modalContainer]}>
      <Button
            icon={crossBlack}
            style={[
              buttonsStyle.smallCircle,
              {
                backgroundColor: customColors.white,
                marginTop: - customSizes.space / 2,
                marginLeft: - customSizes.space / 2,
                marginBottom: customSizes.space / 2,
                marginRight: customSizes.space / 4,
              },
            ]}
            onPress={this.toggleHelpSection}/>
        <Text
          style={[
            textStyles.h3,
            {
              textAlign: 'center',
              color: customColors.black,
              marginBottom: customSizes.space / 2,
            },
          ]}>
          {t('support.title')}
        </Text>
        <Text style={[
            textStyles.paragraph,
            { textAlign: 'center', color: customColors.black }]}>
          {t('support.text')}
        </Text>
        <View style={style.buttonsContainer}>
          <Button onPress={() => {
              this.openEmail();
              this.toggleHelpSection();
            }}
              style={[
                buttonsStyle.primary,
                {
                  flex: 1,
                  borderColor: customColors.davRed,
                  backgroundColor: customColors.davRed,
                },
                style.modalButton,
            ]}
              textStyle={[textStyles.button, {color: customColors.white}]}
              text={t('support.buttonEmail')}/>
          {
            this.props.supportInfo && this.props.supportInfo.phone ?
            <Button onPress={() => {
              this.openPhoneCall();
              this.toggleHelpSection();
            }}
              style={[
                buttonsStyle.secondary,
                {
                  flex: 1,
                  marginLeft: customSizes.spaceFluidSmall,
                },
                style.modalButton,
              ]}
              textStyle={[textStyles.button, {color: customColors.white}]}
              text={t('support.buttonPhone')}/>
              : null
          }
        </View>
      </View>
      <View style={style.overlay} />
    </Modal>
    );
  }

  public render() {
    const { t } = this.props;
    return (
      <>
        <View style={style.helpSection}>
          <Button
            style={[buttonsStyle.smallCircle, style.button]}
            icon={support}
            onPress={this.toggleHelpSection} />
        </View>
        { this.renderModal() }
      </>
    );
  }
}

const style = StyleSheet.create({
  helpSection: {
    zIndex: 6,
    position: 'absolute',
    left: customSizes.spaceFluidSmall,
    top: customSizes.spaceFluidSmall,
    ...ifIphoneX(
      {
        top: customSizes.spaceFluidBig,
        marginTop: getStatusBarHeight(),
      },
      {
        top: customSizes.spaceFluidBig,
      },
    ),
  },
  button: {
    backgroundColor: customColors.white,
  },
  modalButton: {
    backgroundColor: customColors.black,
    borderColor: customColors.black,
  },
  modalContainer: {
    position: 'absolute',
    zIndex: 2,
    left: customSizes.main / 2,
    top: customSizes.window.height / 2 - customSizes.main * 2,
    width: customSizes.window.width - customSizes.main,
    backgroundColor: '#FFF',
    padding: customSizes.space,
    borderRadius: customSizes.main / 2,
    opacity: 1,
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: customSizes.main / 2,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
    zIndex: 1,
    backgroundColor: customColors.blackTransparent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

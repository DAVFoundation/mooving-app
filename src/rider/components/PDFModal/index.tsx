import React from 'react';
import { StyleSheet, View, Modal, Platform } from 'react-native';
import Pdf from 'react-native-pdf';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { customSizes, customColors } from '../../../common/styles';
import { crossWhite } from '../../../common/components/Icons';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';

interface IProps {
  source: any;
  closeModal: () => void;
}
export default class PDFModal extends React.Component<IProps> {
  public render() {
    return (
      <Modal>
        <View style={styles.container}>
          <View style={styles.headerButtons}>
            <Button
              style={[
                buttonsStyle.smallCircle,
                { backgroundColor: customColors.grey7 },
              ]}
              icon={crossWhite}
              onPress={this.props.closeModal}
            />
          </View>
          <View style={styles.container}>
            <Pdf
              source={this.props.source}
              style={styles.pdf} />
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  pdf: {
    width: customSizes.window.width,
    height: customSizes.window.height,
  },
  headerButtons: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: 0,
    marginTop: Platform.select({
      ios: getStatusBarHeight() + (isIphoneX() ? 20 : 0),
      android: 0,
    }),
    padding: customSizes.space,
    width: customSizes.window.width,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

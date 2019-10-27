import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { customSizes, customColors, textStyles } from '../../../common/styles';
import Modal from 'react-native-modal';
import { viewportHeight } from '../../../common/lib/helpers';
import { inject, observer } from 'mobx-react/native';
import { STORE_ACCOUNT } from '../../constants';
import { AccountStore } from '../../stores/AccountStore';
import { crossWhite } from '../../../common/components/Icons';
import Button, { buttonsStyle } from '../../../common/components/Button';

interface IProps {
  [STORE_ACCOUNT]: AccountStore;
  isVisible: boolean;
  title: string;
  children: Element;
  headerButton?: Element;
  closeModal: () => void;
}

@inject(STORE_ACCOUNT)
@observer
export default class DetailsModal extends React.Component<IProps> {

  constructor(props: IProps) {
    super(props);
  }

  public render() {
    if (!this.props.isVisible) {
      return null;
    }
    return (
      <View>
        <Modal
          isVisible={this.props.isVisible}
          style={styles.detailsModal}
          hideModalContentWhileAnimating={true}
          onBackdropPress={this.props.closeModal}
          onSwipeComplete={this.props.closeModal}
          swipeDirection='down'
          onBackButtonPress={this.props.closeModal}>
          <View style={styles.detailsCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerButtons}>
                <Button
                  style={[buttonsStyle.smallCircle, { backgroundColor: customColors.whiteTransparent }]}
                  icon={crossWhite}
                  onPress={this.props.closeModal} />
                { this.props.headerButton }
              </View>
              <View style={styles.titleContainer}>
                <Text
                  style={[
                    textStyles.h2,
                    {
                      color: customColors.white,
                      marginVertical: customSizes.space / 2,
                    },
                  ]}>
                { this.props.title }
                </Text>
              </View>
            </View>
            { this.props.children }
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  detailsModal: {
    marginHorizontal: customSizes.space / 2,
    marginVertical: 0,
    padding: 0,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: customSizes.main / 4,
  },
  cardHeader: {
    backgroundColor: customColors.davRed,
    padding: customSizes.spaceFluidSmall,
    paddingBottom: customSizes.space,
  },
  headerButtons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsCard: {
    flex: 1,
    minHeight: customSizes.window.height / 2,
    borderTopLeftRadius: customSizes.space,
    borderTopRightRadius: customSizes.space,
    backgroundColor: customColors.grey0,
    marginTop: viewportHeight(10),
    overflow: 'hidden',
  },
});

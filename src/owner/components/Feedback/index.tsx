import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { IFeedback } from '../../../common/lib/types';
import { customColors, customSizes, shadowStyles, textStyles } from '../../../common/styles';
import StarRating from '../../../common/components/StarRating';
import Moment from 'moment';
import { STORE_APP } from '../../constants';
import { AppStore } from '../../../common/stores/AppStore';
import FeedbackTag from '../../../common/components/FeedbackTag';
import { observer, inject } from 'mobx-react/native';
import { translate } from 'react-i18next';

interface IProps extends IFeedback {
  [STORE_APP]: AppStore;
  openParkingPhoto: (imageUrl: string) => void;
}

@translate('translations')
@inject(STORE_APP)
@observer
export default class Feedback extends React.Component<IProps> {

  private tags: string[] = [];
  private comment: string = '';

  constructor(props: IProps) {
    super(props);
    const tagNames = this.props[STORE_APP].feedbackTags;
    if (props.feedbackTags) {
      this.tags = props.feedbackTags.filter(tag => tagNames.includes(tag));
      this.comment = props.feedbackTags.find(tag => !tagNames.includes(tag)) || '';
    }
  }

  public openParkingPhoto = () => this.props.openParkingPhoto(this.props.lastParkingImageUrl);

  public render() {
    const { lastParkingImageUrl, endTime, rating } = this.props;
    return (
      <View style={[styles.container, shadowStyles.small]}>
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackData}>
            <Text style={[textStyles.description, { color: customColors.grey3 }]}>
              {Moment(endTime).format('MMMM Do YYYY, hh:mm A')}
            </Text>
            <View style={{marginTop: customSizes.space / 2}}>
              <StarRating
                rate={rating}
                fontSize={8}
                disabled
                iconSize={customSizes.space + 4} />
            </View>
          </View>
          <View style={styles.parkingPhoto}>
            <TouchableOpacity onPress={this.openParkingPhoto}>
              <Image style={{
                width: '100%',
                height: undefined,
                aspectRatio: 1,
                borderRadius: customSizes.space / 4,
              }} source={{ uri: lastParkingImageUrl }} />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <View style={styles.feedbackTags}>
            {
              this.tags ?
              this.tags.map((tag, index) => <FeedbackTag text={tag} key={index} disabled />) :
              null
            }
          </View>
          <View style={{marginTop: customSizes.space / 2}}>
            {
              this.comment ?
                <Text style={textStyles.description}>
                  {this.comment}
                </Text> :
                null
            }
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: customColors.white,
    borderRadius: customSizes.space / 4,
    padding: customSizes.space / 2,
  },
  feedbackContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedbackData: {
    marginBottom: customSizes.space,
  },
  parkingPhoto: {
    width: customSizes.main,
    height: customSizes.main,
    borderRadius: customSizes.space / 4,
    backgroundColor: customColors.grey2,
  },
  feedbackTags: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
});

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { translate } from 'react-i18next';

interface IStatisticsProps {
  navigation: NavigationScreenProp<any, any>;
  t(key: string, options?: any): string;
}

@translate('translations')
export default class Statistics extends React.Component<IStatisticsProps> {

  constructor(props: IStatisticsProps) {
    super(props);
    this.navigateToMain = this.navigateToMain.bind(this);
    this.navigateToAccount = this.navigateToAccount.bind(this);
  }

  public navigateToMain() {
    const { navigate } = this.props.navigation;
    navigate('Main');
  }

  public navigateToAccount() {
    const { navigate } = this.props.navigation;
    navigate('Account');
  }

  public render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };

    return (
      <View style={styles.container}>
        <Text>Statistics</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'red',
  },
});

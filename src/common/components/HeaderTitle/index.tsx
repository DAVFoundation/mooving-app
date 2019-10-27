import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { customSizes } from '../../../common/styles';

export function HeaderTitle(props: any) {
  return (
    <View style = {styles.headerTitle}>
      <Text style={styles.headerTitleText}>{props.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    borderRadius: customSizes.main / 2,
    width: customSizes.main * 3,
    height: customSizes.space * 2,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
  },
  headerTitleText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 15,
  },
});

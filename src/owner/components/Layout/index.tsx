import React, { ReactNode } from 'react';
import { View } from 'react-native';

interface IRowProps {
  children: ReactNode;
  style?: any;
}

interface IColumnProps {
  children: ReactNode;
  style?: any;
  distanceRight?: number;
}

export function Row(props: IRowProps) {
  return (
    <View style={[{ display: 'flex', flexDirection: 'row' }, props.style]}>
      {props.children}
    </View>
  );
}

export function Column(props: IColumnProps) {
  return (
    <View
      style={[
        { display: 'flex', flexDirection: 'column' },
        props.style,
        { marginRight: props.distanceRight },
      ]}
    >
      {props.children}
    </View>
  );
}

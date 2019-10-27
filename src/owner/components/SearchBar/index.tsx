import React, { createRef } from 'react';
import { View, TextInput, StyleSheet, Animated, Platform } from 'react-native';
import { customSizes, customColors, customEasing } from '../../../common/styles';
import Button from '../../../common/components/Button';
import { isIphoneX } from 'react-native-iphone-x-helper';

interface ISearchBarProps {
  placeholder: string;
  value: string;
  onChangeText?: any;
  style?: any;
}

interface ISearchBarState {
  focus: boolean;
  searchBarWidth: Animated.Value;
}

export class SearchBar extends React.Component<ISearchBarProps, ISearchBarState> {

  private searchInputRef = createRef<TextInput>();

  constructor(props: ISearchBarProps) {
    super(props);
    this.state = {
      focus: false,
      searchBarWidth: new Animated.Value(customSizes.window.width - customSizes.space),
    };
  }

  public clearText = () => {
    this.props.onChangeText('');
    // Unfocus Search inout and dismiss keyboard
    const searchInput: TextInput | null = this.searchInputRef.current;
    if ( searchInput ) {
      searchInput.blur();
    }
    Animated.timing(this.state.searchBarWidth, {
      toValue: customSizes.window.width - customSizes.space,
      duration: 200,
      easing: customEasing.linear,
    }).start();
    this.setState({focus: false});
  }

  public focusToggle = () => {
    const { focus, searchBarWidth } = this.state;
    if (!focus) {
      Animated.timing(searchBarWidth, {
        toValue: customSizes.window.width - customSizes.main -
        (isIphoneX() ? customSizes.space / 2 : customSizes.space),
        duration: 200,
        easing: customEasing.linear,
      }).start();
    }
    this.setState({focus: true});
  }

  public render() {
    return (
      <View style={{position: 'relative'}}>
        <Animated.View style={{width: this.state.searchBarWidth}}>
          <TextInput
            ref={this.searchInputRef}
            onFocus={this.focusToggle}
            style={[styles.searchBar, this.props.style]}
            onChangeText={this.props.onChangeText}
            value={this.props.value}
            autoCorrect={false}
            placeholder={this.props.placeholder}
            returnKeyType={'search'}
          />
        </Animated.View>
        {
          this.state.focus ?
          <View style={{
            position: 'absolute',
            right: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}>
            <Button
              text={'Cancel'}
              textStyle={{ color: customColors.black }}
              onPress={this.clearText}/>
          </View> : null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  searchBar: {
    height: customSizes.space * 2,
    paddingHorizontal: customSizes.space,
    backgroundColor: customColors.white,
    borderRadius: 10,
    color: customColors.black,
  },
});

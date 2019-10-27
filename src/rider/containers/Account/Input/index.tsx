import React from 'react';
import { Keyboard, TextInput, View, Text } from 'react-native';
import { formStyles, textStyles } from '../../../../common/styles';
import firebase from 'react-native-firebase';

interface IInputProps {
  text: string;
  value: string;
  renderButtons: any;
  style?: any;
  onChange: (value: string) => void;
}

interface IInputState {
  value: string;
  isKeyboardUp: boolean;
  isFocused: boolean;
}

export default class Input extends React.Component<IInputProps, IInputState> {
  private keyboardDidShowListener: any;
  private keyboardDidHideListener: any;

  constructor(props: IInputProps) {
    super(props);
    this.state = {
      value: props.value,
      isKeyboardUp: false,
      isFocused: false,
    };
    this.renderButtons = this.renderButtons.bind(this);
  }

  public componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () =>
      this.setState({ isKeyboardUp: true }),
    );
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
      this.setState({ isKeyboardUp: false }),
    );
  }

  public componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  public renderButtons() {
    return this.props.renderButtons();
  }

  public onValueChanged = (value: string) => {
    this.setState({ value });
    this.props.onChange(value);
  }

  public onFocus = () => this.setState({ isFocused: true });
  public onBlur = () => this.setState({ isFocused: false });

  public render() {
    const { isFocused, isKeyboardUp, value } = this.state;
    return (
      <View>
        <View style={[formStyles.fieldContainer, this.props.style]}>
          <Text style={[textStyles.metadata, formStyles.fieldLabel]}>
            {this.props.text}
          </Text>
          <TextInput
            style={formStyles.textInput}
            value={value}
            onChangeText={this.onValueChanged}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
          />
        </View>
        {isFocused &&
          isKeyboardUp &&
          this.props.value !== value &&
          this.renderButtons()}
      </View>
    );
  }
}

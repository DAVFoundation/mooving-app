import React, { Component } from 'react';
import {
  Text,
  TextInput,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { translate } from 'react-i18next';
import {
  formStyles,
  customSizes,
  textStyles,
  customColors,
} from '../../../common/styles';
import Firebase from 'react-native-firebase';
import TopMenu from '../TopMenu';
import { arrowBackwardWhite } from '../../../common/components/Icons';
import Button, { buttonsStyle } from '../../../common/components/Button';
import { isIphoneX } from 'react-native-iphone-x-helper';
interface ICodeInputProps {
  submitCode: (code: string) => void;
  useQRScanner: () => void;
  cancelScan: () => void;
  t?(key: string, options?: any): string;
}
interface ICodeInputState {
  code: string;
}
@translate('translations')
export default class CodeInput extends Component<
  ICodeInputProps,
  ICodeInputState
> {
  constructor(props: ICodeInputProps) {
    super(props);
    this.state = {
      code: '',
    };
  }

  public onChangeText = (code: string) => this.setState({ code });

  public onSubmit = () => {
    Firebase.analytics().logEvent('manual_code_inserted');
    this.props.submitCode(this.state.code);
  }

  public render() {
    const { t } = this.props;
    const isIos = Platform.OS === 'ios';

    return (
      <SafeAreaView style={styles.container}>
        <TopMenu
          text={t('unlock.input.title')}
          textStyle={{color: customColors.black}}
          goBack={this.props.cancelScan}
          icon={arrowBackwardWhite}>
          <Text style={[textStyles.subtitle, styles.text]}>
            {t('unlock.input.text')}
          </Text>
        </TopMenu>
        <KeyboardAvoidingView
          style={styles.bottomSection}
          behavior={isIos ? 'padding' : undefined}
          enabled>
          <View style={{flex: 4}}>
            <TextInput
              autoCorrect={false}
              autoFocus={true}
              style={[formStyles.field, styles.codeInputField]}
              onChangeText={this.onChangeText}
              value={this.state.code}
              onSubmitEditing={this.onSubmit}
            />
          </View>
          <View style={{marginBottom: customSizes.spaceFluidSmall}}>
            <Button onPress={this.onSubmit}
              style={[buttonsStyle.primary, {backgroundColor: customColors.black}]}
              textStyle={[textStyles.button, {color: customColors.white}]}
              text='Unlock'/>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: customColors.grey0,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: customSizes.spaceFluidSmall,
    zIndex: 2,
  },
  primaryButton: {
    minHeight: customSizes.main / 1.25,
    marginBottom: customSizes.spaceFluidSmall,
  },
  mainSection: {
    paddingHorizontal: customSizes.spaceFluidSmall,
    paddingVertical: customSizes.spaceFluidBig,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  text: {
    color: customColors.black,
  },
  codeInputField: {
    minHeight: customSizes.main / 1.25,
    marginTop: customSizes.spaceFluidBig,
    marginBottom: customSizes.space,
    paddingHorizontal: customSizes.space,
    borderRadius: customSizes.main,
  },
});

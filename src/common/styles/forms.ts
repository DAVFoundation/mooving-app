import { StyleSheet, Platform } from 'react-native';
import { customSizes, customColors } from './variables';

export const field = {
  borderTopWidth: 1,
  borderColor: customColors.grey1,
  backgroundColor: customColors.white,
  paddingHorizontal: customSizes.space / 2,
  paddingTop: customSizes.space / 2,
};

export const formStyles = StyleSheet.create({
  field: {
    backgroundColor: customColors.white,
    borderWidth: 1,
    borderColor: customColors.grey2,
    borderRadius: 5,
    paddingHorizontal: 5,
    color: customColors.black,
  },
  fieldGroup: {
    display: 'flex',
    alignSelf: 'stretch',
    flexDirection: 'column',
    flex: 1,
  },
  fieldContainer: {
    ...field,
    paddingLeft: customSizes.space / 2,
    ...Platform.select({
      ios: {
        paddingTop: customSizes.space / 2,
        paddingBottom: customSizes.space / 4,
      },
      android: {
        paddingTop: customSizes.space / 4,
        paddingBottom: 0,
      },
    }),
  },
  fieldStandAlone: {
    ...field,
    paddingHorizontal: customSizes.space / 2,
    paddingBottom: 5,
  },
  fieldLabel: {
    color: customColors.grey3,
    marginTop: 2.5,
    ...Platform.select({
      ios: {
        marginBottom: 5,
      },
      android: {
        marginLeft: 5,
      },
    }),
  },
  inputCode: {
    backgroundColor: customColors.white,
  },
  inputNotEmpty: {
    backgroundColor: customColors.black,
    borderColor: customColors.black,
    color: customColors.white,
  },
  inputPhone: {
    flex: 1,
    backgroundColor: customColors.white,
    fontSize: customSizes.space,
    textAlign: 'center',
    paddingLeft: customSizes.space,
    height: customSizes.space * 2,
    marginRight: customSizes.space / 2,
    borderRadius: customSizes.main,
  },
  inputLabel: {
    color: customColors.grey2,
    marginBottom: customSizes.space / 4,
  },
  inlineFieldButton: {
    ...field,
    paddingVertical: customSizes.main / 4,
    borderBottomWidth: 1,
  },
  textInput: {
    color: customColors.grey6,
    marginBottom: 5,
  },
});

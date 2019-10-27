import i18n from 'i18next';
import RNLanguages from 'react-native-languages';

const i18nInit = ({en}) => {
  i18n.init({
    lng: 'en',
    fallbackLng: 'en',
    appendNamespaceToCIMode: true,

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',
    // debug: true,
    resources: {
      en: {
        translations: en,
      },
    },
    react: {
      wait: true,
    },
  });
  i18n.locale = RNLanguages.language;
  i18n.fallbacks = true;
  return i18n;
};

export default i18nInit;

/** @format */

import {AppRegistry, YellowBox} from 'react-native';
import BuildConfig from './src/common/lib/build-config'
import Config from './src/common/lib/config'
import {name as appName} from './app.json';

async function init() {
  YellowBox.ignoreWarnings([
    'Require cycle:',
  ]);
  const APP_VARIANT = BuildConfig.buildVariant;
  Config.getInstance().init(APP_VARIANT);
  AppRegistry.registerComponent(appName, () => Config.getInstance().getApp());
}

init();

import React from 'react';
import { Component } from 'react';
import { Provider } from 'mobx-react/native';
import Stores from './stores';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';
import RootStack from './Navigator';
import codePush from 'react-native-code-push';
import { analytics } from 'react-native-firebase';

@codePush({ checkFrequency: codePush.CheckFrequency.ON_APP_RESUME })
export default class App extends Component<any> {

  public stores: Stores;

  constructor(props: any) {
    super(props);
    this.stores = new Stores();
  }

  public initializeStoresWithNavigation(navigator: any) {
    this.stores.init(navigator && navigator._navigation);
  }

  public getActiveRouteName(navigationState: any): string | null {
    if (!navigationState) {
      return null;
    }
    const route = navigationState.routes[navigationState.index];
    if (route.routes) {
      return this.getActiveRouteName(route);
    }
    return route.routeName;
  }

  public render() {
    return (
      <Provider {...this.stores}>
        <I18nextProvider i18n={i18n}>
          <RootStack
            onNavigationStateChange={(prevState, currentState) => {
              const currentScreen = this.getActiveRouteName(currentState);
              const prevScreen = this.getActiveRouteName(prevState);
              if (currentScreen && currentScreen !== prevScreen) {
                analytics().setCurrentScreen(currentScreen, currentScreen);
              }
            }}
            ref={ this.initializeStoresWithNavigation.bind(this) }/>
        </I18nextProvider>
      </Provider>
    );
  }
}

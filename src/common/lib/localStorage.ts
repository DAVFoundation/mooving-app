import { TOKEN, FALLBACK_COUNTRY, INITIAL_SCREEN, STATUS_ALERT } from '../constants/app';
import AsyncStorage from '@react-native-community/async-storage';

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN, token);
}

export async function deleteToken() {
  AsyncStorage.removeItem(TOKEN);
}

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN);
}

export async function isFirstUse() {
  const getFirstUse = await AsyncStorage.getItem('firstUse');
  AsyncStorage.setItem('firstUse', 'true');
  return !getFirstUse;
}

export async function setFallbackCountry(countryCode: string) {
  await AsyncStorage.setItem(FALLBACK_COUNTRY, countryCode);
}

export async function getFallbackCountry() {
  return await AsyncStorage.getItem(FALLBACK_COUNTRY);
}

export async function setInitialScreen(screenName: string) {
  return await AsyncStorage.setItem(INITIAL_SCREEN, screenName);
}

export async function getInitialScreen() {
  return await AsyncStorage.getItem(INITIAL_SCREEN);
}

export async function setFirstStatusChangeAlert(statusChangeAlert: any) {
  return await AsyncStorage.setItem(STATUS_ALERT, JSON.stringify(statusChangeAlert));
}

export async function getFirstStatusChangeAlert() {
  const statusChangeAlert = await AsyncStorage.getItem(STATUS_ALERT);
  return JSON.parse(statusChangeAlert || '{}');
}

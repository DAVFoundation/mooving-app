import Permissions from 'react-native-permissions';
import firebase from 'react-native-firebase';

export async function requestLocationPermission() {
  try {
    let locationPermission = await Permissions.check('location');
    if (locationPermission === 'undetermined') {
      firebase.analytics().logEvent('requested_location_permission');
      locationPermission = await Permissions.request('location');
    }
    return locationPermission === 'authorized';
  } catch (err) {
    firebase.analytics().logEvent('location_permission_error');
    return false;
  }
}

export async function requestCameraPermission() {
  const permission = await Permissions.request('camera');
  return permission === 'authorized';
}

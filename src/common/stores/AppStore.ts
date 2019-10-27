import { observable, runInAction, action } from 'mobx';
import { isFirstUse } from '../lib/localStorage';
import { RequestStatus } from '../../common/lib/types';
import { requestCameraPermission, requestLocationPermission } from '../lib/permissions';
import Permissions from 'react-native-permissions';
import { AppState } from 'react-native';
import { setInitialScreen as saveInitialScreen } from '../lib/localStorage';
import firebase from 'react-native-firebase';

export class AppStore {

  public feedbackTags: string[] = [];
  @observable public isFirstUse: boolean = true;
  @observable public requestStatus: RequestStatus = RequestStatus.done;
  @observable public isVersionUnsupported: boolean = false;
  @observable public cameraPermission: boolean = false;
  @observable public cameraPermissionRequested: boolean = false;
  @observable public locationPermission: boolean = false;
  @observable public locationPermissionRequested: boolean = false;
  @observable public locationPermissionAlertShowed: boolean = false;

  constructor() {
    this.init();
    this.loadFeedbackTags();
    AppState.addEventListener('change', this.updatePermissions);
  }

  private loadFeedbackTags() {
    const firebaseData = firebase.database();
    firebaseData.goOnline();
    firebaseData.ref('feedbackTags').on('value', snapshot => {
      this.feedbackTags = snapshot.val();
    });
  }

  public async init() {
    const firstUse = await isFirstUse();
    runInAction(() => {
      this.isFirstUse = firstUse;
    });
  }

  @action('update permission')
  public async updatePermissions() {
    const permission = await Permissions.check('camera');
    runInAction(() => {
      this.cameraPermission = permission === 'authorized';
    });
  }

  @action('request camera permission')
  public async requestCameraPermission() {
    const permission = await Permissions.check('camera');
    runInAction(() => {
      this.cameraPermission = permission === 'authorized';
    });
    if (!this.cameraPermissionRequested && permission !== 'authorized') {
      const cameraPermission = await requestCameraPermission();
      runInAction(() => {
        this.cameraPermissionRequested = true;
        this.cameraPermission = cameraPermission;
      });
    }
  }

  @action('request location permission')
  public async requestLocationPermission() {
    if (!this.locationPermissionRequested || !this.locationPermission) {
      this.locationPermission = await requestLocationPermission();
      this.locationPermissionRequested = true;
    }
    return this.locationPermission;
  }

  @action('set unsupported version')
  public setUnsupportedVersion(value: boolean) {
    this.isVersionUnsupported = value;
  }

  @action('set unsupported version')
  public dismissLocationPermissionAlert = () => {
    this.locationPermissionAlertShowed = true;
  }

  public setInitialScreen(screenName: string) {
    saveInitialScreen(screenName);
  }
}

import RiderDevelopmentEnvironment from '../../rider/config/development';
import RiderLocalEnvironment from '../../rider/config/local';
import RiderStagingEnvironment from '../../rider/config/staging';
import RiderProductionEnvironment from '../../rider/config/production';
import OwnerDevelopmentEnvironment from '../../owner/config/development';
import OwnerLocalEnvironment from '../../owner/config/local';
import OwnerStagingEnvironment from '../../owner/config/staging';
import OwnerProductionEnvironment from '../../owner/config/production';

export default class Config {

  private static _instance: Config | null = null;
  private _app: any = null;
  private _environment = {
    API_URL: 'http://localhost:3005',
  };

  public static getInstance() {
    if (this._instance === null) {
      this._instance = new Config();
    }
    return this._instance;
  }

  public init(variant: string) {
    switch (variant) {
      case 'productionDriver':
        this._app = require('../../driver/App').default;
        break;
      case 'stagingDriver':
        this._app = require('../../driver/App').default;
        break;
      case 'developmentDriver':
        this._app = require('../../driver/App').default;
        break;
      case 'productionOps':
        this._app = require('../../owner/App').default;
        this._environment = OwnerProductionEnvironment;
        break;
      case 'stagingOps':
        this._app = require('../../owner/App').default;
        this._environment = OwnerStagingEnvironment;
        break;
      case 'developmentOps':
        this._app = require('../../owner/App').default;
        this._environment = OwnerDevelopmentEnvironment;
        break;
      case 'localOps':
        this._app = require('../../owner/App').default;
        this._environment = OwnerLocalEnvironment;
        break;
      case 'productionRide':
        this._environment = RiderProductionEnvironment;
        this._app = require('../../rider/App').default;
        break;
      case 'stagingRide':
        this._environment = RiderStagingEnvironment;
        this._app = require('../../rider/App').default;
        break;
      case 'developmentRide':
        this._environment = RiderDevelopmentEnvironment;
        this._app = require('../../rider/App').default;
        break;
      case 'localRide':
        this._environment = RiderLocalEnvironment;
        this._app = require('../../rider/App').default;
        break;
      default:
        this._environment = RiderStagingEnvironment;
        this._app = require('../../rider/App').default;
        break;
    }
  }

  public getApp() {
    return this._app;
  }

  public getEnvironment() {
    return this._environment;
  }
}

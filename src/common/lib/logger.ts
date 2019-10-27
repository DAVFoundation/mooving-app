import { Api } from './api';

export class Logger {
  public static log(message?: any, optionalParams?: any, level = 'info') {
    if (__DEV__) {
      // tslint:disable-next-line:no-console
      console.log(message, optionalParams);
    } else {
      const payload = {
        message,
        level,
        params: optionalParams,
      };
      Api.getInstance().sendLog(payload);
    }
  }

  public static error(message?: any, optionalParams?: any) {
    Logger.log(message, optionalParams, 'error');
  }
}

import { Observable, interval, from, race } from 'rxjs';
import { OperationOptions, operation as Operation } from 'retry';
import { map, mergeAll, take, filter } from 'rxjs/operators';
import codePush from 'react-native-code-push';

import Config from './config';
import BuildConfig from './build-config';
import { IPollingOptions, IRetryOptions } from './types';
let instance: Api | null = null;

export class Api {
  protected token: string | null = null;

  public static getInstance() {
    if (instance) {
      return instance;
    } else {
      instance = new Api();
      return instance;
    }
  }

  protected async setVersionHeader(headers: Headers): Promise<void> {
    try {
      const metadata = await codePush.getUpdateMetadata();
      const label = metadata.label;
      const version = parseInt(label.substring(1), 10);
      headers.append('Version', `${BuildConfig.buildVersionName}.${version}`);
    } catch (err) {
      headers.append('Version', `${BuildConfig.buildVersionName}.0`);
    }
    // headers.append('Version', `1.0.0.0`);
  }

  protected setJsonHeader(headers: Headers): void {
    headers.append('Content-Type', 'application/json');
  }

  protected setAuthTokenHeader(headers: Headers): void {
    if (this.token) {
      headers.append('Authorization', `bearer ${this.token}`);
    }
  }

  protected setCacheControlHeader(headers: Headers): void {
    if (this.token) {
      headers.append('Cache-Control', 'max-age=0');
    }
  }

  public setToken(token: string) {
    this.token = token;
  }

  public async verifyClientVersion() {
    const headers = new Headers();
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return await this.fetchRetry(`verify-client-version`, {
      method: 'GET',
      headers,
    });
  }

  public async fetchOnce(uri: string, requestOptions: RequestInit, timeout: number = 30000): Promise<Response> {
    const endpointUri = `${Config.getInstance().getEnvironment().API_URL}/api${uri[0] === '/'
      ? ''
      : '/'}${encodeURI(uri)}`;
    const timeoutResponse: Response = {
      status: 999,
      statusText: 'Request timed out',
    } as Response;
    const timeoutStream = interval(timeout).pipe(take(1), map(() => ({ ...timeoutResponse })));
    const response = await race(timeoutStream, from(fetch(endpointUri, requestOptions))).toPromise();

    if (response.ok) {
      return response;
    } else {
      throw response;
    }
  }

  public fetchRetry(uri: string, requestOptions: RequestInit, retryOptions: (OperationOptions & IRetryOptions) = {}): Promise<Response> {
    retryOptions = {
      retries: 10,
      minTimeout: 1000,
      maxTimeout: 20000,
      forever: false,
      factor: 2.0,
      randomize: true,
      ...retryOptions,
    };
    const operation = Operation(retryOptions as OperationOptions);
    return new Promise((resolve, reject) => {
      operation.attempt(() => {
        this.fetchOnce(uri, requestOptions).then(response => resolve(response), err => {
          if (retryOptions.shouldRetry ? retryOptions.shouldRetry(err) : (err.status >= 500)) {
            if (!operation.retry(err)) {
              reject(operation.mainError());
            }
          } else {
            reject(err);
          }
        });
      });
    });
  }

  public fetchPolling(uri: string, requestOptions: RequestInit, pollingOptions: IPollingOptions = {
    interval: 2000,
  }): Observable<Response | null> {
    return interval(pollingOptions.interval).pipe(map(() => from(this.fetchRetry(uri, requestOptions).then(v => v, err => err))), mergeAll());
  }

  public async sendSMS(phoneNumber: string, countryCode: string) {
    const headers = new Headers();
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`sms?phoneNumber=${phoneNumber}&countryCode=${countryCode}`, {
      method: 'POST',
      headers,
    })).json();
  }

  public async verifyCode(phoneNumber: string, countryCode: string, verificationCode: string) {
    const headers = new Headers();
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`verify-code?phoneNumber=${phoneNumber}&countryCode=${countryCode}&verificationCode=${verificationCode}`, { headers })).json();
  }

  public async updatePersonalDetails(details: any) {
    const headers = new Headers();
    this.setJsonHeader(headers);
    this.setAuthTokenHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/update-personal-details`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(details),
    })).json();
  }

  public async getAccountDetails() {
    const headers = new Headers();
    this.setJsonHeader(headers);
    this.setAuthTokenHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/account`, {
      method: 'GET',
      headers,
    }, {
        retries: 2,
        minTimeout: 800,
        maxTimeout: 2000,
        forever: false,
        factor: 2.0,
        randomize: false,
      })).json();
  }

  public async sendLog(payload: any) {
    const headers = new Headers();
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`client-log`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })).json();
  }
}

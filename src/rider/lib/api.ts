import { Api as ApiBase } from '../../common/lib/api';
import Config from '../../common/lib/config';
import RNFetchBlob from 'rn-fetch-blob';
import { Logger } from '../../common/lib/logger';

let instance: Api | null = null;

export class Api extends ApiBase {

  public static getInstance() {
    if (instance) {
      return instance;
    } else {
      instance = new Api();
      return instance;
    }
  }

  constructor() {
    super();
  }

  public async getVehicles(locationHash: string, accuracyLevel: number) {
    if (!locationHash) {
      return {};
    }
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/vehicles/${locationHash}?accuracyLevel=${accuracyLevel}`, {
      method: 'GET',
      headers,
    })).json();
  }

  public async updateCreditCard(token: string, firstName: string, lastName: string) {
    const headers = new Headers();
    this.setJsonHeader(headers);
    this.setAuthTokenHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/credit-card`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ pfToken: token, firstName, lastName }),
    })).json();
  }

  public async getVehicleByCode(vehicleCode: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/vehicle/${vehicleCode}`, {
      method: 'GET',
      headers,
    }))
      .json();
  }

  public async unlockVehicle(vehicleCode: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/vehicle/${vehicleCode}/unlock`, {
      method: 'GET',
      headers,
    }, {
        minTimeout: 10000,
        maxTimeout: 10000,
        retries: 5,
      }))
      .json();
  }

  public async lockVehicle(parkingImageUrl: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/vehicle/lock`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ parkingImageUrl }),
    }, {
        minTimeout: 10000,
        maxTimeout: 10000,
        retries: 5,
      }))
      .json();
  }

  public async getActiveRide(polling: boolean = false) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    const retryOptions = polling ? {
      factor: 1,
      retries: 30,
      shouldRetry: (err: any) => err.status === 404,
    } : {};
    return (await this.fetchRetry(`auth/active-ride`, {
      method: 'GET',
      headers,
    },
    retryOptions,
    )).json();
  }

  public async getSupportInfo(vehicleId: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`support-info/${vehicleId}`, {
      method: 'GET',
      headers,
    })).json();
  }

  public async getRideSummary(vehicleId?: string, startTime?: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchPolling(`auth/ride-summary?vehicleId=${vehicleId}&startTime=${startTime}`, {
      method: 'GET',
      headers,
    }));
  }

  public async saveParkingPhoto(rideId: string, imageUrl: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/ride/${rideId}/save-parking-photo`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ imageUrl }),
    }))
      .json();
  }

  public async rate(rideData: any) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/rate`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(rideData),
    })).json();
  }

  public async getPaymentToken() {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/generate-payment-token`, {
      method: 'GET',
      headers,
    })).json();
  }

  public async getRideHistory() {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/ride-history`, {
      method: 'GET',
      headers,
    })).json();
  }

  public async getPaymentInfo() {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/credit-card`, {
      method: 'GET',
      headers,
    })).json();
  }

  public async deleteCreditCard() {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/remove-credit-card`, {
      method: 'PUT',
      headers,
    })).json();
  }

  public getPaymentFormRequest() {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    this.setCacheControlHeader(headers);
    return {
      uri: `${Config.getInstance().getEnvironment().API_URL}/static/v1/PaymentForm.html`,
      headers: { authorization: headers.get('authorization') },
    };
  }

  public getInvoiceRequest(endTime: Date) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setCacheControlHeader(headers);
    this.setJsonHeader(headers);
    const requestUrl = `${Config.getInstance().getEnvironment().API_URL}/api/auth/invoice/${endTime.toISOString()}`;
    return {
      uri: requestUrl,
      headers: { authorization: headers.get('authorization') },
    };
  }

  public async setPaymentMethodForRide(vehicleId: string, startTime: Date, method: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/ride-payment`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({vehicleId, startTime, method}),
    })).json();
  }

}

import { Api as ApiBase } from '../../common/lib/api';

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

  public async getVehicles() {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/vehicles?date=${new Date().toISOString()}`, {
      method: 'GET',
      headers,
    })).json();
  }

  public async pollVehiclesData() {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchPolling(`auth/vehicles/statuses`, {
      method: 'GET',
      headers,
    }, {
      interval: 5000,
    }));
  }

  public async getOwnerStats(date: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/owner/stats?date=${date}`, {
      method: 'GET',
      headers,
    })).json();
  }

  public async getVehicleFullDetails(id: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/vehicles/${id}?date=${new Date().toISOString()}`, {
      method: 'GET',
      headers,
    })).json();
  }

  public async getMoreFeedbacks(vehicleId: string, lastFeedbackTime: Date) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/vehicles/${vehicleId}/feedbacks?date=${lastFeedbackTime.toISOString()}`, {
      method: 'GET',
      headers,
    })).json();
  }

  public async updateVehicleStatus(vehicleId: string, status: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    this.setJsonHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/vehicles/${vehicleId}/${status}`, {
      method: 'PUT',
      headers,
    })).json();
  }

  public async isJobFailed(jobId: string) {
    const headers = new Headers();
    this.setAuthTokenHeader(headers);
    await this.setVersionHeader(headers);
    this.setCacheControlHeader(headers);
    return (await this.fetchRetry(`auth/vehicles/job/${jobId}`, {
      method: 'GET',
      headers,
    })).json();
  }

}

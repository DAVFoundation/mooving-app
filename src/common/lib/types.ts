import { LatLng } from 'react-native-maps';
import { Subject, Observable } from 'rxjs';

export interface IRetryOptions {
  shouldRetry?: (err: any) => boolean;
}

export interface IPollingOptions {
  interval: number;
}

export interface ISupportInfo {
  phone?: string;
  email?: string;
  link?: string;
}

export interface IPaymentMethod {
  userId?: string;
  createdAt?: string;
  brand: string;
  country?: string;
  expMonth?: string;
  expYear?: string;
  funding?: string;
  tokenId?: string;
  last4: string;
}

export interface IVehicle {
  name: string;
  id: string;
  qrCode: string;
  location: LatLng;
  geoHash: string;
  batteryLevel: number;
  model: string;
  modelImageUrl: string;
  status: string;
  pricePerMinute?: number;
  basePrice?: number;
  operatorName?: string;
  currencyCode?: string;
}

export interface IFeedback {
  feedbackTags: string[];
  rating: number;
  lastParkingImageUrl: string;
  startTime: Date;
  endTime: Date;
}

export interface IChangingVehicleDetails {
  id: string;
  status: string;
  inTransition: boolean;
  geoHash: string;
  batteryLevel: number;
}

export interface IOpsVehicle extends IVehicle {
  totalUse?: number;
  totalProfit?: number;
  dailyUse?: number;
  dailyProfit?: number;
  formattedAddress?: string;
  lastParkingImageUrl: string;
  feedbacks: IFeedback[];
  subscription?: Observable<IChangingVehicleDetails>;
  isWaitingForStatusChange?: boolean;
  inTransition?: boolean;
}

export enum DBVehicleStatus {
  onmission = 'onmission',
  available = 'available',
  notavailable = 'notavailable',
  maintenance = 'maintenance',
}

export enum VehicleStatus {
  onmission = 'inride',
  available = 'available',
  notavailable = 'notavailable',
  maintenance = 'maintenance',
}

export enum RequestStatus {
  pending = 'pending',
  done = 'done',
  error = 'error',
}

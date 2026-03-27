export type Role = "ROLE_ADMIN" | "ROLE_USER" | "ROLE_DRIVER";
export type DeliveryType = "STANDARD" | "EXPRESS";

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
}

export interface User {
  id: number;
  email: string;
  mobile: string;
  fullName: string;
  role: Role;
  active: boolean;
}

// Used for create-booking responses
export interface CreateBookingResponse {
  id: number;
  deliveryType: DeliveryType;
  status: string;
  estimatedPrice: number;
  pickupZone?: string;
  dropZone?: string;
}

// Used for "my bookings" and driver task lists
export interface DeliveryOrder {
  id: number;
  deliveryType: DeliveryType;
  status: string;
  estimatedPrice: number;

  pickupAddress: string;
  dropAddress: string;
  pickupZone: string;
  dropZone: string;

  receiverName: string;
  receiverMobile: string;

  weightKg: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;

  pickupLatitude: number;
  pickupLongitude: number;
  dropLatitude: number;
  dropLongitude: number;
}

export interface TrackingEvent {
  id: number | string;
  status: string;
  latitude: number;
  longitude: number;
  recordedAt?: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  city?: string;
  zone: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentLoad: number;
}

export interface Batch {
  id: number;
  area: string;
  status: string;
  currentWeightKg: number;
  currentVolumeM3: number;
}


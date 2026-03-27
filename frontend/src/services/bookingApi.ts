import { http } from "./http";
import type { CreateBookingResponse, DeliveryOrder, DeliveryType } from "./types";

export type CreateBookingPayload = {
  deliveryType: DeliveryType;
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
};

export const bookingApi = {
  createBooking: async (payload: CreateBookingPayload) => {
    const { data } = await http.post<CreateBookingResponse>("/api/bookings", payload);
    return data;
  },
  myBookings: async () => {
    const { data } = await http.get<DeliveryOrder[]>("/api/bookings/my");
    return data;
  }
};


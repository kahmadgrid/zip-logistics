import { http } from "./http";
import type { DeliveryOrder, TrackingEvent } from "./types";

export type DriverProfilePayload = {
  vehicleType: string;
  vehicleNumber?: string;
  currentZone: string;
  availability: "ONLINE" | "OFFLINE";
  currentLatitude: number;
  currentLongitude: number;
};

export const driverApi = {
  createProfile: async (payload: DriverProfilePayload) => {
    const { data } = await http.post("/api/driver/profile", payload);
    return data;
  },
  tasks: async () => {
    const { data } = await http.get<DeliveryOrder[]>("/api/driver/tasks");
    return data;
  },
  assignedTasks: async () => {
    const { data } = await http.get<DeliveryOrder[]>("/api/driver/tasks/assigned");
    return data;
  },
  acceptTask: async (orderId: number) => {
    const { data } = await http.post(`/api/driver/tasks/${orderId}/accept`, {});
    return data;
  },
  updateStatus: async (orderId: number, status: string) => {
    const { data } = await http.patch(`/api/driver/tasks/${orderId}/status`, { status });
    return data;
  },
  updateLocation: async (orderId: number, payload: Omit<TrackingEvent, "id">) => {
    const { data } = await http.post(`/api/driver/tasks/${orderId}/location`, payload);
    return data;
  }
};


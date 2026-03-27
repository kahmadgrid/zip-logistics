import { http } from "./http";
import type { Batch, DeliveryOrder, User, Warehouse } from "./types";

export type CreateWarehousePayload = {
  code: string;
  name: string;
  city?: string;
  zone: string;
  latitude: number;
  longitude: number;
  capacity: number;
};

export const adminApi = {
  users: async () => {
    const { data } = await http.get<User[]>("/api/admin/users");
    return data;
  },
  drivers: async () => {
    const { data } = await http.get<User[]>("/api/admin/drivers");
    return data;
  },
  setUserActive: async (id: number, active: boolean) => {
    const { data } = await http.patch<User>(`/api/admin/users/${id}/active`, { active });
    return data;
  },
  createWarehouse: async (payload: CreateWarehousePayload) => {
    const { data } = await http.post<Warehouse>("/api/admin/warehouses", payload);
    return data;
  },
  prepareBatches: async (originZone: string, destinationZone: string) => {
    const { data } = await http.post<Batch[]>(
      `/api/admin/batching/prepare?originZone=${encodeURIComponent(originZone)}&destinationZone=${encodeURIComponent(destinationZone)}`,
      {}
    );
    return data;
  },
  orderLogs: async () => {
    const { data } = await http.get<DeliveryOrder[]>("/api/admin/logs/orders");
    return data;
  }
};


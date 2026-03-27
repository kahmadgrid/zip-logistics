import { Client } from "@stomp/stompjs";
import { http, API_BASE_URL } from "./http";
import type { TrackingEvent } from "./types";
import { useAuthStore } from "../store/authStore";

export const trackingApi = {
  timeline: async (orderId: number) => {
    const { data } = await http.get<TrackingEvent[]>(`/api/tracking/${orderId}`);
    return data;
  },
  addEvent: async (orderId: number, payload: Omit<TrackingEvent, "id">) => {
    const { data } = await http.post<TrackingEvent>(`/api/tracking/${orderId}/location`, payload);
    return data;
  },
  createSocketClient: (orderId: number, onMessage: (event: TrackingEvent) => void) => {
    const token = useAuthStore.getState().token;
    const client = new Client({
      brokerURL: `${API_BASE_URL.replace(/^http/, "ws")}/ws/tracking`,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 2000,
      debug: () => {}
    });

    client.onConnect = () => {
      client.subscribe(`/topic/tracking/${orderId}`, (message: { body: string }) => {
        const payload = JSON.parse(message.body) as TrackingEvent;
        onMessage(payload);
      });
    };

    return client;
  }
};


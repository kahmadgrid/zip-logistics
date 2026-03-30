import api from './api';

export const trackingService = {
  getTimeline:    (orderId)                    => api.get(`/api/tracking/${orderId}`),
  updateLocation: (orderId, lat, lng, status)  =>
    api.post(`/api/tracking/${orderId}/location`, { latitude: lat, longitude: lng, status }),
};

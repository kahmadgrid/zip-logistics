import axios from 'axios';
import api from './api';

export const zoneService = {
  getAllZones: async () => {
    const response = await api.get('/api/zones');
    return response.data;
  },

  detectZone: async (address, latitude, longitude) => {
    const response = await api.get('/api/zones/detect', {
      params: {
        address,
        latitude,
        longitude
      }
    });
    return response.data;
  }
};

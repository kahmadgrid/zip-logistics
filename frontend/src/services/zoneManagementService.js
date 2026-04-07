import axios from 'axios';
import api from './api'
export const zoneManagementService = {
  createZone: async (zoneData) => {
    const response = await api.post('/api/admin/zones', zoneData);
    return response.data;
  },

  getAllZones: async () => {
    const response = await api.get('/api/admin/zones');
    return response.data;
  }
};

import api from './api';

export const adminService = {
  createWarehouse: (data)            => api.post('/api/admin/warehouses', data),
  getWarehouses:   ()                => api.get('/api/admin/warehouses'),
  getUsers:        ()                => api.get('/api/admin/users'),
  getDrivers:      ()                => api.get('/api/admin/drivers'),
  setUserActive:   (userId, active)  => api.patch(`/api/admin/users/${userId}/active`, { active }),
  prepareBatches:  (originZone, destinationZone) =>
    api.post(`/api/admin/batching/prepare?originZone=${originZone}&destinationZone=${destinationZone}`),
  getOrderLogs:    ()                => api.get('/api/admin/logs/orders'),
};
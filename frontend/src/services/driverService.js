import api from './api';

export const driverService = {

  // 🚚 Driver Profile
  createOrUpdateProfile: (data) =>
    api.post('/api/driver/profile', data).then(res => res.data),

  getMyProfile: () =>
    api.get('/api/driver/profile').then(res => res.data),

  // 📦 Tasks
  getAvailableTasks: () =>
    api.get('/api/driver/tasks').then(res => res.data),

  getAssignedTasks: () =>
    api.get('/api/driver/tasks/assigned').then(res => res.data),

  // ⚡ Actions
  acceptOrder: (orderId) =>
    api.post(`/api/driver/tasks/${orderId}/accept`).then(res => res.data),

  updateStatus: (orderId, status) =>
    api.patch(`/api/driver/tasks/${orderId}/status`, { status }).then(res => res.data),

  updateLocation: (orderId, lat, lng, status) =>
    api.post(`/api/driver/tasks/${orderId}/location`, {
      latitude: lat,
      longitude: lng,
      status,
    }).then(res => res.data),

    deactivateAccount: () =>
      api.put('/api/driver/deactivate').then(res => res.data),

    activateAccount: () =>
      api.put('/api/driver/activate').then(res => res.data),
};





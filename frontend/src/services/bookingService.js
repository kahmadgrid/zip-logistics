import api from './api';

export const bookingService = {
  create:     (data)    => api.post('/api/bookings', data),
  myBookings: ()        => api.get('/api/bookings/my'),
  getById:    (id)      => api.get(`/api/bookings/${id}`),
  estimatePrice: (data) =>
      api.post('/api/pricing/estimate', data),
};

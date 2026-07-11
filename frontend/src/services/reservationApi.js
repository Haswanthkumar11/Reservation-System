import api from './api';

export const createReservation = (payload) => api.post('/reservations', payload).then((r) => r.data.data);
export const previewAllocation = (params) => api.get('/reservations/preview', { params }).then((r) => r.data.data);
export const getMyReservations = () => api.get('/reservations/my').then((r) => r.data.data);
export const cancelMyReservation = (id) => api.delete(`/reservations/${id}`).then((r) => r.data.data);

export const adminListReservations = (params) => api.get('/admin/reservations', { params }).then((r) => r.data.data);
export const adminListByDate = (date, params) =>
  api.get('/admin/reservations/date', { params: { date, ...params } }).then((r) => r.data.data);
export const adminUpdateReservation = (id, payload) =>
  api.patch(`/admin/reservations/${id}`, payload).then((r) => r.data.data);
export const adminCancelReservation = (id) => api.delete(`/admin/reservations/${id}`).then((r) => r.data.data);

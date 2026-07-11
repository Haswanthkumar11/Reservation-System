import api from './api';

export const getSettings = () => api.get('/settings').then((r) => r.data.data);
export const getSlots = () => api.get('/settings/slots').then((r) => r.data.data);
export const updateSettings = (payload) => api.patch('/settings', payload).then((r) => r.data.data);

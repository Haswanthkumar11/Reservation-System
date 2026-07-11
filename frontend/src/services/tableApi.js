import api from './api';

export const listTables = () => api.get('/tables').then((r) => r.data.data);
export const createTable = (payload) => api.post('/tables', payload).then((r) => r.data.data);
export const updateTable = (id, payload) => api.patch(`/tables/${id}`, payload).then((r) => r.data.data);
export const deleteTable = (id) => api.delete(`/tables/${id}`).then((r) => r.data.data);

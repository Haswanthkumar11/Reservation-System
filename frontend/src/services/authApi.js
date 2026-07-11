import api from './api';

export const registerUser = (payload) => api.post('/auth/register', payload).then((r) => r.data.data);
export const loginUser = (payload) => api.post('/auth/login', payload).then((r) => r.data.data);
export const getProfile = () => api.get('/auth/profile').then((r) => r.data.data);

import api from './api';

export const listNotifications = () => api.get('/notifications').then((r) => r.data.data);
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data.data);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all').then((r) => r.data.data);

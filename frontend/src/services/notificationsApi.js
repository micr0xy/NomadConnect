import api from './api';

export const getNotifications = async (limit = 20, skip = 0) => {
  try {
    const response = await api.get(`/api/notifications?limit=${limit}&skip=${skip}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch notifications';
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/api/notifications/${notificationId}/read`);
    return response.data.notification;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to mark notification as read';
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await api.patch('/api/notifications/read-all');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to mark all notifications as read';
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete notification';
  }
};

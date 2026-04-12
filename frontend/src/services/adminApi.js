import api from './api';

export const listUsers = async () => {
  try {
    const response = await api.get('/api/auth/admin/users');
    return response.data.users || [];
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch users';
  }
};

export const setUserBlocked = async (userId, isBlocked) => {
  try {
    const response = await api.patch(`/api/auth/admin/users/${userId}/block`, { isBlocked });
    return response.data.user;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update user status';
  }
};

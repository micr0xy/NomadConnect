import api from './api';

export const getProfileByEmail = async (email) => {
  try {
    const encodedEmail = encodeURIComponent(String(email || '').trim().toLowerCase());
    const response = await api.get(`/api/auth/profile/by-email/${encodedEmail}`);
    return response.data.user;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch profile';
  }
};

export const followUser = async (userId) => {
  try {
    const response = await api.post(`/api/auth/follow/${userId}`);
    return response.data.user;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to follow user';
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await api.post(`/api/auth/unfollow/${userId}`);
    return response.data.user;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to unfollow user';
  }
};

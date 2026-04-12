import api from './api';

export const getOrCreatePrivateGroup = async (userId) => {
  try {
    const response = await api.post(`/api/messages/groups/${userId}`);
    return response.data.group;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create or get group';
  }
};

export const getUserGroups = async () => {
  try {
    const response = await api.get('/api/messages/groups');
    return response.data.groups || [];
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch groups';
  }
};

export const getGroupMessages = async (groupId, limit = 30, skip = 0) => {
  try {
    const response = await api.get(`/api/messages/groups/${groupId}/messages`, {
      params: { limit, skip },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch messages';
  }
};

export const sendMessage = async (groupId, text) => {
  try {
    const response = await api.post(`/api/messages/groups/${groupId}/send`, { text });
    return response.data.message;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to send message';
  }
};

export const markMessagesAsRead = async (groupId) => {
  try {
    const response = await api.patch(`/api/messages/groups/${groupId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to mark messages as read';
  }
};

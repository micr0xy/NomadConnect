import api from './api';

export const listEvents = async () => {
  try {
    const response = await api.get('/api/events');
    return response.data.events || [];
  } catch (error) {
    console.error('Error fetching events:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to fetch events';
  }
};

export const getRecommendedEvents = async (limit = 6) => {
  try {
    const response = await api.get(`/api/events/recommendations?limit=${limit}`);
    return response.data.events || [];
  } catch (error) {
    console.error('Error fetching recommended events:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to fetch recommendations';
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/api/events', eventData);
    return response.data.event;
  } catch (error) {
    console.error('Error creating event:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to create event';
  }
};

export const improveEventDraft = async (draft) => {
  try {
    const response = await api.post('/api/events/nlp/improve', draft);
    return response.data.data;
  } catch (error) {
    console.error('Error improving event draft:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to improve event draft';
  }
};

export const joinEvent = async (eventId) => {
  try {
    const response = await api.post(`/api/events/${eventId}/join`);
    return response.data.event;
  } catch (error) {
    console.error('Error joining event:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to join event';
  }
};

export const leaveEvent = async (eventId) => {
  try {
    const response = await api.delete(`/api/events/${eventId}/leave`);
    return response.data.event;
  } catch (error) {
    console.error('Error leaving event:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to leave event';
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to delete event';
  }
};

export const sendMessage = async (eventId, text, userName) => {
  try {
    const response = await api.post(`/api/events/${eventId}/messages`, {
      text,
      userName,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to send message';
  }
};

export const getMessages = async (eventId, limit = 50, skip = 0) => {
  try {
    const response = await api.get(`/api/events/${eventId}/messages`, {
      params: { limit, skip },
    });
    return response.data.messages || [];
  } catch (error) {
    console.error('Error fetching messages:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to fetch messages';
  }
};

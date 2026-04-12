import api from './api';

/**
 * List all events
 * GET /api/events (protected)
 */
export const listEvents = async () => {
  try {
    const response = await api.get('/api/events');
    return response.data.events || [];
  } catch (error) {
    console.error('Error fetching events:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to fetch events';
  }
};

/**
 * Create a new event
 * POST /api/events (protected)
 * @param {Object} eventData - {title, description, startTime, location: {lng, lat}, maxParticipants}
 */
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/api/events', eventData);
    return response.data.event;
  } catch (error) {
    console.error('Error creating event:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to create event';
  }
};

/**
 * Improve event draft with NLP suggestions
 * POST /api/events/nlp/improve (protected)
 */
export const improveEventDraft = async (draft) => {
  try {
    const response = await api.post('/api/events/nlp/improve', draft);
    return response.data.data;
  } catch (error) {
    console.error('Error improving event draft:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to improve event draft';
  }
};

/**
 * Join an event
 * POST /api/events/:eventId/join (protected)
 * @param {string} eventId - Event ID
 */
export const joinEvent = async (eventId) => {
  try {
    const response = await api.post(`/api/events/${eventId}/join`);
    return response.data.event;
  } catch (error) {
    console.error('Error joining event:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to join event';
  }
};

/**
 * Leave an event
 * DELETE /api/events/:eventId/leave (protected)
 * @param {string} eventId - Event ID
 */
export const leaveEvent = async (eventId) => {
  try {
    const response = await api.delete(`/api/events/${eventId}/leave`);
    return response.data.event;
  } catch (error) {
    console.error('Error leaving event:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to leave event';
  }
};

/**
 * Delete an event (creator only)
 * DELETE /api/events/:eventId (protected)
 * @param {string} eventId - Event ID
 */
export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to delete event';
  }
};

/**
 * Send a message to event chat
 * POST /api/events/:eventId/messages (protected)
 * @param {string} eventId - Event ID
 * @param {string} text - Message text
 * @param {string} userName - User name for display
 */
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

/**
 * Get messages for an event
 * GET /api/events/:eventId/messages (protected)
 * @param {string} eventId - Event ID
 * @param {number} limit - Number of messages to fetch (default 50)
 * @param {number} skip - Number of messages to skip for pagination (default 0)
 */
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

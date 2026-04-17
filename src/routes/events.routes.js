const express = require('express');
const {
  createEvent,
  getEvents,
  getRecommendedEvents,
  joinEvent,
  leaveEvent,
  deleteEvent,
  postMessage,
  getMessages,
  improveEventDraft,
} = require('../controllers/events.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/events - Create a new event (protected)
router.post('/', verifyToken, createEvent);

// GET /api/events - Get all events (protected)
router.get('/', verifyToken, getEvents);

// GET /api/events/recommendations - NLP recommendations for current user (protected)
router.get('/recommendations', verifyToken, getRecommendedEvents);

// POST /api/events/nlp/improve - Improve event draft with NLP (protected)
router.post('/nlp/improve', verifyToken, improveEventDraft);

// POST /api/events/:eventId/join - Join an event (protected)
router.post('/:eventId/join', verifyToken, joinEvent);

// DELETE /api/events/:eventId/leave - Leave an event (protected)
router.delete('/:eventId/leave', verifyToken, leaveEvent);

// DELETE /api/events/:eventId - Delete event (creator/admin, protected)
router.delete('/:eventId', verifyToken, deleteEvent);

// POST /api/events/:eventId/messages - Post a message (protected)
router.post('/:eventId/messages', verifyToken, postMessage);

// GET /api/events/:eventId/messages - Get event messages (protected)
router.get('/:eventId/messages', verifyToken, getMessages);

module.exports = router;

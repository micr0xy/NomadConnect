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

/* Create new event */
router.post('/', verifyToken, createEvent);

/* Get all events */
router.get('/', verifyToken, getEvents);

/* Get recommended events */
router.get('/recommendations', verifyToken, getRecommendedEvents);

/* Improve event description */
router.post('/nlp/improve', verifyToken, improveEventDraft);

/* Join event */
router.post('/:eventId/join', verifyToken, joinEvent);

/* Leave event */
router.delete('/:eventId/leave', verifyToken, leaveEvent);

/* Delete event */
router.delete('/:eventId', verifyToken, deleteEvent);

/* Send message */
router.post('/:eventId/messages', verifyToken, postMessage);

/* Get messages */
router.get('/:eventId/messages', verifyToken, getMessages);

module.exports = router;

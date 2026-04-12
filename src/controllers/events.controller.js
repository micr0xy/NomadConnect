const Event = require('../models/Event');
const Message = require('../models/Message');
const User = require('../models/User');
const { createEventNotification } = require('./notification.controller');
const { generateHumanDescription, improveEventDraft: improveEventDraftNLP } = require('../services/eventNlp.service');

const formatNameFromEmail = (email = '') => {
  const local = String(email).split('@')[0] || 'user';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const buildSafeUserMap = (users = []) => {
  return users.reduce((acc, user) => {
    acc[String(user.email).toLowerCase()] = {
      displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || formatNameFromEmail(user.email),
      profileImage: user.profileImage || '',
    };
    return acc;
  }, {});
};

const enrichParticipants = async (participants = []) => {
  const participantEmails = [...new Set(participants
    .map((participant) => String(participant.userEmail || participant.email || '').toLowerCase())
    .filter(Boolean))];

  if (participantEmails.length === 0) {
    return participants;
  }

  const users = await User.find({ email: { $in: participantEmails } })
    .select('email firstName lastName profileImage')
    .lean();
  const userByEmail = buildSafeUserMap(users);

  return participants.map((participant) => {
    const email = String(participant.userEmail || participant.email || '').toLowerCase();
    const matchedUser = userByEmail[email];
    return {
      ...participant,
      userEmail: email,
      email,
      displayName: matchedUser?.displayName || formatNameFromEmail(email),
      profileImage: matchedUser?.profileImage || '',
    };
  });
};

const withEnrichedParticipants = async (eventDoc) => {
  if (!eventDoc) return eventDoc;
  const event = eventDoc.toObject ? eventDoc.toObject() : eventDoc;
  const participants = await enrichParticipants(event.participants || []);
  return {
    ...event,
    participants,
  };
};

const enrichMessages = async (messages = []) => {
  const messageEmails = [...new Set(messages
    .map((message) => String(message.userEmail || '').toLowerCase())
    .filter(Boolean))];

  if (messageEmails.length === 0) {
    return messages;
  }

  const users = await User.find({ email: { $in: messageEmails } })
    .select('email firstName lastName profileImage')
    .lean();
  const userByEmail = buildSafeUserMap(users);

  return messages.map((message) => {
    const enrichedMessage = message.toObject ? message.toObject() : message;
    const normalizedEmail = String(enrichedMessage.userEmail || '').toLowerCase();
    const matchedUser = userByEmail[normalizedEmail];
    return {
      ...enrichedMessage,
      userEmail: normalizedEmail,
      userName: enrichedMessage.userName || matchedUser?.displayName || formatNameFromEmail(normalizedEmail),
      userProfileImage: enrichedMessage.userProfileImage || matchedUser?.profileImage || '',
    };
  });
};

/**
 * Create a new event (protected route)
 * POST /api/events
 * Body: {
 *   title: string (required, min 3)
 *   description: string (optional)
 *   startTime: ISO string (required, must be future)
 *   location: { lng: number, lat: number } (required)
 *   maxParticipants: number (optional, >=2 if provided)
 * }
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, startTime, location, maxParticipants } = req.body;
    const createdByEmail = req.userEmail; // Set by verifyToken middleware
    const validCategories = ['meetup', 'travel', 'adventure', 'cultural', 'food', 'sports', 'other'];

    // Validate required fields
    if (!title || !category || !startTime || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, startTime, and location are required',
      });
    }

    if (!validCategories.includes(String(category).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event category',
      });
    }

    // Validate title length
    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 3 characters',
      });
    }

    // Validate startTime is future
    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startTime format. Use ISO 8601 format.',
      });
    }

    if (startDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event startTime must be in the future',
      });
    }

    // Validate location
    if (location.lng === undefined || location.lat === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Location must include lng and lat properties',
      });
    }

    // Validate coordinates
    if (location.lng < -180 || location.lng > 180 || location.lat < -90 || location.lat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Longitude must be -180 to 180, latitude -90 to 90',
      });
    }

    // Validate maxParticipants if provided
    if (maxParticipants !== null && maxParticipants !== undefined && maxParticipants < 2) {
      return res.status(400).json({
        success: false,
        message: 'Max participants must be at least 2',
      });
    }

    // Generate human-like description if missing or too short
    let finalDescription = description && description.trim().length >= 40
      ? description.trim()
      : generateHumanDescription({
        title,
        category,
        description: description || '',
        maxParticipants,
        date: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      });

    // Create event with GeoJSON location
    const newEvent = new Event({
      title: title.trim(),
      description: finalDescription,
      category: String(category).toLowerCase(),
      startTime: startDate,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
      maxParticipants: maxParticipants || null,
      createdByEmail,
      participants: [
        {
          userEmail: createdByEmail,
          joinedAt: new Date(),
        },
      ],
    });

    const savedEvent = await newEvent.save();

    // Create event notifications for followers
    const creator = await User.findOne({ email: createdByEmail }).select('_id');
    if (creator) {
      await createEventNotification(savedEvent._id, creator._id);
    }

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: savedEvent,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message,
    });
  }
};

/**
 * Improve event draft with NLP (protected route)
 * POST /api/events/nlp/improve
 */
exports.improveEventDraft = async (req, res) => {
  try {
    const { title, description, category, date, time, maxParticipants } = req.body;

    // Validate minimum input
    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least title or description',
      });
    }

    // Use NLP service to improve
    const improved = improveEventDraftNLP({
      title: title || '',
      description: description || '',
      category: category || 'other',
      date: date || '',
      time: time || '',
      maxParticipants: maxParticipants || null,
    });

    return res.status(200).json({
      success: true,
      data: improved,
    });
  } catch (error) {
    console.error('Error improving event draft:', error);
    return res.status(500).json({
      success: false,
      message: 'Error improving event draft',
      error: error.message,
    });
  }
};

/**
 * Get all events (protected route)
 * GET /api/events
 */
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ startTime: 1 });
    const enrichedEvents = await Promise.all(events.map((event) => withEnrichedParticipants(event)));

    return res.status(200).json({
      success: true,
      events: enrichedEvents,
      count: enrichedEvents.length,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

/**
 * Join an event (protected route)
 * POST /api/events/:eventId/join
 */
exports.joinEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userEmail = req.userEmail;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Ensure creator is treated as a participant even for legacy events.
    if (event.createdByEmail === userEmail) {
      const creatorAlreadyParticipant = event.participants.some(
        (p) => p.userEmail === userEmail
      );

      if (!creatorAlreadyParticipant) {
        event.participants.push({
          userEmail,
          joinedAt: new Date(),
        });
        await event.save();
      }

      const io = req.app.get('io');
      const enrichedEvent = await withEnrichedParticipants(event);

      if (io) {
        io.to(`event:${eventId}`).emit('event:participants-updated', enrichedEvent.participants);
      }

      return res.status(200).json({
        success: true,
        message: 'Event creator already has access',
        event: enrichedEvent,
      });
    }

    // Check if user already joined
    const alreadyJoined = event.participants.some(
      (p) => p.userEmail === userEmail
    );
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this event',
      });
    }

    // Check max participants limit
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full - max participants reached',
      });
    }

    // Add user to participants
    event.participants.push({
      userEmail,
      joinedAt: new Date(),
    });

    await event.save();
    const enrichedEvent = await withEnrichedParticipants(event);
    const io = req.app.get('io');

    if (io) {
      io.to(`event:${eventId}`).emit('event:participants-updated', enrichedEvent.participants);
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully joined event',
      event: enrichedEvent,
    });
  } catch (error) {
    console.error('Error joining event:', error);
    return res.status(500).json({
      success: false,
      message: 'Error joining event',
      error: error.message,
    });
  }
};

/**
 * Leave an event (protected route)
 * DELETE /api/events/:eventId/leave
 */
exports.leaveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userEmail = req.userEmail;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Prevent event creator from leaving their own event participant list.
    if (event.createdByEmail === userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Event creator cannot leave their own event',
      });
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      (p) => p.userEmail !== userEmail
    );

    await event.save();
    const enrichedEvent = await withEnrichedParticipants(event);
    const io = req.app.get('io');

    if (io) {
      io.to(`event:${eventId}`).emit('event:participants-updated', enrichedEvent.participants);
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully left event',
      event: enrichedEvent,
    });
  } catch (error) {
    console.error('Error leaving event:', error);
    return res.status(500).json({
      success: false,
      message: 'Error leaving event',
      error: error.message,
    });
  }
};

/**
 * Post a message in event chat (protected route)
 * POST /api/events/:eventId/messages
 * Body: { text: string, userName: string }
 */
exports.postMessage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { text, userName } = req.body;
    const userEmail = req.userEmail;
    const author = await User.findById(req.userId).select('firstName lastName profileImage email').lean();

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 1000 characters',
      });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Verify user is participant or creator
    const isParticipant = event.participants.some(
      (p) => p.userEmail === userEmail
    );
    const isCreator = event.createdByEmail === userEmail;

    if (!isParticipant && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You must join the event to chat',
      });
    }

    // Create message
    const message = new Message({
      eventId,
      userEmail,
      userName: userName || `${author?.firstName || ''} ${author?.lastName || ''}`.trim() || userEmail,
      userProfileImage: author?.profileImage || '',
      text: text.trim(),
    });

    await message.save();
    const [enrichedMessage] = await enrichMessages([message]);
    const io = req.app.get('io');

    if (io) {
      io.to(`event:${eventId}`).emit('chat:message', enrichedMessage);
    }

    return res.status(201).json({
      success: true,
      message: 'Message posted successfully',
      data: enrichedMessage,
    });
  } catch (error) {
    console.error('Error posting message:', error);
    return res.status(500).json({
      success: false,
      message: 'Error posting message',
      error: error.message,
    });
  }
};

/**
 * Get event chat messages (protected route)
 * GET /api/events/:eventId/messages
 */
exports.getMessages = async (req, res) => {
  try {
    const { eventId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    const userEmail = req.userEmail;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Verify user is participant or creator
    const isParticipant = event.participants.some(
      (p) => p.userEmail === userEmail
    );
    const isCreator = event.createdByEmail === userEmail;

    if (!isParticipant && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You must join the event to view chat',
      });
    }

    // Fetch messages
    const messages = await Message.find({ eventId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Reverse to show chronological order
    messages.reverse();
    const enrichedMessages = await enrichMessages(messages);

    return res.status(200).json({
      success: true,
      messages: enrichedMessages,
      count: enrichedMessages.length,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

/**
 * Delete an event (protected route)
 * DELETE /api/events/:eventId
 */
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userEmail = req.userEmail;
    const userRole = req.userRole;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.createdByEmail !== userEmail && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the event creator or admin can delete this event',
      });
    }

    await Promise.all([
      Event.findByIdAndDelete(eventId),
      Message.deleteMany({ eventId }),
    ]);

    const io = req.app.get('io');
    if (io) {
      io.to(`event:${eventId}`).emit('event:deleted', { eventId });
    }

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      eventId,
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message,
    });
  }
};

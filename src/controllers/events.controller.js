const Event = require('../models/Event');
const Message = require('../models/Message');

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
    const { title, description, startTime, location, maxParticipants } = req.body;
    const createdByEmail = req.userEmail; // Set by verifyToken middleware

    // Validate required fields
    if (!title || !startTime || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, startTime, and location are required',
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
    if (!location.lng || location.lat === undefined) {
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

    // Create event with GeoJSON location
    const newEvent = new Event({
      title: title.trim(),
      description: description ? description.trim() : '',
      startTime: startDate,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
      maxParticipants: maxParticipants || null,
      createdByEmail,
    });

    const savedEvent = await newEvent.save();

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
 * Get all events (protected route)
 * GET /api/events
 */
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ startTime: 1 });

    return res.status(200).json({
      success: true,
      events,
      count: events.length,
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

    return res.status(200).json({
      success: true,
      message: 'Successfully joined event',
      event,
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

    // Remove user from participants
    event.participants = event.participants.filter(
      (p) => p.userEmail !== userEmail
    );

    await event.save();

    return res.status(200).json({
      success: true,
      message: 'Successfully left event',
      event,
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
      userName: userName || userEmail,
      text: text.trim(),
    });

    await message.save();

    return res.status(201).json({
      success: true,
      message: 'Message posted successfully',
      data: message,
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

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Fetch messages
    const messages = await Message.find({ eventId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Reverse to show chronological order
    messages.reverse();

    return res.status(200).json({
      success: true,
      messages,
      count: messages.length,
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

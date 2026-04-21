const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./db');
const authRoutes = require('./routes/auth.routes');
const eventsRoutes = require('./routes/events.routes');
const notificationRoutes = require('./routes/notification.routes');
const messagesRoutes = require('./routes/messages.routes');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

const allowVercelPreviews = String(process.env.ALLOW_VERCEL_PREVIEWS || 'true').toLowerCase() === 'true';

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (!allowVercelPreviews) {
    return false;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.vercel.app');
  } catch (_) {
    return false;
  }
};

connectDB();

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  },
});

const parseCookieHeader = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [key, ...rest] = part.split('=');
    if (!key) return acc;
    acc[key.trim()] = decodeURIComponent(rest.join('=').trim());
    return acc;
  }, {});
};

io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || '';
    const cookies = parseCookieHeader(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    return next();
  } catch (error) {
    return next(new Error('Socket authentication failed'));
  }
});

io.on('connection', (socket) => {
  socket.on('join-event', ({ eventId }) => {
    if (eventId) {
      socket.join(`event:${eventId}`);
    }
  });

  socket.on('leave-event', ({ eventId }) => {
    if (eventId) {
      socket.leave(`event:${eventId}`);
    }
  });
});

app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messagesRoutes);

app.get('/health', (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    message: 'Server is running',
    timestamp: new Date(),
    db: dbStateMap[mongoose.connection.readyState] || 'unknown',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`✓ Server running on port ${port}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

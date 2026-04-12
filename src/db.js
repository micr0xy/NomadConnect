const mongoose = require('mongoose');
require('dotenv').config();

let isConnecting = false;

const connectDB = async () => {
  if (isConnecting || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set');
    }

    isConnecting = true;
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    setTimeout(connectDB, 10000);
    return null;
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected. Retrying connection...');
  setTimeout(connectDB, 5000);
});

module.exports = connectDB;

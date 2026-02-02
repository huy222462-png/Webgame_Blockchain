/**
 * MongoDB Connection Module
 * 
 * Tách riêng logic kết nối MongoDB để dễ quản lý và test
 * - Hàm connectDB(): Kết nối MongoDB với error handling (không throw error)
 * - Hàm connectDBWithRetry(): Retry connection trong background
 * - Hàm isConnected(): Kiểm tra trạng thái kết nối
 * - Export mongoose connection để dùng ở nơi khác
 */

const mongoose = require('mongoose');
const config = require('../config');

// Trạng thái kết nối MongoDB
// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
let isDBReady = false;
let connectionPromise = null;
let retryInterval = null;
let lastError = null; // Lưu lỗi cuối để tránh log trùng lặp
let retryCount = 0; // Đếm số lần retry

/**
 * Kết nối MongoDB (fail-fast: throw nếu không kết nối)
 * @returns {Promise<mongoose.Connection>} resolve khi kết nối thành công, reject khi lỗi
 */
async function connectDB() {
  // If already connected, resolve immediately
  if (mongoose.connection.readyState === 1) {
    isDBReady = true;
    return mongoose.connection;
  }

  // Mongoose options tuned for fast fail and minimal buffering
  const mongooseOptions = {
    serverSelectionTimeoutMS: 5000, // fail fast if cannot select server
    connectTimeoutMS: 10000, // connection handshake timeout
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    bufferCommands: false, // disable mongoose buffering when disconnected
    autoIndex: false,
  };

  // Try to connect once and let caller handle errors (fail-fast)
  try {
    const conn = await mongoose.connect(config.MONGO_URI, mongooseOptions);
    isDBReady = true;
    console.log('✅ MongoDB connected');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);

    // Keep basic listeners but avoid automatic retry logic
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isDBReady = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      isDBReady = false;
    });

    return conn.connection;
  } catch (err) {
    isDBReady = false;
    // Throw so caller (server start) can decide to exit or handle
    throw err;
  }
}

/**
 * Retry connection trong background
 */
// Note: removed automatic retry logic to keep startup fast and predictable.
// If retry behavior is desired, it should be implemented outside startup
// or via an orchestrator. For now connectDB() will throw on failure.

/**
 * Kiểm tra MongoDB đã kết nối chưa
 * @returns {boolean} true nếu đã kết nối, false nếu chưa
 */
function isConnected() {
  return mongoose.connection.readyState === 1 && isDBReady;
}

/**
 * Đóng kết nối MongoDB
 */
async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isDBReady = false;
    connectionPromise = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectDB,
  isConnected,
  disconnectDB,
  connection: mongoose.connection,
};

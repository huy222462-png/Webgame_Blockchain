
// Simple Express server to run the backend via `node backend/server.js`
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();


/**
 * Express Server - Main Entry Point
 * 
 * Server luôn chạy, MongoDB kết nối trong background
 * - Server start ngay lập tức
 * - MongoDB connect trong background với retry tự động
 * - API trả về 503 nếu DB chưa ready (middleware checkDB)
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Load .env từ thư mục backend (đảm bảo load đúng file)
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

// Import routes

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const gameRoutes = require('./routes/gameRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const path = require('path');
const config = require('./config');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
// serve uploaded avatars

const adminRoutes = require('./routes/adminRoutes');
const playerRoutes = require('./routes/playerRoutes');

// Import config và DB connection
const config = require('./config');
const { connectDB, isConnected, disconnectDB } = require('./db/connection');

// Khởi tạo Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/avatar', avatarRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/transactions', transactionRoutes);


mongoose.connect(config.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = config.PORT;
app.listen(PORT, () => console.log(`Backend đang lắng nghe tại http://localhost:${PORT}`));

app.use('/api/admin', adminRoutes);
app.use('/api/player', playerRoutes);

// Health check endpoint (không cần DB)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    db: require('./db/connection').isConnected() ? 'connected' : 'disconnected'
  });
});

/**
 * Khởi động server
 * - Start HTTP server ngay lập tức
 * - MongoDB connect trong background với retry tự động
 * - Server luôn chạy, API sẽ trả 503 nếu DB chưa ready
 */
async function startServer() {
  console.log('🚀 Starting server...');
  try {
    // Fail-fast: connect to MongoDB first. If this fails, exit with non-zero code.
    await connectDB();
    console.log('✅ DB ready, starting HTTP server');

    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB during startup:', err.message);
    console.error('   Exiting process. Fix MONGO_URI / network and restart.');
    process.exit(1);
  }
}

// Start server (await DB before listen)
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});


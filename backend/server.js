// Simple Express server to run the backend via `node backend/server.js`
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const gameRoutes = require('./routes/gameRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
const config = require('./config');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
// serve uploaded avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/avatar', avatarRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// Cấu hình MongoDB connection với timeout options
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // Timeout sau 10 giây
  socketTimeoutMS: 45000, // Socket timeout
  maxPoolSize: 10, // Số lượng connection tối đa
  retryWrites: true,
};

// Kết nối MongoDB
mongoose.connect(config.MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB:', config.MONGO_URI.replace(/\/\/.*@/, '//***@'));
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('');
    console.error('📝 MONGO_URI hiện tại:', config.MONGO_URI);
    console.error('');
    console.error('💡 Hãy kiểm tra:');
    console.error('   1. MongoDB có đang chạy không? (nếu dùng local)');
    console.error('   2. MONGO_URI trong backend/.env có đúng không?');
    console.error('   3. Nếu dùng MongoDB Atlas: đã whitelist IP chưa?');
    console.error('');
    console.error('📖 Hướng dẫn:');
    console.error('   - MongoDB Atlas (miễn phí): https://www.mongodb.com/cloud/atlas/register');
    console.error('   - MongoDB Local: chạy "mongod --dbpath C:\\data\\db" trong terminal khác');
    console.error('');
    console.error('⚠️  Server vẫn chạy nhưng các API cần MongoDB sẽ không hoạt động!');
    // Không exit - để server vẫn chạy và hiển thị lỗi rõ ràng
  });

const PORT = config.PORT;
app.listen(PORT, () => console.log(`Backend đang lắng nghe tại http://localhost:${PORT}`));

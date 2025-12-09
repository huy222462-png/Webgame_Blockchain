// Simple Express server to run the backend via `node backend/server.js`
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
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

mongoose.connect(config.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = config.PORT;
app.listen(PORT, () => console.log(`Backend đang lắng nghe tại http://localhost:${PORT}`));

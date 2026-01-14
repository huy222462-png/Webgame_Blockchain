require('dotenv').config();
const path = require('path');

module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/webgame',
  PORT: process.env.PORT || 5000,
  UPLOADS_DIR: path.join(__dirname, '..', 'uploads')
};

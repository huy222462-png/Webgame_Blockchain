
require('dotenv').config();
const path = require('path');

module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/webgame',
  PORT: process.env.PORT || 5000,
  UPLOADS_DIR: path.join(__dirname, '..', 'uploads')
};

/**
 * Configuration Module
 * 
 * Quản lý tất cả cấu hình từ environment variables
 * - Validate và normalize MONGO_URI
 * - Cung cấp default values
 * - Log warnings nếu config không hợp lệ
 */

// Load .env từ thư mục backend
const path = require('path');
const dotenv = require('dotenv');

// Đảm bảo load .env từ đúng thư mục backend
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Debug: Log để kiểm tra
if (process.env.MONGO_URI) {
  console.log('✅ Loaded MONGO_URI from .env');
} else {
  console.warn('⚠️  MONGO_URI not found in .env, using default');
}

/**
 * Validate và normalize MONGO_URI
 * @param {string} uri - Raw MONGO_URI từ environment
 * @returns {string} - Cleaned và validated URI
 */
function validateMongoURI(uri) {
  // Nếu không có URI, dùng default local
  if (!uri || uri.trim() === '') {
    return 'mongodb+srv://vinh223378_db_user:<Vinh5167943>@cluster0.h5qahvo.mongodb.net/?appName=Cluster0';
  }

  let cleanURI = uri.trim();
  
  // Phát hiện lỗi copy nhầm lệnh mongosh
  if (cleanURI.includes('mongosh')) {
    console.error('');
    console.error('❌ LỖI: Bạn đã copy nhầm lệnh mongosh thay vì connection string!');
    console.error('📝 MONGO_URI hiện tại:', cleanURI);
    console.error('');
    console.error('✅ Cách lấy connection string ĐÚNG:');
    console.error('   1. MongoDB Atlas → Connect → "Connect your application"');
    console.error('   2. Copy string có dạng: mongodb+srv://user:pass@cluster.net/dbname');
    console.error('');
    console.error('⚠️  Đang dùng MongoDB local mặc định');
    return 'mongodb://127.0.0.1:27017/webgame';
  }

  // Validate format
  const isValidFormat = cleanURI.startsWith('mongodb://') || cleanURI.startsWith('mongodb+srv://');
  if (!isValidFormat) {
    console.error('');
    console.error('❌ MONGO_URI không hợp lệ');
    console.error('   Phải bắt đầu với "mongodb://" hoặc "mongodb+srv://"');
    console.error('📝 MONGO_URI hiện tại:', cleanURI);
    console.error('');
    console.error('⚠️  Đang dùng MongoDB local mặc định');
  }

  // IMPORTANT: Do NOT mutate or append database name automatically.
  // Appending database names here caused incorrect SRV lookup (ENODATA) in some environments
  // Example problematic behavior: cluster0.h5qahvo.mongodb.net becomes cluster0.h5qahvo.mongodb.netwebgame
  // Instead, require the user to provide a full, valid MONGO_URI in the environment.
  if (cleanURI.startsWith('mongodb+srv://') || cleanURI.startsWith('mongodb://')) {
    // If no database name present, warn but DO NOT mutate the URI.
    const hasDb = /\/[^\/?]+(\?|$)/.test(cleanURI);
    if (!hasDb) {
      console.warn('⚠️  MONGO_URI does not contain a database name. Please include the database in the URI (e.g. /webgame)');
      console.warn('   Current MONGO_URI (masked):', cleanURI.replace(/\/\/.*@/, '//***@'));
    }
  }

  return cleanURI;
}

// Load và validate MONGO_URI
const rawMONGO_URI = process.env.MONGO_URI;

// Debug: Log MONGO_URI được load
if (!rawMONGO_URI) {
  console.warn('⚠️  MONGO_URI không tìm thấy trong environment variables');
  console.warn('   Đang dùng default MongoDB local');
  console.warn('   Hãy kiểm tra file backend/.env có đúng không?');
} else {
  console.log('📝 MONGO_URI từ .env:', rawMONGO_URI.replace(/\/\/.*@/, '//***@'));
}

const MONGO_URI = validateMongoURI(rawMONGO_URI);

// Export config
module.exports = {
  MONGO_URI,
  PORT: parseInt(process.env.PORT, 10) || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-access-secret-change-me',
  ADMIN_KEY: process.env.ADMIN_KEY,
  UPLOADS_DIR: path.join(__dirname, '..', 'uploads'),
  NODE_ENV: process.env.NODE_ENV || 'development',
};


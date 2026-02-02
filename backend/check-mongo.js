#!/usr/bin/env node
/**
 * Script kiểm tra MongoDB connection
 * Chạy: node backend/check-mongo.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const config = require('./config');

console.log('🔍 Đang kiểm tra MongoDB connection...\n');
console.log('📝 MONGO_URI:', config.MONGO_URI.replace(/\/\/.*@/, '//***@'));
console.log('');

const isLocal = config.MONGO_URI.includes('127.0.0.1') || config.MONGO_URI.includes('localhost');

if (isLocal) {
  console.log('📍 Bạn đang dùng MongoDB Local');
  console.log('');
  console.log('⚠️  Để kết nối được, bạn cần:');
  console.log('   1. Cài đặt MongoDB Community Server');
  console.log('   2. Chạy MongoDB trong terminal khác:');
  console.log('      mongod --dbpath C:\\data\\db');
  console.log('');
  console.log('   Hoặc chuyển sang MongoDB Atlas (miễn phí, không cần cài đặt)');
  console.log('');
} else {
  console.log('📍 Bạn đang dùng MongoDB Atlas');
  console.log('');
}

console.log('🔄 Đang thử kết nối...\n');

mongoose.connect(config.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ Kết nối MongoDB thành công!');
    console.log('');
    console.log('📊 Thông tin connection:');
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Database:', mongoose.connection.name);
    console.log('   - Ready State:', mongoose.connection.readyState);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Không thể kết nối MongoDB!');
    console.error('');
    console.error('📋 Chi tiết lỗi:', err.message);
    console.error('');
    
    if (isLocal) {
      console.error('💡 Giải pháp cho MongoDB Local:');
      console.error('   1. Kiểm tra MongoDB có đang chạy không:');
      console.error('      - Mở Services (Win + R → services.msc)');
      console.error('      - Tìm "MongoDB" service và Start nếu chưa chạy');
      console.error('');
      console.error('   2. Hoặc chạy MongoDB thủ công:');
      console.error('      - Tạo thư mục: New-Item -Path "C:\\data\\db" -ItemType Directory -Force');
      console.error('      - Chạy: mongod --dbpath C:\\data\\db');
      console.error('');
      console.error('   3. Hoặc chuyển sang MongoDB Atlas (dễ hơn):');
      console.error('      - Đăng ký: https://www.mongodb.com/cloud/atlas/register');
      console.error('      - Tạo cluster miễn phí');
      console.error('      - Lấy connection string và cập nhật MONGO_URI trong .env');
    } else {
      console.error('💡 Giải pháp cho MongoDB Atlas:');
      console.error('   1. Kiểm tra MONGO_URI trong file backend/.env có đúng không');
      console.error('   2. Kiểm tra username và password có đúng không');
      console.error('   3. Kiểm tra đã whitelist IP trong MongoDB Atlas chưa:');
      console.error('      - Vào Network Access → Add IP Address');
      console.error('      - Chọn "Allow Access from Anywhere" (0.0.0.0/0)');
      console.error('   4. Xem file backend/FIX_MONGO_URI.md để biết cách lấy connection string đúng');
    }
    
    console.error('');
    process.exit(1);
  });

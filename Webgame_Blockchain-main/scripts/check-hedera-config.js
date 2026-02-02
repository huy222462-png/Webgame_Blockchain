#!/usr/bin/env node
/**
 * Script kiểm tra cấu hình Hedera
 * Chạy: node scripts/check-hedera-config.js
 */

require('dotenv').config();
const path = require('path');

console.log('\n🔍 KIỂM TRA CẤU HÌNH HEDERA\n');
console.log('━'.repeat(60));

// Kiểm tra Root .env (cho Hardhat)
console.log('\n📁 File: .env (Root - for Hardhat)');
console.log('━'.repeat(60));

const rootConfig = {
  'PRIVATE_KEY': process.env.PRIVATE_KEY ? '✅ Đã set' : '❌ Chưa set',
  'HEDERA_NETWORK': process.env.HEDERA_NETWORK || '❌ Chưa set',
  'HEDERA_ACCOUNT_ID': process.env.HEDERA_ACCOUNT_ID ? '✅ Đã set' : '❌ Chưa set',
  'HEDERA_PRIVATE_KEY': process.env.HEDERA_PRIVATE_KEY ? '✅ Đã set' : '❌ Chưa set',
};

Object.entries(rootConfig).forEach(([key, value]) => {
  console.log(`${key.padEnd(30)}: ${value}`);
});

// Load backend .env
console.log('\n📁 File: backend/.env (for Backend Services)');
console.log('━'.repeat(60));

require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const backendConfig = {
  'BOMDOG_HEDERA_ACCOUNT_ID': process.env.BOMDOG_HEDERA_ACCOUNT_ID ? `✅ ${process.env.BOMDOG_HEDERA_ACCOUNT_ID}` : '❌ Chưa set',
  'BOMDOG_HEDERA_PRIVATE_KEY': process.env.BOMDOG_HEDERA_PRIVATE_KEY ? '✅ Đã set (hidden)' : '❌ Chưa set',
  'BOMDOG_HEDERA_TOKEN_ID': process.env.BOMDOG_HEDERA_TOKEN_ID ? `✅ ${process.env.BOMDOG_HEDERA_TOKEN_ID}` : '❌ Chưa set',
  'BOMDOG_HEDERA_NETWORK': process.env.BOMDOG_HEDERA_NETWORK || '❌ Chưa set (default: testnet)',
  'BOMDOG_COIN_DECIMALS': process.env.BOMDOG_COIN_DECIMALS || '2 (default)',
  'BOMDOG_COIN_SYMBOL': process.env.BOMDOG_COIN_SYMBOL || 'BOMDOG (default)',
};

Object.entries(backendConfig).forEach(([key, value]) => {
  console.log(`${key.padEnd(30)}: ${value}`);
});

// Kiểm tra logic tự động chọn network
console.log('\n🔀 CHỌN NETWORK TỰ ĐỘNG');
console.log('━'.repeat(60));

const useHedera = process.env.BOMDOG_HEDERA_ACCOUNT_ID && 
                  process.env.BOMDOG_HEDERA_TOKEN_ID;

if (useHedera) {
  console.log('✅ Hệ thống sẽ dùng: HEDERA NETWORK');
  console.log('   → Withdraw sẽ dùng Hedera Token Transfer');
  console.log('   → Phí giao dịch: ~$0.0001 USD');
} else {
  console.log('⚠️  Hệ thống sẽ dùng: ETHEREUM/EVM NETWORK (Fallback)');
  console.log('   → Withdraw sẽ dùng Ethereum Smart Contract');
  console.log('   → Phí giao dịch: ~$0.50-$5 USD');
}

// Kiểm tra Hardhat network config
console.log('\n⚙️  HARDHAT NETWORK CONFIG');
console.log('━'.repeat(60));

try {
  const hardhatConfig = require('../hardhat.config.js');
  const networks = Object.keys(hardhatConfig.networks || {});
  
  console.log('Available networks:', networks.join(', '));
  
  if (hardhatConfig.networks.hera) {
    console.log('\n✅ Hedera network "hera" đã được cấu hình:');
    console.log(`   URL: ${hardhatConfig.networks.hera.url}`);
    console.log(`   Chain ID: ${hardhatConfig.networks.hera.chainId}`);
    console.log(`   Deploy with: npm run deploy:all:hera`);
  } else {
    console.log('\n❌ Chưa có network "hera" trong hardhat.config.js');
  }
} catch (error) {
  console.log('⚠️  Không tìm thấy hardhat.config.js');
}

// Recommendations
console.log('\n💡 KHUYẾN NGHỊ');
console.log('━'.repeat(60));

if (!process.env.BOMDOG_HEDERA_ACCOUNT_ID) {
  console.log('❌ Bạn chưa cấu hình Hedera!');
  console.log('');
  console.log('📝 Các bước cần làm:');
  console.log('1. Đăng ký tài khoản: https://portal.hedera.com/');
  console.log('2. Claim HBAR testnet miễn phí');
  console.log('3. Tạo token: node scripts/create-hedera-token.js');
  console.log('4. Cập nhật backend/.env với BOMDOG_HEDERA_* variables');
  console.log('');
  console.log('📖 Xem hướng dẫn chi tiết:');
  console.log('   HUONG_DAN_CHUYEN_SANG_HEDERA.md');
} else if (!process.env.BOMDOG_HEDERA_TOKEN_ID) {
  console.log('⚠️  Đã có Account ID nhưng chưa tạo Token!');
  console.log('');
  console.log('📝 Chạy lệnh sau để tạo token:');
  console.log('   node scripts/create-hedera-token.js');
  console.log('');
  console.log('   Sau đó copy Token ID vào backend/.env');
} else {
  console.log('✅ Cấu hình Hedera đã đầy đủ!');
  console.log('');
  console.log('🚀 Các bước tiếp theo:');
  console.log('1. Deploy contracts: npm run deploy:all:hera');
  console.log('2. Khởi động backend: cd backend && npm start');
  console.log('3. Test withdraw để kiểm tra');
  console.log('');
  console.log('🔗 Kiểm tra giao dịch:');
  console.log(`   https://hashscan.io/testnet/token/${process.env.BOMDOG_HEDERA_TOKEN_ID}`);
}

console.log('\n' + '━'.repeat(60));
console.log('');

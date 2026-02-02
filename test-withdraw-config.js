const path = require('path');
const dotenv = require('dotenv');

// Load .env từ thư mục gốc
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('\n🔍 Kiểm tra cấu hình Withdraw Contract\n');
console.log('='.repeat(60));

const config = {
  'BOMDOG_RPC_URL': process.env.BOMDOG_RPC_URL,
  'BOMDOG_WITHDRAWER_KEY': process.env.BOMDOG_WITHDRAWER_KEY ? '***' + process.env.BOMDOG_WITHDRAWER_KEY.slice(-8) : undefined,
  'BOMDOG_CONTRACT_ADDRESS': process.env.BOMDOG_CONTRACT_ADDRESS,
  'BOMDOG_MIN_WITHDRAW': process.env.BOMDOG_MIN_WITHDRAW || '50',
  'BOMDOG_WITHDRAW_GAS_LIMIT': process.env.BOMDOG_WITHDRAW_GAS_LIMIT || '220000',
  'BOMDOG_COIN_DECIMALS': process.env.BOMDOG_COIN_DECIMALS || '18',
  'BOMDOG_WITHDRAW_METHOD': process.env.BOMDOG_WITHDRAW_METHOD || 'withdraw(address,uint256)'
};

let allConfigured = true;

for (const [key, value] of Object.entries(config)) {
  const status = value ? '✅' : '❌';
  const displayValue = value || '(không có)';
  console.log(`${status} ${key.padEnd(30)} = ${displayValue}`);
  
  if (!value && ['BOMDOG_RPC_URL', 'BOMDOG_WITHDRAWER_KEY', 'BOMDOG_CONTRACT_ADDRESS'].includes(key)) {
    allConfigured = false;
  }
}

console.log('='.repeat(60));

if (allConfigured) {
  console.log('\n✅ Cấu hình withdraw đã đầy đủ!');
  console.log('   Admin có thể duyệt yêu cầu rút tiền.');
} else {
  console.log('\n❌ Cấu hình CHƯA đầy đủ!');
  console.log('   Cần cập nhật các biến còn thiếu trong file .env');
  console.log('\n📝 Hướng dẫn:');
  if (!process.env.BOMDOG_CONTRACT_ADDRESS) {
    console.log('   1. Deploy contract: npx hardhat run scripts/deploy-bomdog-simple.js --network sepolia');
    console.log('   2. Copy địa chỉ contract');
    console.log('   3. Cập nhật BOMDOG_CONTRACT_ADDRESS trong .env');
  }
  if (!process.env.BOMDOG_RPC_URL) {
    console.log('   - Thêm BOMDOG_RPC_URL (VD: https://ethereum-sepolia-rpc.publicnode.com)');
  }
  if (!process.env.BOMDOG_WITHDRAWER_KEY) {
    console.log('   - Thêm BOMDOG_WITHDRAWER_KEY (private key của account có ETH)');
  }
}

console.log('\n');

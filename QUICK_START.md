# Quick Start Guide - Blockchain Gaming Platform

## 🚀 Cách chạy nhanh nhất

### Bước 1: Cài đặt
```bash
npm install
cd frontend && npm install && cd ..
```

### Bước 2: Setup MongoDB
```bash
# Đảm bảo MongoDB đang chạy
mongod
```

### Bước 3: Cấu hình
```bash
# Tạo file .env
cp .env.example .env

# Sửa .env với thông tin của bạn (ít nhất MONGO_URI)
```

### Bước 4: Deploy Smart Contracts (Local)
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

Sau khi deploy, copy contract addresses vào `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_TAIXIU_CONTRACT=<TaiXiuGame-address>
VITE_FISHING_CONTRACT=<FishingGame-address>
```

### Bước 5: Run Application
```bash
# Terminal 3: Backend
npm run dev

# Terminal 4: Frontend
npm run frontend
```

### Bước 6: Setup MetaMask
1. Install MetaMask extension
2. Add Network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency: ETH

3. Import test account (từ hardhat node output):
   - Copy private key của Account #0
   - Import vào MetaMask

### Bước 7: Play! 🎮
- Truy cập: http://localhost:5173
- Connect MetaMask
- Chọn game và bắt đầu chơi!

## 📋 Scripts hữu ích

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Check coverage
npm run coverage
```

## ⚠️ Lỗi thường gặp

**"Insufficient funds"**
- Dùng test account từ hardhat node có 10000 ETH

**"Cannot connect to MetaMask"**
- Kiểm tra network = Hardhat Local (Chain ID 1337)
- Refresh page sau khi đổi network

**"Contract not deployed"**
- Chạy lại `npx hardhat run scripts/deploy.js --network localhost`
- Update contract addresses trong frontend/.env

**"MongoDB connection error"**
- Start MongoDB: `mongod`
- Kiểm tra MONGO_URI trong .env

## 🎯 Testnet Deployment

### Lấy Testnet ETH
1. Sepolia Faucet: https://sepoliafaucet.com/
2. Nhập wallet address
3. Đợi vài phút

### Deploy
```bash
# Update .env với:
# - PRIVATE_KEY (wallet có testnet ETH)
# - SEPOLIA_RPC_URL (từ Alchemy/Infura)

npm run deploy:sepolia
```

Xong! 🎉

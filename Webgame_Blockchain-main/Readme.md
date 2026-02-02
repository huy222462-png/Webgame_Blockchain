# 🎮 Blockchain Gaming Platform

**Full-stack blockchain gaming platform** với **Tài Xỉu** và **Câu Cá** games + **Hardhat Tutorial Integration**

**🔷 NEW: Hỗ trợ Hedera Network** - Phí rẻ hơn 1000x so với Ethereum!  
**🔄 NEW: Multi-Chain Withdrawal** - Withdraw cross-chain ETH ↔ HBAR!

---

## 🌟 Features

✅ Hỗ trợ **cả Ethereum và Hedera**  
✅ Tự động chuyển đổi blockchain theo config  
✅ **Multi-chain withdrawal** - Withdraw cross-chain!  
✅ Phí giao dịch siêu rẻ với Hedera ($0.0001)  
✅ Tốc độ nhanh (3-5 giây finality)  
✅ Gaming economy hoàn chỉnh  
✅ Admin approval system

---

## 📚 Tài Liệu Hướng Dẫn

### 🔷 **Migration ETH → HBAR (MỚI!)**

**📚 [INDEX.md](INDEX.md) - Chọn tài liệu phù hợp với vai trò của bạn**

**🔄 Multi-Chain Withdrawal:**
- **[MULTI_CHAIN_WITHDRAWAL.md](MULTI_CHAIN_WITHDRAWAL.md)** 🔄 API docs - Withdraw cross-chain
- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** 📝 Tóm tắt thay đổi

**Quick Links:**
1. **[CHEAT_SHEET.md](CHEAT_SHEET.md)** ⚡ 2 phút - Commands nhanh
2. **[QUICK_START_HEDERA.md](QUICK_START_HEDERA.md)** 🚀 7 phút - Setup nhanh
3. **[TODO_MIGRATION.md](TODO_MIGRATION.md)** ✅ 10 phút - Checklist chi tiết
4. **[HUONG_DAN_CHUYEN_SANG_HEDERA.md](HUONG_DAN_CHUYEN_SANG_HEDERA.md)** 📖 30 phút - Hướng dẫn đầy đủ
5. **[SO_SANH_ETH_VS_HEDERA.md](SO_SANH_ETH_VS_HEDERA.md)** 📊 15 phút - So sánh kỹ thuật
6. **[DECISION_GUIDE.md](DECISION_GUIDE.md)** 🎯 20 phút - Business guide
7. **[MIGRATION_ETH_TO_HBAR.md](MIGRATION_ETH_TO_HBAR.md)** 🗺️ 10 phút - Tổng quan
8. **[SUMMARY.md](SUMMARY.md)** 📝 5 phút - Đã làm gì?

**🎯 Bắt đầu nhanh:**
- Developer: [QUICK_START_HEDERA.md](QUICK_START_HEDERA.md)
- Tech Lead: [SO_SANH_ETH_VS_HEDERA.md](SO_SANH_ETH_VS_HEDERA.md)
- Decision Maker: [DECISION_GUIDE.md](DECISION_GUIDE.md)

---

### 📖 **Hướng Dẫn Gốc (MongoDB, Backend, Frontend)**

**⭐ ĐỌC NGAY:** [Huong-Dan/README.md](Huong-Dan/README.md)

1. **[00-FIX-MONGODB.md](Huong-Dan/00-FIX-MONGODB.md)** - Fix lỗi MongoDB
2. **[01-BAT-DAU-O-DAY.md](Huong-Dan/01-BAT-DAU-O-DAY.md)** - Tóm tắt nhanh 30 phút
3. **[02-HUONG-DAN-DEPLOY.md](Huong-Dan/02-HUONG-DAN-DEPLOY.md)** - Deploy chi tiết
4. **[03-HUONG-DAN-DEMO.md](Huong-Dan/03-HUONG-DAN-DEMO.md)** - Demo cho thầy
5. **[04-TICH-HOP-TUTORIAL.md](Huong-Dan/04-TICH-HOP-TUTORIAL.md)** - Tích hợp tutorial
6. **[05-TAI-LIEU-DAY-DU.md](Huong-Dan/05-TAI-LIEU-DAY-DU.md)** - Tài liệu đầy đủ

---

## 🚀 Quick Start (5 phút)

```powershell
# 1. Fix MongoDB path
$env:PATH += ";C:\Program Files\MongoDB\Server\8.2\bin"

# 2. Tạo thư mục data
New-Item -Path "C:\data\db" -ItemType Directory -Force

# 3. Terminal 1: Start MongoDB
mongod --dbpath "C:\data\db"

# 4. Terminal 2: Start Backend
npm run dev

# 5. Terminal 3: Start Frontend  
cd frontend && npm run dev
```

**Mở browser:** http://localhost:5173

---

## 📦 Cài Đặt

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Compile contracts
npm run compile

# Run tests
npm run test
```

---

## 🎯 Deploy

```bash
# Deploy lên Hera testnet (chain-296)
npm run deploy:all:hera

# Verify deployment
npm run verify:deployment

# Copy env file
copy frontend\.env.deployment frontend\.env
```

Chi tiết: [02-HUONG-DAN-DEPLOY.md](Huong-Dan/02-HUONG-DAN-DEPLOY.md)

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + Ethers.js v6
- **Backend:** Node.js + Express + MongoDB
- **Blockchain:** Solidity 0.8.20 + Hardhat 3.1 + OpenZeppelin
- **Smart Contracts:**
  - TaiXiuGame.sol - Dice betting game
  - FishingGame.sol - Fishing game with jackpot
  - Counter.sol - Tutorial contract
  - MyToken.sol - ERC20 token (HBAR)

---

## 📂 Cấu Trúc

```
Blockchain/
├── Huong-Dan/              # 📚 Tất cả hướng dẫn ở đây!
│   ├── README.md           # Mục lục hướng dẫn
│   ├── 00-FIX-MONGODB.md
│   ├── 01-BAT-DAU-O-DAY.md ⭐
│   ├── 02-HUONG-DAN-DEPLOY.md
│   ├── 03-HUONG-DAN-DEMO.md
│   ├── 04-TICH-HOP-TUTORIAL.md
│   └── 05-TAI-LIEU-DAY-DU.md
│
├── contracts/              # Smart contracts
│   ├── TaiXiuGame.sol
│   └── FishingGame.sol
│
├── backend/                # Express API
│   ├── server.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── hardhat-tutorial/   # Tutorial contracts
│       ├── contracts/
│       │   ├── Counter.sol
│       │   └── MyToken.sol
│       └── ignition/
│
├── frontend/               # React app
│   └── src/
│       ├── App.jsx
│       ├── TaiXiuGame.jsx
│       ├── FishingGame.jsx
│       └── TutorialIntegration.jsx
│
├── scripts/                # Deploy scripts
│   ├── deploy.js
│   ├── deploy-all.js      # Deploy tất cả
│   └── verify-deployment.js
│
└── test/                   # Contract tests
```

---

## 🎮 Features

### Gaming Platform
- ✅ Tài Xỉu (Dice betting)
- ✅ Fishing Game với jackpot
- ✅ Leaderboard on-chain
- ✅ Transaction history
- ✅ MetaMask integration

### Tutorial Integration
- ✅ Counter contract interaction
- ✅ ERC20 token display
- ✅ Real-time updates
- ✅ Event listening

---

## 🔧 Scripts

```bash
# Development
npm run dev              # Start backend
npm run frontend         # Start frontend
npm run compile          # Compile contracts

# Deploy
npm run deploy:all       # Deploy to default network
npm run deploy:all:hera  # Deploy to Hera testnet
npm run verify:deployment # Verify contracts

# Testing
npm run test             # Run contract tests
npm run coverage         # Test coverage

# Blockchain
npm run node             # Start local Hardhat node
```

---

## 🌐 Network Info

**Hera Testnet (Chain-296)**
- RPC URL: https://testnet.hashio.io/api
- Chain ID: 296
- Explorer: https://testnet.hashio.io

---

## 📝 Environment Variables

### Root `.env`
```env
PRIVATE_KEY=0x...
MONGO_URI=mongodb://localhost:27017/blockchain-game
JWT_SECRET=your-secret
```

### Frontend `.env`
```env
VITE_TAIXIU_CONTRACT=0x...
VITE_FISHING_CONTRACT=0x...
VITE_COUNTER_CONTRACT=0x...
VITE_MYTOKEN_CONTRACT=0x73C6C18b1EDEB8319cA52f02f948c35FA8177401
VITE_CHAIN_ID=296
VITE_NETWORK_NAME=Hera Testnet
VITE_RPC_URL=https://testnet.hashio.io/api
VITE_API_URL=http://localhost:5000
```

---

## 🐛 Troubleshooting

### MongoDB không chạy?
👉 Đọc [00-FIX-MONGODB.md](Huong-Dan/00-FIX-MONGODB.md)

### Deployment fail?
👉 Đọc [02-HUONG-DAN-DEPLOY.md](Huong-Dan/02-HUONG-DAN-DEPLOY.md) - Troubleshooting section

### MetaMask không connect?
👉 Đọc [03-HUONG-DAN-DEMO.md](Huong-Dan/03-HUONG-DAN-DEMO.md) - Troubleshooting section

---

## 📖 Documentation

- **Full docs:** [README_FULL.md](README_FULL.md)
- **Deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **All tutorials:** [Huong-Dan/](Huong-Dan/)

---

## 🎓 Demo

Xem hướng dẫn demo chi tiết: [03-HUONG-DAN-DEMO.md](Huong-Dan/03-HUONG-DAN-DEMO.md)

**Timeline 15 phút:**
1. Giới thiệu (2 phút)
2. Demo Gaming (5 phút)
3. Demo Tutorial (3 phút)
4. Show code (3 phút)
5. Q&A (2 phút)

---

## ✅ Checklist

### Trước khi demo:
- [ ] MongoDB running
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] Contracts deployed
- [ ] MetaMask connected
- [ ] Test 1 transaction

### Contracts deployed:
- [ ] TaiXiuGame
- [ ] FishingGame
- [ ] Counter
- [ ] MyToken ✅ (0x73C6...7401)

---

## 📜 License

ISC

---

## 👤 Author

Nam4 - Blockchain Gaming Platform

---

## 🎉 Getting Started

**Bước 1:** Đọc [Huong-Dan/01-BAT-DAU-O-DAY.md](Huong-Dan/01-BAT-DAU-O-DAY.md)

**Bước 2:** Làm theo hướng dẫn

**Bước 3:** Demo thành công! 🚀

---

**📚 Tất cả hướng dẫn chi tiết trong folder [Huong-Dan/](Huong-Dan/)**

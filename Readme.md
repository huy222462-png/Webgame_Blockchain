# 🎮 Blockchain Gaming Platform

Nền tảng game blockchain với **Tài Xỉu (Over/Under)** và **Câu Cá (Fishing)**, được xây dựng trên Ethereum smart contracts.

## ✨ Đã hoàn thiện

✅ Smart Contracts (TaiXiuGame.sol, FishingGame.sol)  
✅ Backend API đầy đủ (Express + MongoDB)  
✅ Frontend tích hợp blockchain (React + Ethers.js)  
✅ Deployment scripts và testing  
✅ Documentation chi tiết  

## 🚀 Quick Start

### 1. Cài đặt dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Chạy MongoDB
```bash
mongod
```

### 3. Cấu hình environment
```bash
cp .env.example .env
# Sửa .env với MongoDB URI và các config khác
```

### 4. Deploy Smart Contracts (Local)
```bash
# Terminal 1: Start Hardhat network
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Copy contract addresses và update vào frontend/.env
```

### 5. Chạy ứng dụng
```bash
# Terminal 3: Backend
npm run dev

# Terminal 4: Frontend
cd frontend && npm run dev
```

### 6. Setup MetaMask
- Add network: Hardhat Local (http://127.0.0.1:8545, Chain ID: 1337)
- Import test account từ hardhat node

### 7. Truy cập & Chơi
http://localhost:5173 🎉

## 📚 Documentation đầy đủ

- **[README_FULL.md](./README_FULL.md)** - Documentation chi tiết với API, contracts, security
- **[QUICK_START.md](./QUICK_START.md)** - Hướng dẫn setup nhanh nhất
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Hướng dẫn deploy lên production
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Tổng quan toàn bộ project

## 🎮 Games

### Tài Xỉu (Over/Under)
- Đặt cược Tài (11-18) hoặc Xỉu (3-10)
- Min: 0.001 ETH, Max: 1 ETH
- House edge: 2%
- Kết quả từ 3 xúc xắc on-chain

### Fishing (Câu Cá)
- Entry fee: 0.001 ETH/session
- 5 loại cá: Small, Medium, Large, Rare, Jackpot
- Jackpot pool system
- Leaderboard rankings

## 🛠 Tech Stack

- **Blockchain**: Ethereum, Solidity 0.8.20, Hardhat
- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: React 18, Vite, Ethers.js v5
- **Security**: OpenZeppelin, ReentrancyGuard

## 📋 NPM Scripts

```bash
npm run dev              # Start backend server
npm run frontend         # Start frontend app
npm run compile          # Compile smart contracts
npm run test             # Run contract tests
npm run node             # Start Hardhat local node
npm run deploy:local     # Deploy to local network
npm run deploy:sepolia   # Deploy to Sepolia testnet
npm run coverage         # Test coverage report
```

## 🔗 API Endpoints

```
# Games
GET    /api/games/history/:address
POST   /api/games/result
GET    /api/games/stats/:gameType

# Leaderboard
GET    /api/leaderboard/top
GET    /api/leaderboard/player/:address

# Transactions
GET    /api/transactions/player/:address
POST   /api/transactions

# Authentication
POST   /api/auth/register
POST   /api/auth/login

# Avatar
POST   /api/avatar/:address
```

## 🔒 Security

✅ Implemented:
- ReentrancyGuard protection
- Ownable access control
- Input validation
- Event logging

⚠️ Production TODO:
- Chainlink VRF for true randomness
- Professional security audit
- Multi-sig wallet
- Rate limiting
- JWT authentication

## 🌐 Supported Networks

| Network | Chain ID | Usage |
|---------|----------|-------|
| Hardhat Local | 1337 | Development |
| Sepolia | 11155111 | Testing |
| Mainnet | 1 | Production |

## 📂 Project Structure

```
Blockchain/
├── contracts/              # Smart contracts
├── scripts/                # Deployment scripts
├── test/                   # Contract tests
├── backend/                # Express server
│   ├── controllers/        # API controllers
│   ├── models/            # Database models
│   └── routes/            # API routes
├── frontend/               # React app
│   └── src/
│       ├── utils/         # Blockchain helpers
│       └── components/    # React components
└── docs/                   # Documentation
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# With gas reporting
REPORT_GAS=true npm run test

# Coverage
npm run coverage
```

## 🚢 Deployment

### Testnet (Sepolia)
```bash
# Get testnet ETH from faucet
# Update .env with SEPOLIA_RPC_URL and PRIVATE_KEY
npm run deploy:sepolia
```

### Production
Xem [DEPLOYMENT.md](./DEPLOYMENT.md) để có hướng dẫn chi tiết.

## ⚠️ Important Notes

1. **NEVER commit .env file** - Contains sensitive data
2. **Test on testnet first** before mainnet deployment  
3. **Backup database regularly**
4. **Monitor gas costs** for all transactions
5. **Get security audit** before production

## 📞 Resources

- Hardhat: https://hardhat.org/
- OpenZeppelin: https://docs.openzeppelin.com/
- Ethers.js: https://docs.ethers.org/
- React: https://react.dev/

## 📄 License

MIT License

---

**⚠️ Disclaimer**: Educational project. DO NOT use in production without proper security audit. Gambling may be illegal in some jurisdictions.

**Made with ❤️ using Blockchain Technology**
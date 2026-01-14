# 🎮 Blockchain Gaming Platform

Platform game blockchain với 2 game chính: **Tài Xỉu (Over/Under)** và **Câu Cá (Fishing)**, được xây dựng trên Ethereum smart contracts với full-stack web application.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc project](#cấu-trúc-project)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy project](#chạy-project)
- [Deploy Smart Contracts](#deploy-smart-contracts)
- [Chức năng](#chức-năng)
- [API Endpoints](#api-endpoints)
- [Smart Contracts](#smart-contracts)
- [Bảo mật](#bảo-mật)
- [Testing](#testing)

## 🎯 Tổng quan

Platform này kết hợp công nghệ blockchain với game truyền thống, cho phép người chơi:
- Đặt cược với cryptocurrency (ETH)
- Tất cả giao dịch được ghi lại on-chain (transparent & immutable)
- Tự động phân phối thắng qua smart contracts
- Xem lịch sử game và leaderboard
- Quản lý ví MetaMask

## 🛠 Công nghệ sử dụng

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Ethers.js v5** - Blockchain interaction
- **MetaMask** - Web3 wallet integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Multer** - File upload handling

### Blockchain
- **Solidity ^0.8.20** - Smart contract language
- **Hardhat** - Development framework
- **OpenZeppelin** - Secure contract libraries
- **Ethereum** - Blockchain platform

## 📁 Cấu trúc project

```
Blockchain/
├── backend/                    # Backend server
│   ├── config/                 # Configuration files
│   │   └── index.js           # Config exports
│   ├── controllers/            # Request handlers
│   │   ├── gameController.js       # Game logic
│   │   ├── leaderboardController.js # Leaderboard
│   │   └── transactionController.js # Transaction tracking
│   ├── models/                 # Database schemas
│   │   ├── User.js            # User model
│   │   ├── GameHistory.js     # Game records
│   │   ├── Leaderboard.js     # Player rankings
│   │   └── Transaction.js     # Blockchain txs
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js      # Authentication
│   │   ├── userRoutes.js      # User management
│   │   ├── avatarRoutes.js    # Avatar upload
│   │   ├── gameRoutes.js      # Game APIs
│   │   ├── leaderboardRoutes.js # Rankings
│   │   └── transactionRoutes.js # Transaction APIs
│   ├── uploads/                # User avatars
│   └── server.js              # Entry point
│
├── contracts/                  # Smart contracts
│   ├── TaiXiuGame.sol         # Tài Xỉu contract
│   └── FishingGame.sol        # Fishing contract
│
├── scripts/                    # Deployment scripts
│   └── deploy.js              # Deploy contracts
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── utils/             # Utilities
│   │   │   └── blockchain.js  # Web3 helpers
│   │   ├── App.jsx            # Main app
│   │   ├── TaiXiuGame.jsx     # Tài Xỉu game UI
│   │   ├── FishingGame.jsx    # Fishing game UI
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   └── package.json
│
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Root dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

## 📦 Cài đặt

### 1. Cài đặt dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd Blockchain

# Cài đặt root dependencies
npm install

# Cài đặt frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Cài đặt MongoDB

**Windows:**
- Download MongoDB Community Server: https://www.mongodb.com/try/download/community
- Cài đặt và chạy MongoDB service

**Linux/Mac:**
```bash
# Ubuntu
sudo apt-get install mongodb

# Mac
brew install mongodb-community
brew services start mongodb-community
```

### 3. Cài đặt MetaMask

- Cài đặt MetaMask extension: https://metamask.io/download/
- Tạo wallet mới hoặc import existing wallet
- Lưu lại seed phrase an toàn

## ⚙️ Cấu hình

### 1. Tạo file .env

```bash
cp .env.example .env
```

### 2. Cấu hình .env file

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/blockchain-game

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (đổi thành key mạnh hơn)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Blockchain Configuration
# ⚠️ KHÔNG BAO GIỜ commit private key thật vào git!
PRIVATE_KEY=your-private-key-here

# RPC URLs (lấy từ Alchemy, Infura, hoặc provider khác)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY

# Etherscan API (để verify contracts)
ETHERSCAN_API_KEY=your-etherscan-api-key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Cấu hình frontend .env

Tạo file `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_TAIXIU_CONTRACT=<địa-chỉ-contract-sau-khi-deploy>
VITE_FISHING_CONTRACT=<địa-chỉ-contract-sau-khi-deploy>
```

## 🚀 Chạy project

### Development Mode

**Terminal 1 - MongoDB:**
```bash
# Đảm bảo MongoDB đang chạy
mongod
```

**Terminal 2 - Backend:**
```bash
# Từ root directory
npm run dev
# hoặc
node backend/server.js
```

Backend sẽ chạy tại: `http://localhost:5000`

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

**Terminal 4 - Local Blockchain (Optional):**
```bash
# Chạy Hardhat local node
npx hardhat node
```

Local blockchain sẽ chạy tại: `http://127.0.0.1:8545`

## 🔗 Deploy Smart Contracts

### 1. Compile Contracts

```bash
npx hardhat compile
```

### 2. Deploy to Local Network

```bash
# Đảm bảo hardhat node đang chạy (terminal 4)
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Deploy to Testnet (Sepolia)

```bash
# Cần có ETH testnet trong wallet
# Lấy free testnet ETH tại: https://sepoliafaucet.com/
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Sau khi deploy

- Contract addresses sẽ được lưu trong `deployments/`
- Copy addresses vào `frontend/.env`:
  ```env
  VITE_TAIXIU_CONTRACT=0x... 
  VITE_FISHING_CONTRACT=0x...
  ```

### 5. Verify Contracts (Optional)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🎮 Chức năng

### 1. **Tài Xỉu Game (Over/Under)**

#### Gameplay:
- Người chơi đặt cược vào **Tài** (11-18) hoặc **Xỉu** (3-10)
- Minimum bet: 0.001 ETH, Maximum: 1 ETH
- Admin lắc 3 xúc xắc
- Kết quả tính tổng điểm 3 xúc xắc
- Người thắng nhận lại tiền cược + phần chia từ tiền thua
- House edge: 2%

#### Features:
- Realtime betting pool display
- Game history với kết quả on-chain
- Automatic payout distribution
- Withdrawal function cho winnings

#### Smart Contract Functions:
```solidity
placeBet(BetType _betType) payable  // Đặt cược
rollDice()                           // Lắc xúc xắc (owner only)
withdraw()                           // Rút tiền thắng
getCurrentGame()                     // Lấy info game hiện tại
getPlayerBalance(address)            // Xem số dư
```

### 2. **Fishing Game (Câu Cá)**

#### Gameplay:
- Entry fee: 0.001 ETH/session
- Click để câu cá
- 5 loại cá với reward khác nhau:
  - **Small Fish** (60%) - 0.00025 ETH
  - **Medium Fish** (30%) - 0.0005 ETH
  - **Large Fish** (9%) - 0.001 ETH
  - **Rare Fish** (0.9%) - 0.005 ETH
  - **Jackpot** (0.1%) - 50% jackpot pool

#### Features:
- Session-based gameplay
- Jackpot pool system
- Leaderboard rankings
- Catch history tracking
- Claim rewards anytime

#### Smart Contract Functions:
```solidity
startSession() payable      // Bắt đầu session (0.001 ETH)
catchFish()                 // Câu cá
endSession()                // Kết thúc session
claimRewards()              // Rút rewards
getActiveSession(address)   // Xem session hiện tại
getLeaderboard()            // Top 10 players
```

### 3. **User Management**

- **Web3 Authentication**: Connect wallet để login
- **Profile System**: Avatar upload, display name
- **LocalStorage**: Profile data per wallet address
- **Backend Sync**: Optional server upload cho multi-device

### 4. **Leaderboard & Statistics**

- Top 100 players by total winnings
- Player statistics:
  - Total games played
  - Win/Loss ratio
  - Total wagered
  - Total won
  - Current rank
- Game-specific stats

## 🔌 API Endpoints

### Authentication & Users

```
POST   /api/auth/register       - Đăng ký user
POST   /api/auth/login          - Login
GET    /api/users/:id           - Get user info
PUT    /api/users/:id           - Update user
```

### Avatar Management

```
POST   /api/avatar/:address     - Upload avatar
GET    /uploads/:filename       - Get avatar file
```

### Game Management

```
GET    /api/games/history/:address        - Lịch sử game của player
POST   /api/games/result                  - Lưu kết quả game
GET    /api/games/stats/:gameType         - Thống kê game
```

### Leaderboard

```
GET    /api/leaderboard/top                   - Top players
GET    /api/leaderboard/player/:address       - Player rank
PUT    /api/leaderboard/player/:address/name  - Update name
```

### Transactions

```
GET    /api/transactions/player/:address  - Player transactions
POST   /api/transactions                  - Save transaction
GET    /api/transactions/:txHash          - Get transaction
PUT    /api/transactions/:txHash          - Update status
```

## 📜 Smart Contracts

### TaiXiuGame.sol

**Core Features:**
- Betting system (Tai/Xiu)
- Dice rolling with pseudo-random
- Automatic win distribution
- House edge calculation
- Player balance tracking

**Security:**
- ReentrancyGuard protection
- Ownable access control
- Safe ETH transfers

**Events:**
```solidity
event GameCreated(uint256 indexed gameId, uint256 timestamp)
event BetPlaced(uint256 indexed gameId, address indexed player, uint256 amount, uint8 betType)
event GameResolved(uint256 indexed gameId, uint256 dice1, uint256 dice2, uint256 dice3, uint256 total, bool isTai)
event WinningsPaid(address indexed player, uint256 amount)
```

### FishingGame.sol

**Core Features:**
- Session management
- Random fish catching
- Jackpot pool system
- Leaderboard integration
- Rewards claiming

**Fish Types & Probabilities:**
- Small: 60% chance
- Medium: 30% chance
- Large: 9% chance
- Rare: 0.9% chance
- Jackpot: 0.1% chance

**Security:**
- ReentrancyGuard protection
- Ownable access control
- Balance validation

**Events:**
```solidity
event SessionStarted(address indexed player, uint256 sessionId, uint256 timestamp)
event FishCaught(address indexed player, uint8 fishType, uint256 reward)
event SessionEnded(address indexed player, uint256 fishCaught, uint256 totalEarned)
event JackpotWon(address indexed player, uint256 amount)
```

## 🔒 Bảo mật

### Smart Contract Security

✅ **Implemented:**
- ReentrancyGuard cho tất cả payable functions
- Ownable access control
- Input validation
- Safe math operations (Solidity 0.8+)
- Event logging

⚠️ **Production Recommendations:**
- **Chainlink VRF** cho true random numbers (thay pseudo-random)
- Professional audit trước mainnet deployment
- Multi-sig wallet cho owner functions
- Emergency pause mechanism
- Rate limiting

### Backend Security

✅ **Implemented:**
- CORS configuration
- Body parsing limits
- MongoDB injection prevention (Mongoose)
- File upload validation

🚀 **Nên thêm:**
- JWT authentication cho API
- Rate limiting middleware
- Input sanitization
- SQL injection prevention
- API key authentication

### Frontend Security

✅ **Implemented:**
- MetaMask signature verification
- Transaction confirmation UI
- Gas estimation display

🚀 **Nên thêm:**
- Content Security Policy (CSP)
- XSS protection
- HTTPS only
- Secure session management

## 🧪 Testing

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
# Chạy tất cả tests
npx hardhat test

# Test specific file
npx hardhat test test/TaiXiuGame.test.js

# With gas reporting
REPORT_GAS=true npx hardhat test
```

### Code Coverage

```bash
npx hardhat coverage
```

### Local Testing Workflow

1. Start local node: `npx hardhat node`
2. Deploy contracts: `npx hardhat run scripts/deploy.js --network localhost`
3. Update frontend `.env` với contract addresses
4. Start backend: `npm run dev`
5. Start frontend: `cd frontend && npm run dev`
6. Import local hardhat account vào MetaMask
7. Test gameplay trong browser

## 📊 Database Schema

### User
```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  timestamps: true
}
```

### GameHistory
```javascript
{
  gameType: 'taixiu' | 'fishing',
  gameId: Number,
  playerAddress: String,
  betAmount: String,
  winAmount: String,
  result: 'win' | 'lose' | 'pending',
  txHash: String (unique),
  blockNumber: Number,
  metadata: Mixed,
  timestamps: true
}
```

### Leaderboard
```javascript
{
  playerAddress: String (unique),
  playerName: String,
  totalGames: Number,
  totalWins: Number,
  totalLosses: Number,
  totalWagered: String,
  totalWon: String,
  winRate: Number,
  rank: Number,
  lastPlayed: Date,
  timestamps: true
}
```

### Transaction
```javascript
{
  txHash: String (unique),
  fromAddress: String,
  toAddress: String,
  value: String,
  gasUsed: String,
  gasPrice: String,
  blockNumber: Number,
  status: 'pending' | 'confirmed' | 'failed',
  type: 'bet' | 'withdraw' | 'claim' | 'session',
  gameType: 'taixiu' | 'fishing',
  timestamps: true
}
```

## 🌐 Networks

### Supported Networks

| Network | Chain ID | RPC URL | Faucet |
|---------|----------|---------|--------|
| Hardhat Local | 1337 | http://127.0.0.1:8545 | Auto-funded |
| Sepolia Testnet | 11155111 | Alchemy/Infura | https://sepoliafaucet.com/ |
| Mumbai Testnet | 80001 | Alchemy/Infura | https://faucet.polygon.technology/ |

### Add Network to MetaMask

**Hardhat Local:**
- Network Name: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 1337
- Currency Symbol: ETH

**Sepolia:**
- Network Name: Sepolia Testnet
- RPC URL: https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY
- Chain ID: 11155111
- Currency Symbol: ETH
- Block Explorer: https://sepolia.etherscan.io

## 📝 Development Checklist

### Before Production

- [ ] Audit smart contracts
- [ ] Replace pseudo-random với Chainlink VRF
- [ ] Add comprehensive unit tests (>80% coverage)
- [ ] Implement JWT authentication
- [ ] Add rate limiting
- [ ] Setup monitoring (Sentry, LogRocket)
- [ ] Configure production environment variables
- [ ] Setup CI/CD pipeline
- [ ] Create backup strategy
- [ ] Document emergency procedures
- [ ] Implement multi-sig wallet
- [ ] Add emergency pause mechanism
- [ ] Setup mainnet deployment process

### Deployment

- [ ] Deploy to testnet và test kỹ
- [ ] Get professional audit
- [ ] Fix audit findings
- [ ] Deploy to mainnet
- [ ] Verify contracts on Etherscan
- [ ] Update frontend contract addresses
- [ ] Test live dApp thoroughly
- [ ] Monitor for issues

## 🤝 Contributing

1. Fork project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### MetaMask không connect được

- Kiểm tra network đúng chưa (localhost:8545 hoặc Sepolia)
- Clear cache và refresh page
- Restart MetaMask extension

### Transaction failed

- Kiểm tra đủ ETH để trả gas fees chưa
- Kiểm tra contract đã deploy đúng network chưa
- Xem lỗi chi tiết trong MetaMask

### Backend không connect MongoDB

- Kiểm tra MongoDB service đang chạy
- Kiểm tra MONGO_URI trong .env file
- Kiểm tra firewall settings

### Contract deploy failed

- Kiểm tra đủ ETH trong deployer wallet
- Kiểm tra RPC URL đúng
- Kiểm tra private key format

## 📞 Support

- GitHub Issues: [Link to issues]
- Email: your-email@example.com
- Discord: [Link to Discord]

---

**⚠️ Disclaimer:** Đây là educational project. Không sử dụng trong production mà không audit kỹ. Gambling có thể vi phạm pháp luật ở một số quốc gia.

**Made with ❤️ using Blockchain Technology**

# 1. Install
npm install
cd frontend && npm install

# 2. Setup MongoDB & .env
mongod
cp .env.example .env

# 3. Deploy contracts
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# 4. Update frontend/.env với contract addresses

# 5. Run
npm run dev        # Backend
npm run frontend   # Frontend
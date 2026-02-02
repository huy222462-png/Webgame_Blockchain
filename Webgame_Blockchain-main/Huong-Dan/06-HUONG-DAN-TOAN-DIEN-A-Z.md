# 🚀 HƯỚNG DẪN TOÀN DIỆN TẠO DỰ ÁN BLOCKCHAIN TỪ A-Z

**Dự án:** Blockchain Gaming Platform với Tài Xỉu, Câu Cá + Hardhat Tutorial Integration

**Thời gian hoàn thành:** 2-3 giờ (cho người mới) | 1 giờ (có kinh nghiệm)

---

## 📚 MỤC LỤC

1. [Giới thiệu & Chuẩn bị](#1-giới-thiệu--chuẩn-bị)
2. [Cài đặt môi trường phát triển](#2-cài-đặt-môi-trường-phát-triển)
3. [Khởi tạo dự án](#3-khởi-tạo-dự-án)
4. [Xây dựng Smart Contracts](#4-xây-dựng-smart-contracts)
5. [Setup Backend API](#5-setup-backend-api)
6. [Xây dựng Frontend](#6-xây-dựng-frontend)
7. [Tích hợp Blockchain vào Frontend](#7-tích-hợp-blockchain-vào-frontend)
8. [Deploy lên Testnet](#8-deploy-lên-testnet)
9. [Testing & Debugging](#9-testing--debugging)
10. [Deploy Production](#10-deploy-production)

---

## 1. GIỚI THIỆU & CHUẨN BỊ

### 1.1. Tổng quan dự án

**Mục tiêu:** Xây dựng nền tảng game blockchain full-stack với:
- 🎲 **Tài Xỉu Game:** Đặt cược trên kết quả xúc xắc
- 🎣 **Fishing Game:** Câu cá với các độ hiếm khác nhau
- 📚 **Tutorial Integration:** Counter & MyToken contracts
- 💰 **Blockchain:** Smart contracts trên Ethereum/Hedera
- 🌐 **Full-stack:** React + Express + MongoDB

**Kiến trúc:**
```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  - UI/UX                                            │
│  - MetaMask Integration                             │
│  - Ethers.js                                        │
└───────────────┬─────────────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌──────────────┐  ┌──────────────────────┐
│   Backend    │  │  Smart Contracts     │
│  (Express)   │  │  (Solidity)          │
│              │  │  - TaiXiuGame.sol    │
│  - REST API  │  │  - FishingGame.sol   │
│  - Auth      │  │  - Counter.sol       │
│  - Upload    │  │  - MyToken.sol       │
└──────┬───────┘  └──────────────────────┘
       │
       ▼
┌──────────────┐
│   MongoDB    │
│  - Users     │
│  - Games     │
│  - Leaderbd  │
└──────────────┘
```

### 1.2. Kiến thức cần có

**Bắt buộc:**
- ✅ JavaScript cơ bản (ES6+)
- ✅ Node.js & npm
- ✅ Command line/Terminal
- ✅ Git cơ bản

**Nên có:**
- 🔶 React basics
- 🔶 Solidity cơ bản
- 🔶 Blockchain concepts (wallet, transaction, gas)

**Học được sau khóa:**
- 🎓 Smart contract development
- 🎓 Web3 integration
- 🎓 Blockchain architecture
- 🎓 Full-stack dApp development

### 1.3. Checklist chuẩn bị

- [ ] Windows 10/11 hoặc Linux/Mac
- [ ] Kết nối internet ổn định
- [ ] Ít nhất 5GB dung lượng trống
- [ ] Editor: VS Code (khuyến nghị)
- [ ] Browser: Chrome/Firefox (cho MetaMask)
- [ ] Giấy + bút để note quan trọng

---

## 2. CÀI ĐẶT MÔI TRƯỜNG PHÁT TRIỂN

### 2.1. Cài đặt Node.js

**Windows:**
1. Tải Node.js LTS: https://nodejs.org/
2. Chạy installer (.msi)
3. Kiểm tra:
```powershell
node --version  # v18.x.x hoặc cao hơn
npm --version   # 9.x.x hoặc cao hơn
```

**Mac:**
```bash
brew install node
```

**Linux (Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2. Cài đặt MongoDB

**Windows:**

1. **Download MongoDB Community Server:**
   - Link: https://www.mongodb.com/try/download/community
   - Chọn: Windows / MSI package
   - Version: 8.0 hoặc cao hơn

2. **Cài đặt:**
   - Chạy file .msi
   - Chọn "Complete" installation
   - Tick "Install MongoDB as a Service"
   - Tick "Install MongoDB Compass" (GUI tool)

3. **Thêm MongoDB vào PATH:**
```powershell
# Mở PowerShell as Administrator
$env:PATH += ";C:\Program Files\MongoDB\Server\8.2\bin"

# Lưu vĩnh viễn
[System.Environment]::SetEnvironmentVariable(
  "PATH", 
  $env:PATH + ";C:\Program Files\MongoDB\Server\8.2\bin", 
  "Machine"
)
```

4. **Tạo thư mục data:**
```powershell
New-Item -Path "C:\data\db" -ItemType Directory -Force
```

5. **Test MongoDB:**
```powershell
mongod --version
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
```

**Linux (Ubuntu):**
```bash
# Import MongoDB public key
curl -fsSL https://pgp.mongodb.com/server-8.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg

# Add repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2.3. Cài đặt VS Code

1. Download: https://code.visualstudio.com/
2. Install
3. **Extensions khuyến nghị:**
   - Solidity (by Juan Blanco)
   - ESLint
   - Prettier
   - MongoDB for VS Code
   - GitLens

### 2.4. Cài đặt MetaMask

1. **Browser Extension:**
   - Chrome: https://chrome.google.com/webstore
   - Firefox: https://addons.mozilla.org/
   - Search: "MetaMask"

2. **Setup MetaMask:**
   - Mở extension
   - "Create a new wallet"
   - Lưu **Secret Recovery Phrase** (12 words) - CỰC KỲ QUAN TRỌNG
   - Tạo password

3. **Test Account (cho development):**
   - Import account với private key test (KHÔNG dùng mainnet!)
   - Private key: `0x61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465`

### 2.5. Cài đặt Git

**Windows:**
- Download: https://git-scm.com/download/win
- Install với default options

**Mac/Linux:**
```bash
# Mac
brew install git

# Linux
sudo apt-get install git
```

### 2.6. Verify tất cả đã cài đặt

```powershell
# Node.js
node --version

# npm
npm --version

# MongoDB
mongod --version

# Git
git --version

# VS Code (optional)
code --version
```

**Expected output:**
```
node: v18.x.x hoặc cao hơn
npm: 9.x.x hoặc cao hơn
MongoDB: 8.0.x
Git: 2.x.x
VS Code: 1.x.x
```

---

## 3. KHỞI TẠO DỰ ÁN

### 3.1. Tạo thư mục dự án

```powershell
# Tạo folder chính
mkdir Blockchain
cd Blockchain

# Khởi tạo Git
git init

# Tạo .gitignore
@"
node_modules/
.env
.env.local
cache/
artifacts/
coverage/
typechain-types/
uploads/*
!uploads/.gitkeep
*.log
.DS_Store
"@ | Out-File -FilePath .gitignore -Encoding UTF8
```

### 3.2. Khởi tạo Node.js project

```powershell
# Tạo package.json
npm init -y

# Chỉnh sửa package.json
```

**File: `package.json`**
```json
{
  "name": "blockchain-game-platform",
  "version": "1.0.0",
  "description": "Blockchain gaming platform with Tai Xiu and Fishing games",
  "private": true,
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js",
    "compile": "npx hardhat compile",
    "deploy:local": "npx hardhat run scripts/deploy.js --network localhost",
    "deploy:all:hera": "npx hardhat run scripts/deploy-all.js --network hera",
    "verify:deployment": "npx hardhat run scripts/verify-deployment.js",
    "node": "npx hardhat node",
    "test": "npx hardhat test",
    "frontend": "cd frontend && npm run dev"
  },
  "keywords": ["blockchain", "gaming", "ethereum", "web3"],
  "author": "Your Name",
  "license": "MIT"
}
```

### 3.3. Cài đặt dependencies

**Backend & Blockchain:**
```powershell
npm install express cors dotenv mongoose multer body-parser mongodb

# Development dependencies
npm install --save-dev nodemon

# Hardhat & Blockchain
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers@6

# OpenZeppelin (smart contract libraries)
npm install @openzeppelin/contracts
```

### 3.4. Khởi tạo Hardhat

```powershell
npx hardhat init
```

**Chọn options:**
```
✔ What do you want to do? › Create a JavaScript project
✔ Hardhat project root: › (current directory)
✔ Do you want to add a .gitignore? › Yes
✔ Do you want to install dependencies? › No (đã cài rồi)
```

### 3.5. Cấu hình Hardhat

**File: `hardhat.config.js`**
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hera: {
      url: "https://testnet.hashio.io/api",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 296
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
```

### 3.6. Tạo cấu trúc thư mục

```powershell
# Backend structure
mkdir backend
mkdir backend\config
mkdir backend\controllers
mkdir backend\models
mkdir backend\routes
mkdir backend\uploads

# Contracts
mkdir contracts

# Scripts
mkdir scripts

# Tests
mkdir test

# Frontend (tạo sau)
```

### 3.7. Tạo file .env

**File: `.env`**
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/blockchain-game

# Server
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Blockchain Configuration
# ⚠️ PRIVATE KEY CHỈ ĐỂ TEST - KHÔNG DÙNG CHO MAINNET!
PRIVATE_KEY=0x61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465

# RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

**File: `.env.example`** (để commit lên Git)
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/blockchain-game

# Server
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-secret-key-here

# Blockchain Configuration
PRIVATE_KEY=your-private-key-here

# RPC URLs
SEPOLIA_RPC_URL=your-sepolia-rpc-url
```

---

## 4. XÂY DỰNG SMART CONTRACTS

### 4.1. TaiXiuGame Contract

**File: `contracts/TaiXiuGame.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TaiXiuGame
 * @dev Tai Xiu (Over/Under) betting game
 */
contract TaiXiuGame is Ownable, ReentrancyGuard {
    
    // Constants
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 1 ether;
    uint256 public constant HOUSE_EDGE = 2; // 2% house edge
    
    // Game state
    uint256 public totalBets;
    uint256 public totalWinnings;
    uint256 public houseBalance;
    
    // Enums
    enum BetType { TAI, XIU }
    
    // Structs
    struct Bet {
        address player;
        uint256 amount;
        BetType betType;
        uint256 diceResult;
        bool won;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(address => uint256) public playerWinnings;
    mapping(address => uint256) public playerBets;
    
    // Events
    event BetPlaced(
        address indexed player,
        uint256 amount,
        BetType betType,
        uint256 timestamp
    );
    
    event GameResult(
        address indexed player,
        uint256 diceResult,
        bool won,
        uint256 payout,
        uint256 timestamp
    );
    
    event Withdrawal(
        address indexed player,
        uint256 amount,
        uint256 timestamp
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Place a bet
     */
    function placeBet(BetType _betType) external payable nonReentrant {
        require(msg.value >= MIN_BET, "Bet too small");
        require(msg.value <= MAX_BET, "Bet too large");
        require(address(this).balance >= msg.value * 2, "Insufficient house balance");
        
        // Roll dice (1-6, three dice)
        uint256 dice1 = _rollDice(1);
        uint256 dice2 = _rollDice(2);
        uint256 dice3 = _rollDice(3);
        uint256 total = dice1 + dice2 + dice3;
        
        // Determine result (3-10 = Xiu, 11-18 = Tai)
        bool won = (_betType == BetType.TAI && total >= 11) || 
                   (_betType == BetType.XIU && total <= 10);
        
        // Calculate payout
        uint256 payout = 0;
        if (won) {
            uint256 grossPayout = msg.value * 2;
            uint256 houseFee = (grossPayout * HOUSE_EDGE) / 100;
            payout = grossPayout - houseFee;
            
            playerWinnings[msg.sender] += payout;
            totalWinnings += payout;
            houseBalance += houseFee;
        } else {
            houseBalance += msg.value;
        }
        
        // Update stats
        totalBets += msg.value;
        playerBets[msg.sender] += msg.value;
        
        // Emit events
        emit BetPlaced(msg.sender, msg.value, _betType, block.timestamp);
        emit GameResult(msg.sender, total, won, payout, block.timestamp);
    }
    
    /**
     * @dev Roll a single dice (pseudo-random)
     */
    function _rollDice(uint256 _nonce) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            _nonce
        ))) % 6 + 1;
    }
    
    /**
     * @dev Withdraw winnings
     */
    function withdrawWinnings() external nonReentrant {
        uint256 amount = playerWinnings[msg.sender];
        require(amount > 0, "No winnings to withdraw");
        
        playerWinnings[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Owner can withdraw house balance
     */
    function withdrawHouseBalance() external onlyOwner {
        uint256 amount = houseBalance;
        require(amount > 0, "No balance to withdraw");
        
        houseBalance = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Owner can fund the house
     */
    function fundHouse() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
    }
    
    /**
     * @dev Get player stats
     */
    function getPlayerStats(address _player) external view returns (
        uint256 totalBetsAmount,
        uint256 winnings
    ) {
        return (playerBets[_player], playerWinnings[_player]);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}
```

### 4.2. FishingGame Contract

**File: `contracts/FishingGame.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FishingGame
 * @dev Fishing game with different fish rarities
 */
contract FishingGame is Ownable, ReentrancyGuard {
    
    // Constants
    uint256 public constant SESSION_COST = 0.01 ether;
    uint256 public constant CASTS_PER_SESSION = 5;
    uint256 public constant JACKPOT_CONTRIBUTION = 5; // 5% to jackpot
    
    // Fish rarities and rewards
    enum FishType { SMALL, MEDIUM, LARGE, RARE, EPIC }
    
    struct Fish {
        FishType fishType;
        uint256 reward;
        uint256 probability; // out of 100
    }
    
    struct Session {
        address player;
        uint256 castsRemaining;
        uint256 totalReward;
        bool active;
        uint256 startTime;
    }
    
    // State variables
    mapping(address => Session) public sessions;
    mapping(address => uint256) public playerRewards;
    mapping(address => uint256) public playerStats;
    
    uint256 public jackpotPool;
    uint256 public totalSessions;
    
    // Fish definitions
    Fish[5] public fishTypes;
    
    // Events
    event SessionStarted(address indexed player, uint256 timestamp);
    event FishCaught(
        address indexed player,
        FishType fishType,
        uint256 reward,
        uint256 timestamp
    );
    event SessionEnded(
        address indexed player,
        uint256 totalReward,
        uint256 timestamp
    );
    event JackpotWon(
        address indexed player,
        uint256 amount,
        uint256 timestamp
    );
    event RewardClaimed(
        address indexed player,
        uint256 amount,
        uint256 timestamp
    );
    
    constructor() Ownable(msg.sender) {
        // Initialize fish types (rewards in wei)
        fishTypes[0] = Fish(FishType.SMALL, 0.001 ether, 40);   // 40%
        fishTypes[1] = Fish(FishType.MEDIUM, 0.005 ether, 30);  // 30%
        fishTypes[2] = Fish(FishType.LARGE, 0.01 ether, 20);    // 20%
        fishTypes[3] = Fish(FishType.RARE, 0.02 ether, 9);      // 9%
        fishTypes[4] = Fish(FishType.EPIC, 0.05 ether, 1);      // 1%
    }
    
    /**
     * @dev Start a fishing session
     */
    function startSession() external payable nonReentrant {
        require(msg.value == SESSION_COST, "Incorrect session cost");
        require(!sessions[msg.sender].active, "Session already active");
        
        // Contribute to jackpot
        uint256 jackpotAmount = (msg.value * JACKPOT_CONTRIBUTION) / 100;
        jackpotPool += jackpotAmount;
        
        // Create session
        sessions[msg.sender] = Session({
            player: msg.sender,
            castsRemaining: CASTS_PER_SESSION,
            totalReward: 0,
            active: true,
            startTime: block.timestamp
        });
        
        totalSessions++;
        
        emit SessionStarted(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Cast fishing line
     */
    function castLine() external nonReentrant {
        Session storage session = sessions[msg.sender];
        require(session.active, "No active session");
        require(session.castsRemaining > 0, "No casts remaining");
        
        // Determine fish caught
        FishType caught = _determineFish();
        uint256 reward = fishTypes[uint256(caught)].reward;
        
        // Update session
        session.castsRemaining--;
        session.totalReward += reward;
        playerRewards[msg.sender] += reward;
        
        emit FishCaught(msg.sender, caught, reward, block.timestamp);
        
        // Check for jackpot (1% chance on EPIC fish)
        if (caught == FishType.EPIC && _checkJackpot()) {
            uint256 jackpot = jackpotPool;
            jackpotPool = 0;
            playerRewards[msg.sender] += jackpot;
            
            emit JackpotWon(msg.sender, jackpot, block.timestamp);
        }
        
        // End session if no casts remaining
        if (session.castsRemaining == 0) {
            _endSession(msg.sender);
        }
    }
    
    /**
     * @dev End session manually
     */
    function endSession() external {
        require(sessions[msg.sender].active, "No active session");
        _endSession(msg.sender);
    }
    
    /**
     * @dev Internal function to end session
     */
    function _endSession(address _player) private {
        Session storage session = sessions[_player];
        session.active = false;
        
        playerStats[_player] += session.totalReward;
        
        emit SessionEnded(_player, session.totalReward, block.timestamp);
    }
    
    /**
     * @dev Determine which fish is caught
     */
    function _determineFish() private view returns (FishType) {
        uint256 rand = _random() % 100;
        uint256 cumulative = 0;
        
        for (uint256 i = 0; i < fishTypes.length; i++) {
            cumulative += fishTypes[i].probability;
            if (rand < cumulative) {
                return fishTypes[i].fishType;
            }
        }
        
        return FishType.SMALL; // Fallback
    }
    
    /**
     * @dev Check if jackpot is won (1% chance)
     */
    function _checkJackpot() private view returns (bool) {
        return (_random() % 100) == 0;
    }
    
    /**
     * @dev Generate pseudo-random number
     */
    function _random() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            totalSessions
        )));
    }
    
    /**
     * @dev Claim rewards
     */
    function claimRewards() external nonReentrant {
        uint256 amount = playerRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        require(!sessions[msg.sender].active, "End session first");
        
        playerRewards[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Get player session info
     */
    function getSessionInfo(address _player) external view returns (
        bool active,
        uint256 castsRemaining,
        uint256 totalReward
    ) {
        Session memory session = sessions[_player];
        return (session.active, session.castsRemaining, session.totalReward);
    }
    
    /**
     * @dev Owner can fund jackpot
     */
    function fundJackpot() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
        jackpotPool += msg.value;
    }
    
    /**
     * @dev Get contract stats
     */
    function getContractStats() external view returns (
        uint256 balance,
        uint256 jackpot,
        uint256 sessions
    ) {
        return (address(this).balance, jackpotPool, totalSessions);
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}
```

### 4.3. Counter Contract (Tutorial)

**File: `contracts/Counter.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Counter
 * @dev Simple counter contract for tutorial
 */
contract Counter {
    uint256 private count;
    
    event CountChanged(uint256 newCount);
    
    constructor() {
        count = 0;
    }
    
    function increment(uint256 _amount) public {
        count += _amount;
        emit CountChanged(count);
    }
    
    function getCount() public view returns (uint256) {
        return count;
    }
    
    function reset() public {
        count = 0;
        emit CountChanged(count);
    }
}
```

### 4.4. MyToken Contract (Tutorial)

**File: `contracts/MyToken.sol`**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev ERC20 token for tutorial
 */
contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### 4.5. Compile Contracts

```powershell
npm run compile
```

**Expected output:**
```
Compiled 4 Solidity files successfully
```

---

## 5. SETUP BACKEND API

### 5.1. Database Models

**File: `backend/models/User.js`**
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  totalGamesPlayed: {
    type: Number,
    default: 0
  },
  totalWinnings: {
    type: Number,
    default: 0
  },
  totalLosses: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
```

**File: `backend/models/GameHistory.js`**
```javascript
const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  gameType: {
    type: String,
    enum: ['taixiu', 'fishing'],
    required: true
  },
  betAmount: {
    type: Number,
    required: true
  },
  result: {
    type: String,
    required: true
  },
  won: {
    type: Boolean,
    required: true
  },
  payout: {
    type: Number,
    default: 0
  },
  transactionHash: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameHistory', gameHistorySchema);
```

**File: `backend/models/Leaderboard.js`**
```javascript
const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    default: 'Anonymous'
  },
  totalWins: {
    type: Number,
    default: 0
  },
  totalGames: {
    type: Number,
    default: 0
  },
  totalWinnings: {
    type: Number,
    default: 0
  },
  winRate: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
```

**File: `backend/models/Transaction.js`**
```javascript
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['bet', 'win', 'loss', 'withdraw'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  gameType: {
    type: String,
    enum: ['taixiu', 'fishing', 'other']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  blockNumber: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
```

### 5.2. Controllers

**File: `backend/controllers/gameController.js`**
```javascript
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');

// Save game result
exports.saveGameResult = async (req, res) => {
  try {
    const { 
      walletAddress, 
      gameType, 
      betAmount, 
      result, 
      won, 
      payout, 
      transactionHash 
    } = req.body;

    // Find or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = await User.create({ walletAddress: walletAddress.toLowerCase() });
    }

    // Create game history
    const gameHistory = await GameHistory.create({
      user: user._id,
      walletAddress: walletAddress.toLowerCase(),
      gameType,
      betAmount,
      result,
      won,
      payout,
      transactionHash
    });

    // Update user stats
    user.totalGamesPlayed += 1;
    if (won) {
      user.totalWinnings += payout;
    } else {
      user.totalLosses += betAmount;
    }
    await user.save();

    res.status(201).json({
      success: true,
      data: gameHistory
    });
  } catch (error) {
    console.error('Save game result error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user game history
exports.getUserHistory = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const history = await GameHistory.find({ 
      walletAddress: walletAddress.toLowerCase() 
    })
    .sort({ timestamp: -1 })
    .limit(50);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get game stats
exports.getGameStats = async (req, res) => {
  try {
    const { gameType } = req.params;
    
    const stats = await GameHistory.aggregate([
      { $match: { gameType } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          totalBets: { $sum: '$betAmount' },
          totalPayouts: { $sum: '$payout' },
          wins: {
            $sum: { $cond: ['$won', 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

**File: `backend/controllers/leaderboardController.js`**
```javascript
const Leaderboard = require('../models/Leaderboard');
const GameHistory = require('../models/GameHistory');

// Update leaderboard
exports.updateLeaderboard = async (req, res) => {
  try {
    const { walletAddress, won, winnings } = req.body;

    let entry = await Leaderboard.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (!entry) {
      entry = new Leaderboard({ 
        walletAddress: walletAddress.toLowerCase() 
      });
    }

    entry.totalGames += 1;
    if (won) {
      entry.totalWins += 1;
      entry.totalWinnings += winnings;
    }
    
    entry.winRate = (entry.totalWins / entry.totalGames) * 100;
    entry.lastUpdated = Date.now();
    
    await entry.save();

    // Update ranks
    await updateRanks();

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Update leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 100, sortBy = 'totalWinnings' } = req.query;

    const leaderboard = await Leaderboard.find()
      .sort({ [sortBy]: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to update ranks
async function updateRanks() {
  const entries = await Leaderboard.find().sort({ totalWinnings: -1 });
  
  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
    await entries[i].save();
  }
}
```

**File: `backend/controllers/transactionController.js`**
```javascript
const Transaction = require('../models/Transaction');

// Save transaction
exports.saveTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Save transaction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const transactions = await Transaction.find({ 
      walletAddress: walletAddress.toLowerCase() 
    })
    .sort({ timestamp: -1 })
    .limit(100);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update transaction status
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { transactionHash } = req.params;
    const { status, blockNumber } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { transactionHash },
      { status, blockNumber },
      { new: true }
    );

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### 5.3. Routes

**File: `backend/routes/gameRoutes.js`**
```javascript
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/save-result', gameController.saveGameResult);
router.get('/history/:walletAddress', gameController.getUserHistory);
router.get('/stats/:gameType', gameController.getGameStats);

module.exports = router;
```

**File: `backend/routes/leaderboardRoutes.js`**
```javascript
const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

router.post('/update', leaderboardController.updateLeaderboard);
router.get('/', leaderboardController.getLeaderboard);

module.exports = router;
```

**File: `backend/routes/transactionRoutes.js`**
```javascript
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/', transactionController.saveTransaction);
router.get('/:walletAddress', transactionController.getUserTransactions);
router.put('/:transactionHash', transactionController.updateTransactionStatus);

module.exports = router;
```

**File: `backend/routes/userRoutes.js`**
```javascript
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get or create user
router.post('/', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    let user = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });
    
    if (!user) {
      user = await User.create({ 
        walletAddress: walletAddress.toLowerCase() 
      });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get user
router.get('/:walletAddress', async (req, res) => {
  try {
    const user = await User.findOne({ 
      walletAddress: req.params.walletAddress.toLowerCase() 
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
```

**File: `backend/routes/avatarRoutes.js`**
```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// Multer configuration
const storage = multer.diskStorage({
  destination: './backend/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images allowed'));
  }
});

// Upload avatar
router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }
    
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { avatar: `/uploads/${req.file.filename}` },
      { new: true }
    );
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
```

### 5.4. Server Configuration

**File: `backend/config/index.js`**
```javascript
module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/blockchain-game',
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  nodeEnv: process.env.NODE_ENV || 'development'
};
```

**File: `backend/server.js`**
```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const gameRoutes = require('./routes/gameRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const avatarRoutes = require('./routes/avatarRoutes');

// Import config
const config = require('./config');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/avatar', avatarRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: err.message 
  });
});

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  
  // Start server
  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 API: http://localhost:${config.port}/api`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
```

### 5.5. Test Backend

```powershell
# Terminal 1: Start MongoDB
mongod --dbpath "C:\data\db"

# Terminal 2: Start Backend
npm run dev
```

**Test API:**
```powershell
# Health check
curl http://localhost:5000/api/health
```

---

## 6. XÂY DỰNG FRONTEND

### 6.1. Khởi tạo React App

```powershell
# Tạo Vite React app
npm create vite@latest frontend -- --template react

cd frontend
npm install

# Install additional dependencies
npm install ethers@6
```

### 6.2. Cấu hình Frontend

**File: `frontend/.env`**
```env
VITE_API_URL=http://localhost:5000
VITE_TAIXIU_CONTRACT=
VITE_FISHING_CONTRACT=
VITE_COUNTER_CONTRACT=
VITE_MYTOKEN_CONTRACT=
VITE_CHAIN_ID=296
VITE_NETWORK_NAME=Hera Testnet
VITE_RPC_URL=https://testnet.hashio.io/api
```

### 6.3. Basic Components

**File: `frontend/src/main.jsx`**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**File: `frontend/src/index.css`**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #fff;
}

.App {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  text-align: center;
  padding: 40px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  margin-bottom: 30px;
}

.app-header h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.wallet-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.wallet-address {
  font-size: 0.9rem;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-family: monospace;
}

button {
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.connect-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.connect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.disconnect-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.disconnect-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.games-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.game-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(10px);
}

.game-card h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input[type="number"] {
  padding: 12px;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

input[type="number"]:focus {
  outline: none;
  border-color: #667eea;
}

.game-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.game-btn:hover {
  transform: scale(1.05);
}

.game-btn:disabled {
  background: gray;
  cursor: not-allowed;
  transform: none;
}

.game-result {
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  text-align: center;
}

.win {
  color: #4ade80;
  font-size: 1.5rem;
  font-weight: bold;
}

.lose {
  color: #f87171;
  font-size: 1.5rem;
  font-weight: bold;
}

.tutorial-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 30px;
  margin-top: 30px;
}

.tutorial-section h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  padding: 20px;
}

.error {
  color: #f87171;
  text-align: center;
  font-size: 1.2rem;
  padding: 20px;
}

@media (max-width: 768px) {
  .games-section {
    grid-template-columns: 1fr;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
}
```

> ⚠️ **FILE QUÁ DÀI - PHẦN 2/3**
> 
> File tiếp tục trong phần kế tiếp...

---

**(Tiếp theo bên dưới...)**

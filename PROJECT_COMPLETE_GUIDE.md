# 📘 HƯỚNG DẪN HOÀN CHỈNH DỰ ÁN WEBGAME BLOCKCHAIN

## 📋 MỤC LỤC
1. [Tổng quan dự án](#tổng-quan-dự-án)
2. [Cấu trúc thư mục quan trọng](#cấu-trúc-thư-mục-quan-trọng)
3. [Các file quan trọng](#các-file-quan-trọng)
4. [Smart Contracts](#smart-contracts)
5. [Backend API](#backend-api)
6. [Frontend](#frontend)
7. [Cách hoạt động](#cách-hoạt-động)
8. [Setup & Deploy](#setup--deploy)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 TỔNG QUAN DỰ ÁN

### Mô tả
Web game tích hợp blockchain với tính năng:
- Chơi game kiếm điểm (Tài Xỉu, Câu Cá, Click Game)
- Đổi điểm thành BOMDOG Coin
- Rút BOMDOG về ví MetaMask (on-chain)
- Admin quản lý user & duyệt withdraw

### Tech Stack
```
Frontend:  React + Vite
Backend:   Node.js + Express
Database:  MongoDB
Blockchain: Ethereum (Sepolia Testnet)
Contract:   Solidity + Hardhat
Token:      ERC20 (BOMDOG)
```

### Flow hoạt động
```
User → Chơi game → Kiếm điểm (DB) 
     → Đổi điểm thành BOMDOG (in-game)
     → Yêu cầu rút tiền
     → Admin duyệt
     → Contract chuyển BOMDOG thật → Ví user
```

---

## 📁 CẤU TRÚC THƯ MỤC QUAN TRỌNG

### ✅ FILE/FOLDER CẦN THIẾT

```
Webgame_Blockchain-main/
├── 📄 .env                          ⭐ Config quan trọng nhất
├── 📄 package.json                  ⭐ Dependencies gốc
├── 📄 hardhat.config.js             ⭐ Config blockchain
│
├── 📁 contracts/                    ⭐ Smart contracts
│   └── BomdogToken.sol              ⭐⭐⭐ Contract chính
│
├── 📁 scripts/                      ⭐ Deploy & utilities
│   ├── deploy-bomdog-simple.js      ⭐⭐ Deploy contract
│   ├── fund-contract.js             ⭐⭐ Nạp token vào contract
│   ├── test-withdraw.js             ⭐ Test withdraw
│   ├── bomdog-info.js               ⭐ Xem thông tin
│   ├── bomdog-transfer.js           ⭐ Chuyển token
│   └── bomdog-mint.js               ⭐ Mint token
│
├── 📁 backend/                      ⭐ Server API
│   ├── server.js                    ⭐⭐⭐ Entry point
│   │
│   ├── config/                      
│   │   ├── index.js                 ⭐⭐ Config chung
│   │   └── economy.js               ⭐⭐⭐ Config withdraw
│   │
│   ├── models/                      ⭐ Database schemas
│   │   ├── User.js
│   │   ├── WalletUser.js            ⭐⭐ User wallet data
│   │   ├── WithdrawHistory.js       ⭐⭐ Lịch sử rút tiền
│   │   └── ...
│   │
│   ├── controllers/                 
│   │   ├── walletEconomyController.js       ⭐⭐ User withdraw
│   │   └── walletEconomyAdminController.js  ⭐⭐⭐ Admin duyệt
│   │
│   ├── services/                    
│   │   └── walletEconomyService.js  ⭐⭐⭐⭐ Logic withdraw chính
│   │
│   ├── routes/                      ⭐ API routes
│   │   └── walletRoutes.js          ⭐⭐ Wallet endpoints
│   │
│   └── middleware/                  
│       ├── auth.js                  ⭐ User auth
│       └── adminAuth.js             ⭐ Admin auth
│
├── 📁 frontend/                     ⭐ User interface
│   ├── package.json
│   ├── vite.config.js               ⭐ Vite config
│   └── src/
│       ├── Bomdog.jsx               ⭐⭐ Game chính
│       ├── WithdrawModal.jsx        ⭐⭐ Modal rút tiền
│       └── ...
│
└── 📁 frontend-admin/               ⭐ Admin dashboard
    ├── package.json
    └── src/
        └── AdminDashboard.jsx       ⭐⭐ Duyệt withdraw

```

### ❌ FILE/FOLDER CÓ THỂ XÓA (Không dùng)

```
❌ TaiXiuGame.sol           (Game logic chạy trên backend)
❌ FishingGame.sol          (Game logic chạy trên backend)
❌ BomdogGame.sol           (Không dùng)
❌ ContractFactory.sol      (Không cần thiết)
❌ test/                    (Test contracts - optional)
❌ cache/                   (Hardhat cache - tự sinh)
❌ artifacts/               (Compiled - tự sinh)
❌ GENERATE_CONTRACT_GUIDE.md  (Hướng dẫn cũ)
❌ WITHDRAW_CONFIG_GUIDE.md    (Đã gộp vào đây)
❌ WITHDRAW_SETUP_COMPLETE.md  (Đã gộp vào đây)
❌ WITHDRAW_FIX_COMPLETE.md    (Đã gộp vào đây)
❌ WITHDRAW_READY.md           (Đã gộp vào đây)
```

---

## 📄 CÁC FILE QUAN TRỌNG & GIẢI THÍCH

### 1️⃣ `.env` - CẤU HÌNH QUAN TRỌNG NHẤT ⭐⭐⭐⭐⭐

```env
# ===== DATABASE =====
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0

# ===== SERVER =====
PORT=5000
JWT_SECRET=your-secret-key

# ===== BLOCKCHAIN =====
PRIVATE_KEY=61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# ===== BOMDOG TOKEN - WITHDRAW CONFIG ⭐⭐⭐⭐⭐ =====
# Contract address (sau khi deploy)
BOMDOG_CONTRACT_ADDRESS=0xcAb7EDB405E1A3072CdcE909AC75819B935EB85d

# RPC URL để kết nối blockchain
BOMDOG_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Private key account thực hiện withdraw (cần ETH cho gas)
BOMDOG_WITHDRAWER_KEY=61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465

# Withdraw settings
BOMDOG_MIN_WITHDRAW=50              # Rút tối thiểu 50 coin
BOMDOG_WITHDRAW_GAS_LIMIT=220000    # Gas limit mỗi transaction
BOMDOG_COIN_DECIMALS=18             # ERC20 standard
BOMDOG_WITHDRAW_METHOD=withdraw(address,uint256)  # Function signature

# Economy settings
BOMDOG_EXCHANGE_POINTS=1000         # 1000 điểm = 
BOMDOG_EXCHANGE_COIN=10             # 10 BOMDOG
BOMDOG_UPGRADE_BASE_COST=30
BOMDOG_UPGRADE_MULTIPLIER=1.5
```

**Lưu ý quan trọng**:
- ⚠️ KHÔNG commit file này lên Git
- 🔑 `BOMDOG_WITHDRAWER_KEY` cần có ETH để trả gas
- 📍 `BOMDOG_CONTRACT_ADDRESS` cập nhật sau khi deploy contract

---

### 2️⃣ `contracts/BomdogToken.sol` - SMART CONTRACT ⭐⭐⭐⭐⭐

**Mục đích**: Token ERC20 cho game, có tính năng withdraw

**Code quan trọng**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BomdogToken is ERC20, Ownable {
    uint8 private _decimals;

    constructor(uint256 initialSupply, uint8 tokenDecimals) 
        ERC20("Bomdog Coin", "BOMDOG") 
        Ownable(msg.sender) 
    {
        _decimals = tokenDecimals;
        _mint(msg.sender, initialSupply);  // Mint cho owner
    }

    // ⭐⭐⭐ HÀM QUAN TRỌNG NHẤT - WITHDRAW
    // Backend gọi hàm này khi admin duyệt withdraw
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot withdraw to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        // Chuyển token: Contract → User
        _transfer(address(this), to, amount);
    }

    // Mint thêm token (nếu cần)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Nạp token vào contract
    function fundContract(uint256 amount) external onlyOwner {
        _transfer(msg.sender, address(this), amount);
    }

    // Xem số dư contract
    function contractBalance() external view returns (uint256) {
        return balanceOf(address(this));
    }
}
```

**Giải thích**:
- `withdraw()`: Admin gọi để chuyển token từ contract → user
- `onlyOwner`: Chỉ owner mới gọi được (bảo mật)
- `balanceOf(address(this))`: Số token contract đang giữ
- `_transfer(contract, user, amount)`: Chuyển token

---

### 3️⃣ `backend/services/walletEconomyService.js` - LOGIC WITHDRAW ⭐⭐⭐⭐⭐

**File này chứa TẤT CẢ logic xử lý withdraw**

**Code quan trọng**:

```javascript
const { ethers } = require('ethers');
const { getWithdrawConfig } = require('../config/economy');

// ⭐⭐⭐ KẾT NỐI VỚI CONTRACT
function getWithdrawContract() {
  const config = getWithdrawConfig();
  
  // Kiểm tra config đầy đủ
  if (!config.rpcUrl || !config.contractAddress || !config.withdrawerKey) {
    throw new Error('Withdraw contract not configured');
  }
  
  // Kết nối blockchain
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.withdrawerKey, provider);
  const contract = new ethers.Contract(
    config.contractAddress, 
    config.abi, 
    wallet
  );
  
  return { contract, config };
}

// ⭐⭐⭐ THỰC HIỆN WITHDRAW ON-CHAIN
async function performWithdrawOnChain(targetAddress, amount) {
  const { contract, config } = getWithdrawContract();
  
  // Chuyển số lượng sang wei (18 decimals)
  const scaledAmount = ethers.parseUnits(amount.toString(), config.coinDecimals);
  
  // Gọi hàm withdraw của contract
  const fn = contract.getFunction(config.methodSignature);
  const txResponse = await fn(targetAddress, scaledAmount);
  
  // Đợi transaction confirm
  const receipt = await txResponse.wait(config.withdrawConfirmations);
  
  return { 
    txHash: receipt?.hash || txResponse.hash, 
    receipt 
  };
}

// ⭐⭐⭐⭐⭐ HÀM CHÍNH - ADMIN DUYỆT WITHDRAW
async function reviewWithdrawRequest({ requestId, approve, note, adminId }) {
  
  // Nếu từ chối
  if (!approve) {
    // Hoàn coin về user (trong database)
    user.bomdogCoin += request.amount;
    user.lockedBomdogCoin -= request.amount;
    request.status = 'rejected';
    return;
  }
  
  // Nếu duyệt - Thực hiện withdraw on-chain
  try {
    // 1. Cập nhật status = processing
    request.status = 'processing';
    await request.save();
    
    // 2. ⭐⭐⭐ GỌI CONTRACT - CHUYỂN TOKEN THẬT
    const result = await performWithdrawOnChain(
      request.walletAddress, 
      request.amount
    );
    
    // 3. Thành công - Update database
    request.status = 'completed';
    request.txHash = result.txHash;
    user.lockedBomdogCoin -= request.amount;
    await request.save();
    await user.save();
    
    return { 
      request, 
      user, 
      txHash: result.txHash 
    };
    
  } catch (err) {
    // 4. Thất bại - Hoàn lại coin
    request.status = 'failed';
    request.failureReason = err.message;
    user.bomdogCoin += request.amount;
    user.lockedBomdogCoin -= request.amount;
    
    throw new Error('Withdraw transaction failed');
  }
}
```

**Giải thích flow**:
```
1. Admin click Approve
   ↓
2. Backend gọi reviewWithdrawRequest()
   ↓
3. Kết nối contract qua getWithdrawContract()
   ↓
4. Gọi performWithdrawOnChain()
   ↓
5. Contract.withdraw(userAddress, amount)
   ↓
6. Blockchain xử lý → Transaction hash
   ↓
7. Update database: status = completed
   ↓
8. User nhận token vào ví
```

---

### 4️⃣ `backend/config/economy.js` - ĐỌC CONFIG ⭐⭐⭐⭐

**Code quan trọng**:

```javascript
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// ⭐⭐⭐ ĐỌC CONFIG WITHDRAW TỪ .ENV
function getWithdrawConfig() {
  return {
    minWithdraw: parseInt(process.env.BOMDOG_MIN_WITHDRAW) || 50,
    rpcUrl: process.env.BOMDOG_RPC_URL,
    withdrawerKey: process.env.BOMDOG_WITHDRAWER_KEY,
    contractAddress: process.env.BOMDOG_CONTRACT_ADDRESS,
    
    // ABI - Giao diện contract
    abi: [
      'function withdraw(address to, uint256 amount) external',
      'function balanceOf(address account) view returns (uint256)'
    ],
    
    coinDecimals: 18,
    withdrawConfirmations: 1,
    withdrawGasLimit: 220000,
    methodSignature: 'withdraw(address,uint256)'
  };
}
```

**Lưu ý**:
- Đọc từ `.env` ở thư mục gốc (quan trọng!)
- ABI chỉ cần khai báo hàm sử dụng
- `withdrawerKey` phải có ETH để trả gas

---

### 5️⃣ `scripts/deploy-bomdog-simple.js` - DEPLOY CONTRACT ⭐⭐⭐⭐

```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  // ⭐⭐⭐ DEPLOY CONTRACT
  const BomdogToken = await hre.ethers.getContractFactory("BomdogToken");
  const initialSupply = hre.ethers.parseUnits("10000000", 18); // 10M tokens
  const decimals = 18;
  
  const token = await BomdogToken.deploy(initialSupply, decimals);
  await token.waitForDeployment();
  
  const address = await token.getAddress();
  console.log("✅ BOMDOG Token deployed!");
  console.log("📍 Address:", address);
  console.log("\n📋 Cập nhật vào .env:");
  console.log(`BOMDOG_CONTRACT_ADDRESS=${address}`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
```

**Sử dụng**:
```bash
npx hardhat run scripts/deploy-bomdog-simple.js --network sepolia
```

---

### 6️⃣ `frontend/src/WithdrawModal.jsx` - UI RÚT TIỀN ⭐⭐⭐

```javascript
function WithdrawModal({ show, onClose, currentCoin }) {
  const [amount, setAmount] = useState('');
  
  const handleWithdraw = async () => {
    try {
      // ⭐⭐⭐ GỌI API WITHDRAW
      const response = await fetch('/api/wallet/economy/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          walletAddress: userWallet,  // Ví MetaMask
          amount: parseInt(amount)    // Số coin muốn rút
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Yêu cầu rút tiền thành công! Admin sẽ duyệt trong vòng 24h');
      }
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  };
  
  return (
    <div className="modal">
      <input 
        type="number" 
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Số coin muốn rút"
      />
      <button onClick={handleWithdraw}>Rút tiền</button>
    </div>
  );
}
```

---

### 7️⃣ `frontend-admin/src/AdminDashboard.jsx` - ADMIN DUYỆT ⭐⭐⭐⭐

```javascript
function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  
  // ⭐⭐⭐ DUYỆT WITHDRAW
  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(
        `/api/admin/economy/withdraw-requests/${requestId}/review`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ 
            approve: true,
            note: 'Approved by admin'
          })
        }
      );
      
      const data = await response.json();
      if (data.success) {
        alert(`Duyệt thành công! TxHash: ${data.data.txHash}`);
        loadRequests(); // Reload danh sách
      }
    } catch (error) {
      console.error('Approve error:', error);
    }
  };
  
  return (
    <div>
      <h2>Withdraw Requests</h2>
      {requests.map(req => (
        <div key={req._id}>
          <p>User: {req.walletAddress}</p>
          <p>Amount: {req.amount} BOMDOG</p>
          <p>Status: {req.status}</p>
          {req.status === 'pending' && (
            <button onClick={() => handleApprove(req._id)}>
              Duyệt
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 CÁCH HOẠT ĐỘNG CHI TIẾT

### Flow 1: User chơi game kiếm coin

```
1. User click vào game (Tài Xỉu/Câu Cá/Click)
   ↓
2. Frontend gọi API: POST /api/game/play
   ↓
3. Backend xử lý logic game (random, tính điểm)
   ↓
4. Lưu vào MongoDB:
   - User.points += điểm kiếm được
   - GameHistory: lưu lịch sử
   ↓
5. Trả kết quả về frontend
   ↓
6. Frontend hiển thị: "Bạn thắng! +100 điểm"
```

**Lưu ý**: Game logic chạy 100% trên backend, KHÔNG dùng smart contract

### Flow 2: User đổi điểm → BOMDOG (in-game)

```
1. User click "Đổi điểm"
   ↓
2. Frontend: POST /api/wallet/economy/exchange-points
   Body: { pointsToExchange: 1000 }
   ↓
3. Backend kiểm tra:
   - User có >= 1000 điểm?
   - 1000 điểm = 10 BOMDOG (theo config)
   ↓
4. Cập nhật database:
   - User.points -= 1000
   - WalletUser.bomdogCoin += 10
   ↓
5. Trả về: "Đổi thành công! Bạn có 10 BOMDOG"
```

**Lưu ý**: BOMDOG lúc này chỉ là SỐ trong database, CHƯA PHẢI token blockchain thật

### Flow 3: User yêu cầu rút tiền

```
1. User nhập số coin muốn rút: 100 BOMDOG
   ↓
2. Frontend: POST /api/wallet/economy/withdraw
   Body: { 
     walletAddress: "0xabc...",  // Ví MetaMask
     amount: 100 
   }
   ↓
3. Backend kiểm tra:
   - User có >= 100 BOMDOG? (trong database)
   - >= minimum withdraw (50)?
   - Có withdraw pending nào chưa?
   ↓
4. Nếu OK:
   - WalletUser.bomdogCoin -= 100
   - WalletUser.lockedBomdogCoin += 100
   - Tạo WithdrawHistory { 
       walletAddress, 
       amount: 100,
       status: 'pending'
     }
   ↓
5. Trả về: "Yêu cầu đã tạo! Chờ admin duyệt"
```

### Flow 4: Admin duyệt withdraw ⭐⭐⭐⭐⭐

```
1. Admin vào Dashboard → Tab "Withdraw Requests"
   ↓
2. Thấy request: User 0xabc... muốn rút 100 BOMDOG
   ↓
3. Admin click "Approve"
   ↓
4. Frontend: PUT /api/admin/economy/withdraw-requests/:id/review
   Body: { approve: true }
   ↓
5. Backend (walletEconomyService.js):
   
   a. Update DB: status = 'processing'
   
   b. ⭐⭐⭐ KẾT NỐI BLOCKCHAIN:
      - Provider: connect to Sepolia RPC
      - Wallet: load BOMDOG_WITHDRAWER_KEY
      - Contract: attach BOMDOG_CONTRACT_ADDRESS
   
   c. ⭐⭐⭐ GỌI SMART CONTRACT:
      await contract.withdraw(
        "0xabc...",              // Địa chỉ user
        ethers.parseUnits("100", 18)  // 100 BOMDOG
      );
   
   d. Transaction được tạo:
      - From: 0x91439D81... (withdrawer)
      - To: Contract address
      - Function: withdraw(0xabc..., 100000...)
      - Gas: ~0.001 ETH
   
   e. Blockchain xử lý:
      - Miners confirm transaction
      - Contract thực thi: 
        _transfer(contract, user, 100 BOMDOG)
      - Contract balance: -100
      - User balance: +100
      - TxHash: 0xdef...
   
   f. Update DB:
      - status = 'completed'
      - txHash = '0xdef...'
      - WalletUser.lockedBomdogCoin -= 100
   ↓
6. Trả về admin: 
   "Duyệt thành công! 
    TxHash: 0xdef...
    View: https://sepolia.etherscan.io/tx/0xdef..."
   ↓
7. User kiểm tra ví MetaMask → Thấy +100 BOMDOG ✅
```

**Điểm quan trọng**:
- Token được chuyển TỪ CONTRACT, không phải từ admin
- Admin chỉ trả gas fees bằng ETH
- Transaction ghi vào blockchain, ai cũng verify được

---

## 🚀 SETUP & DEPLOY

### Bước 1: Cài đặt dependencies

```bash
# Root project
npm install

# Frontend
cd frontend
npm install

# Frontend admin
cd frontend-admin
npm install
```

### Bước 2: Cấu hình .env

Copy `.env` và điền đầy đủ thông tin (xem mục 1️⃣ ở trên)

### Bước 3: Deploy Smart Contract

```bash
# Compile
npx hardhat compile

# Deploy lên Sepolia
npx hardhat run scripts/deploy-bomdog-simple.js --network sepolia

# Lưu lại contract address
# Cập nhật vào .env: BOMDOG_CONTRACT_ADDRESS=0x...
```

### Bước 4: Fund Contract (nạp token)

```bash
# Nạp 5M BOMDOG vào contract để có token cho withdraw
npx hardhat run scripts/fund-contract.js --network sepolia
```

### Bước 5: Chạy Backend

```bash
npm start
# hoặc
npm run dev
```

Backend chạy tại: http://localhost:5000

### Bước 6: Chạy Frontend

```bash
# Terminal 1: User frontend
cd frontend
npm run dev
# → http://localhost:5173

# Terminal 2: Admin frontend  
cd frontend-admin
npm run dev
# → http://localhost:5174
```

---

## 🛠️ TROUBLESHOOTING

### Lỗi: "Withdraw contract not configured"

**Nguyên nhân**: Thiếu config trong .env

**Giải pháp**:
```bash
# Kiểm tra config
node test-withdraw-config.js

# Đảm bảo có đủ 3 biến:
BOMDOG_RPC_URL=https://...
BOMDOG_WITHDRAWER_KEY=0x...
BOMDOG_CONTRACT_ADDRESS=0x...
```

### Lỗi: "transaction execution reverted"

**Nguyên nhân**: Contract không có đủ token

**Giải pháp**:
```bash
# Xem số dư contract
npx hardhat run scripts/bomdog-info.js --network sepolia

# Nếu ít, nạp thêm
npx hardhat run scripts/fund-contract.js --network sepolia
```

### Lỗi: "Insufficient funds for gas"

**Nguyên nhân**: Withdrawer account hết ETH

**Giải pháp**:
```bash
# Lấy ETH testnet miễn phí
# https://sepoliafaucet.com/
# Nhập địa chỉ: 0x91439D81f62146F54E9310a27459994f0aA602D6
```

### Backend không đọc được .env

**Nguyên nhân**: Đường dẫn sai

**Giải pháp**: Đảm bảo các file config đọc đúng:
```javascript
// backend/config/economy.js
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// backend/config/index.js  
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// backend/server.js
dotenv.config({ path: path.join(__dirname, '..', '.env') });
```

---

## 📊 KIỂM TRA HỆ THỐNG

### Test withdraw flow hoàn chỉnh:

```bash
# 1. Kiểm tra config
node test-withdraw-config.js

# 2. Test withdraw on-chain
npx hardhat run scripts/test-withdraw.js --network sepolia

# 3. Xem thông tin token
npx hardhat run scripts/bomdog-info.js --network sepolia

# 4. Kiểm tra backend
curl http://localhost:5000/health
```

### Xem trên blockchain:

```
Contract: https://sepolia.etherscan.io/address/0xcAb7EDB405E1A3072CdcE909AC75819B935EB85d

Withdrawer wallet: https://sepolia.etherscan.io/address/0x91439D81f62146F54E9310a27459994f0aA602D6
```

---

## 🎯 CHECKLIST HOÀN CHỈNH

### Setup lần đầu:
- [ ] Cài đặt dependencies (root, frontend, frontend-admin)
- [ ] Cấu hình .env đầy đủ
- [ ] Compile contracts
- [ ] Deploy BomdogToken contract
- [ ] Cập nhật BOMDOG_CONTRACT_ADDRESS vào .env
- [ ] Fund contract với token
- [ ] Test withdraw

### Trước khi chạy production:
- [ ] Bảo mật PRIVATE_KEY
- [ ] Withdrawer account có đủ ETH
- [ ] Contract có đủ BOMDOG token
- [ ] Database kết nối OK
- [ ] Backend chạy ổn định
- [ ] Frontend build OK

### Khi vận hành:
- [ ] Monitor contract balance thường xuyên
- [ ] Đảm bảo withdrawer account có ETH
- [ ] Backup database định kỳ
- [ ] Check withdraw requests pending
- [ ] Verify transactions trên Etherscan

---

## 💰 THÔNG TIN HIỆN TẠI

```
Contract Address: 0xcAb7EDB405E1A3072CdcE909AC75819B935EB85d
Network: Sepolia Testnet
Token: BOMDOG (18 decimals)

Owner/Withdrawer: 0x91439D81f62146F54E9310a27459994f0aA602D6
├─ BOMDOG balance: 5,000,000
├─ ETH balance: ~0.048 ETH
└─ Role: Deploy & Withdraw

Contract:
├─ BOMDOG balance: ~4,999,850
└─ Purpose: Source cho withdraw

Total Supply: 10,000,000 BOMDOG
```

---

## 📝 GHI CHÚ CUỐI

### Tài liệu bổ sung:
- Hardhat: https://hardhat.org/docs
- Ethers.js: https://docs.ethers.org/
- OpenZeppelin: https://docs.openzeppelin.com/

### Support:
- Sepolia Faucet: https://sepoliafaucet.com/
- Sepolia Explorer: https://sepolia.etherscan.io/

### Backup quan trọng:
- Lưu PRIVATE_KEY an toàn
- Backup file .env
- Backup database MongoDB
- Lưu contract address

---

**Dự án đã sẵn sàng hoạt động! 🎉**

Mọi thắc mắc, tham khảo file này hoặc check code trong các file đã đánh dấu ⭐

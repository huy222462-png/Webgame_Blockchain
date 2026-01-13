# 🎯 HƯỚNG DẪN NHANH - DEPLOY & DEMO CHO THẦY

## ⚡ Chuẩn bị trước (5 phút)

### 1. Kiểm tra môi trường
```powershell
# Kiểm tra Node.js
node --version  # Cần >= 16

# Kiểm tra MongoDB đã chạy chưa
mongod --version

# Kiểm tra MetaMask đã cài đặt chưa (Chrome/Firefox extension)
```

### 2. Cài đặt dependencies (nếu chưa)
```powershell
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

---

## 🚀 DEPLOY LÊN TESTNET (10-15 phút)

### Option A: Deploy lên Hera Testnet (Chain-296) - Giống Hardhat Tutorial

#### Bước 1: Cấu hình .env
Tạo/sửa file `.env` ở root:

```env
# Private key (QUAN TRỌNG: Không share với ai!)
PRIVATE_KEY=0x61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465

# MongoDB
MONGO_URI=mongodb://localhost:27017/blockchain-game

# JWT (optional)
JWT_SECRET=your-secret-key-here
```

#### Bước 2: Deploy tất cả contracts
```powershell
# Compile contracts
npm run compile

# Deploy lên Hera testnet (chain-296)
npm run deploy:all:hera
```

**Lưu ý:** Sau khi deploy xong, script sẽ tự động:
- ✅ Hiển thị địa chỉ các contracts
- ✅ Tạo file `frontend/.env.deployment` 
- ✅ Lưu deployment info vào `deployments/latest.json`

#### Bước 3: Copy environment variables
```powershell
# Copy file .env.deployment vào .env cho frontend
copy frontend\.env.deployment frontend\.env
```

Hoặc tự tạo `frontend/.env`:
```env
# Gaming Contracts (từ kết quả deploy)
VITE_TAIXIU_CONTRACT=0x...
VITE_FISHING_CONTRACT=0x...

# Tutorial Contracts (đã có sẵn)
VITE_COUNTER_CONTRACT=0x...
VITE_MYTOKEN_CONTRACT=0x73C6C18b1EDEB8319cA52f02f948c35FA8177401

# Network
VITE_CHAIN_ID=296
VITE_NETWORK_NAME=Hera Testnet
VITE_RPC_URL=https://testnet.hashio.io/api

# Backend
VITE_API_URL=http://localhost:5000
```

#### Bước 4: Verify deployment
```powershell
npm run verify:deployment
```

---

### Option B: Deploy lên Sepolia (Ethereum Testnet)

Nếu thầy muốn dùng Sepolia thay vì Hera:

```powershell
# Cần thêm vào .env:
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY

# Deploy
npm run deploy:all -- --network sepolia
```

---

## 🎮 CHẠY ỨNG DỤNG (5 phút)

### Bước 1: Start MongoDB
```powershell
# Terminal 1
mongod
```

### Bước 2: Start Backend
```powershell
# Terminal 2
npm run dev
```

Kết quả:
```
Server running on port 5000
MongoDB connected successfully
```

### Bước 3: Start Frontend
```powershell
# Terminal 3
npm run frontend
```

Kết quả:
```
VITE ready in 500ms
➜  Local:   http://localhost:5173/
```

---

## 🦊 CÀI ĐẶT METAMASK (5 phút)

### Bước 1: Thêm Hera Testnet vào MetaMask

**Mở MetaMask** → **Settings** → **Networks** → **Add Network** → **Add manually**

Điền thông tin:
```
Network Name: Hera Testnet
RPC URL: https://testnet.hashio.io/api
Chain ID: 296
Currency Symbol: HBAR
Block Explorer: https://testnet.hashio.io
```

### Bước 2: Import account test

**MetaMask** → **Account** → **Import Account**

Private Key: `0x61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465`

⚠️ **CHÚ Ý:** Đây là account test, KHÔNG dùng cho mainnet!

### Bước 3: Kiểm tra balance

Nếu không có testnet token:
- Vào faucet: https://testnet.hashio.io/api (tùy network)
- Hoặc dùng account có sẵn từ hardhat-tutorial

---

## 📱 DEMO CHO THẦY (15 phút)

### Part 1: Gaming Platform (5 phút)

#### 1. Kết nối MetaMask
- Mở http://localhost:5173
- Click **"Connect Wallet"**
- Chọn account đã import
- Confirm connection

#### 2. Demo Tài Xỉu Game
- Click vào **"Tài Xỉu"** tab
- Chọn **Tài** hoặc **Xỉu**
- Nhập số tiền cược (ví dụ: 0.01 ETH)
- Click **"Place Bet"**
- Confirm transaction trong MetaMask
- Xem kết quả roll xúc xắc
- Check win/lose status

#### 3. Demo Fishing Game
- Click vào **"Fishing"** tab
- Click **"Start Fishing Session"**
- Confirm transaction
- Click **"Cast Line"** để câu cá
- Xem loại cá bắt được (Small/Medium/Large/Rare/Epic)
- Check jackpot pool
- Claim rewards nếu có

#### 4. Xem Leaderboard
- Scroll xuống **Leaderboard** section
- Xem top players và scores
- Refresh để update real-time

---

### Part 2: Hardhat Tutorial Integration (5 phút)

#### 1. Counter Contract
- Scroll xuống **"Hardhat Tutorial Integration"** section
- Xem current counter value
- Click **"+1"** button → Counter tăng 1
- Click **"+5"** button → Counter tăng 5
- Click **"+10"** button → Counter tăng 10
- Confirm transactions và xem kết quả

#### 2. MyToken Contract
- Xem token balance (HBAR)
- Click **"Refresh"** để cập nhật
- Contract address hiển thị ở dưới

---

### Part 3: Giải thích Technical (5 phút)

#### Architecture Overview
```
Frontend (React)
    ↓ Ethers.js
Smart Contracts (Solidity)
    ↓ Events/Transactions
Backend (Express API)
    ↓ Mongoose
Database (MongoDB)
```

#### Key Features Demonstrated

1. **Blockchain Integration**
   - ✅ MetaMask wallet connection
   - ✅ Smart contract deployment
   - ✅ Transaction signing & confirmation
   - ✅ Event listening
   - ✅ Real-time updates

2. **Gaming Contracts**
   - ✅ TaiXiuGame: Betting logic với house edge
   - ✅ FishingGame: Probability-based rewards
   - ✅ ReentrancyGuard protection
   - ✅ Owner functions

3. **Tutorial Contracts**
   - ✅ Counter: Simple state management
   - ✅ MyToken: ERC20 standard implementation
   - ✅ Events & logging

4. **Full-stack Integration**
   - ✅ React frontend với Vite
   - ✅ Express REST API
   - ✅ MongoDB persistence
   - ✅ File upload (avatars)

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Cannot connect to MetaMask"
```
✅ Check MetaMask installed
✅ Check network = Hera (296)
✅ Refresh page
✅ Reconnect account
```

### Lỗi: "Insufficient funds"
```
✅ Check account balance > 0
✅ Get testnet tokens from faucet
✅ Switch to correct network
```

### Lỗi: "Contract not found"
```
✅ Check contract addresses in frontend/.env
✅ Verify contracts deployed: npm run verify:deployment
✅ Check network matches (Chain ID 296)
```

### Lỗi: "MongoDB connection failed"
```
✅ Start mongod in separate terminal
✅ Check MONGO_URI in .env
✅ Check MongoDB service running
```

### Lỗi: "Transaction failed"
```
✅ Check gas fee sufficient
✅ Check contract not paused
✅ Check input parameters valid
✅ See error in MetaMask/Console
```

---

## 📊 CHECKLIST TRƯỚC KHI DEMO

### Technical Checklist
- [ ] MongoDB running
- [ ] Backend API running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] All contracts deployed
- [ ] Contract addresses in frontend/.env
- [ ] MetaMask installed & configured
- [ ] Test account imported with balance
- [ ] Network = Hera Testnet (296)

### Demo Checklist
- [ ] Test connect wallet works
- [ ] Test Tài Xỉu game 1 round
- [ ] Test Fishing game 1 session
- [ ] Test Counter increment
- [ ] Check token balance displays
- [ ] Browser console clear (no errors)
- [ ] Screenshots/recordings ready

### Presentation Checklist
- [ ] Architecture diagram ready
- [ ] Contract addresses list ready
- [ ] Key features list ready
- [ ] Code snippets prepared (nếu cần)
- [ ] Deployment info ready
- [ ] Questions anticipated

---

## 📝 THÔNG TIN QUAN TRỌNG CHO BÁO CÁO

### Contract Addresses (Update sau khi deploy)
```
Gaming Contracts:
- TaiXiuGame:  0x________________
- FishingGame: 0x________________

Tutorial Contracts:
- Counter:     0x________________
- MyToken:     0x73C6C18b1EDEB8319cA52f02f948c35FA8177401
```

### Network Information
```
Network: Hera Testnet
Chain ID: 296
RPC URL: https://testnet.hashio.io/api
Explorer: https://testnet.hashio.io
```

### Repository Structure
```
✅ contracts/         - Smart contracts (Solidity)
✅ scripts/           - Deployment scripts
✅ test/              - Contract tests
✅ backend/           - Express API server
✅ frontend/          - React application
✅ hardhat-tutorial/  - Tutorial contracts (Counter, MyToken)
```

### Technologies Used
```
Frontend:  React 18 + Vite + Ethers.js v6
Backend:   Node.js + Express + MongoDB
Blockchain: Solidity 0.8.20 + Hardhat 3.1 + OpenZeppelin
Testing:   Chai + Mocha + Hardhat
```

---

## 🎓 CÂU HỎI THẦY CÓ THỂ HỎI & TRẢ LỜI

### Q1: "Tại sao dùng Hardhat thay vì Truffle?"
**A:** Hardhat có nhiều ưu điểm:
- Built-in network simulation
- TypeScript support
- Better error messages
- Plugin ecosystem phong phú
- Hardhat 3 Beta: Latest features

### Q2: "Smart contract có đảm bảo bảo mật không?"
**A:** Có, chúng em đã implement:
- ReentrancyGuard (OpenZeppelin)
- Owner-only functions
- Input validation
- Safe math operations (Solidity 0.8+)
- Event logging để audit

### Q3: "Làm sao verify random trong Tài Xỉu?"
**A:** Hiện tại dùng pseudo-random với:
- block.timestamp
- block.prevrandao
- player address

Trong production sẽ dùng Chainlink VRF (Verifiable Random Function)

### Q4: "Frontend kết nối blockchain như thế nào?"
**A:** 
1. MetaMask inject window.ethereum
2. Ethers.js tạo Provider/Signer
3. Contract instance với ABI
4. Call functions & listen events
5. Update UI real-time

### Q5: "Có deploy lên mainnet được không?"
**A:** Có thể, nhưng cần:
- Security audit professional
- Replace pseudo-random với Chainlink VRF
- Setup multi-sig wallet
- Comprehensive testing
- Sufficient ETH for gas

---

## ⏱️ TIMELINE DEMO 15 PHÚT

| Time | Activity |
|------|----------|
| 0:00 - 2:00 | Giới thiệu project overview & architecture |
| 2:00 - 7:00 | Demo Gaming Platform (Tài Xỉu + Fishing) |
| 7:00 - 10:00 | Demo Tutorial Integration (Counter + Token) |
| 10:00 - 13:00 | Show code & explain key concepts |
| 13:00 - 15:00 | Q&A |

---

## 🎉 TIPS DEMO THÀNH CÔNG

### 1. Chuẩn bị kỹ
- Test trước ít nhất 2 lần
- Có plan B nếu network chậm
- Prepare screenshots sẵn

### 2. Trong khi demo
- Nói rõ từng bước
- Show transaction hash trên explorer
- Explain waiting time (block confirmation)
- Point out key features

### 3. Xử lý tình huống
- Nếu transaction pending lâu → Show previous success screenshots
- Nếu MetaMask lỗi → Reload page
- Nếu network chậm → Explain về gas & network congestion

### 4. Kết thúc mạnh
- Summary key achievements
- Mention future improvements
- Confident về technical knowledge

---

**🚀 CHÚC BẠN DEMO THÀNH CÔNG! 🚀**

_Nếu có vấn đề gì, check lại các bước hoặc xem console errors._

# 📚 HƯỚNG DẪN TOÀN DIỆN DỰ ÁN WEBGAME BLOCKCHAIN

## 🎯 TỔNG QUAN DỰ ÁN

**Bomdog Clicker Game** - Game click kiếm tiền với blockchain, cho phép rút tiền thật qua Ethereum/Sepolia.

### Luồng hoạt động chính:
1. User login bằng ví MetaMask
2. Click vào Bomdog → Nhận điểm (points)
3. Đổi điểm → Nhận BOMDOG Coin (trong database)
4. Tạo yêu cầu rút tiền → Admin duyệt
5. Backend gửi token thật từ blockchain → Ví user

---

## 📁 CẤU TRÚC PROJECT

```
Webgame_Blockchain-main/
├── backend/                    # ⭐ Server Node.js - QUAN TRỌNG NHẤT
├── frontend/                   # 🎮 Game interface cho users
├── frontend-admin/            # 👨‍💼 Admin panel quản lý
├── contracts/                 # 📜 Smart contracts Solidity
├── scripts/                   # 🚀 Deploy & utility scripts
├── Huong-Dan/                # 📖 Tài liệu tiếng Việt
└── .env                      # ⚙️ Config (KHÔNG COMMIT)
```

---

## 🔥 CÁC FILE QUAN TRỌNG NHẤT

### 1. **backend/server.js** ⭐⭐⭐
**Vai trò:** Server chính, điểm bắt đầu của backend
```javascript
// Khởi động server
// Kết nối MongoDB
// Load routes
// Lắng nghe port 5000
```

**Chức năng:**
- Khởi tạo Express server
- Kết nối database MongoDB
- Cấu hình CORS cho frontend
- Load tất cả routes (API endpoints)

---

### 2. **backend/routes/** ⭐⭐⭐
**Vai trò:** Định nghĩa các API endpoints

#### **economyRoutes.js** - QUAN TRỌNG
```javascript
POST /api/wallet/exchange    // Đổi points → coins
POST /api/wallet/upgrade     // Nâng cấp click/idle
POST /api/wallet/withdraw    // Tạo yêu cầu rút tiền
GET  /api/wallet/economy/:address  // Xem thông tin user
```

#### **adminRoutes.js**
```javascript
POST /api/admin/login                    // Đăng nhập admin
GET  /api/admin/withdraw-requests        // Danh sách yêu cầu rút tiền
POST /api/admin/withdraw-requests/:id    // Duyệt/từ chối rút tiền
```

#### **walletRoutes.js**
```javascript
POST /api/wallet/connect     // Kết nối ví MetaMask
GET  /api/wallet/:address    // Lấy thông tin ví
```

---

### 3. **backend/controllers/** ⭐⭐⭐
**Vai trò:** Xử lý logic nghiệp vụ, gọi services

#### **walletEconomyController.js** - QUAN TRỌNG NHẤT
```javascript
exports.withdraw = async (req, res) => {
  // Nhận request từ user muốn rút tiền
  // Gọi economyService.withdraw()
  // Tạo WithdrawHistory trong DB
  // Trạng thái: pending (chờ admin duyệt)
}

exports.exchangePoints = async (req, res) => {
  // User đổi points → coins
  // Points giảm, coins tăng (trong DB)
}
```

#### **walletEconomyAdminController.js**
```javascript
exports.reviewWithdrawRequest = async (req, res) => {
  // Admin approve/reject withdrawal
  // Nếu approve → Gọi performWithdrawOnChain()
  // Gửi token thật từ blockchain
}
```

---

### 4. **backend/services/walletEconomyService.js** ⭐⭐⭐⭐⭐
**Vai trò:** TRÁI TIM CỦA HỆ THỐNG - Xử lý blockchain withdrawal

#### **performWithdrawOnChain()** - HÀM QUAN TRỌNG NHẤT
```javascript
async function performWithdrawOnChain(targetAddress, amount, preferredNetwork) {
  // BƯỚC 1: Xác định network (Ethereum hoặc Hedera)
  const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(targetAddress);
  
  if (useEthereum) {
    // BƯỚC 2: Kết nối với contract ERC20
    const { contract, config } = getWithdrawContract();
    
    // BƯỚC 3: Chuyển đổi số lượng theo decimals (18)
    const scaledAmount = ethers.parseUnits(amount.toString(), 18);
    
    // BƯỚC 4: Gọi function transfer() của ERC20
    const fn = contract.getFunction('transfer(address,uint256)');
    const txResponse = await fn(targetAddress, scaledAmount);
    
    // BƯỚC 5: Đợi transaction confirm
    const receipt = await txResponse.wait();
    
    // BƯỚC 6: Trả về transaction hash
    return { txHash: receipt.hash, network: 'ethereum' };
  }
}
```

**Flow chi tiết:**
1. Admin approve withdrawal request
2. Backend đọc BOMDOG_WITHDRAWER_KEY từ .env
3. Tạo wallet instance với private key
4. Kết nối smart contract: `0x73C6C18b1EDEB8319cA52f02f948c35FA8177401`
5. Gọi `transfer(userAddress, amount)`
6. Token BOMDOG chuyển từ withdrawer wallet → user wallet
7. User nhận token trong MetaMask

---

### 5. **backend/models/** ⭐⭐⭐
**Vai trò:** Schema MongoDB, định nghĩa cấu trúc dữ liệu

#### **WalletUser.js** - QUAN TRỌNG
```javascript
{
  walletAddress: String,      // 0x... (unique)
  networkType: String,        // 'ethereum' hoặc 'hedera'
  points: Number,             // Điểm từ click
  bomdogCoin: Number,        // Coin đã đổi (trong DB, chưa rút)
  lockedBomdogCoin: Number,  // Coin đang chờ withdraw
  clickLevel: Number,         // Level click (tăng points/click)
  idleLevel: Number,          // Level idle (tăng coins tự động)
  lastClaimTime: Date,        // Lần cuối claim idle rewards
}
```

#### **WithdrawHistory.js** - QUAN TRỌNG
```javascript
{
  walletAddress: String,      // User yêu cầu rút
  targetAddress: String,      // Địa chỉ nhận (có thể khác)
  network: String,            // 'ethereum' hoặc 'hedera'
  amount: Number,             // Số lượng rút
  status: String,             // 'pending', 'approved', 'rejected', 'failed'
  txHash: String,             // Hash transaction blockchain
  approvedBy: ObjectId,       // Admin ID
  approvedAt: Date,
  note: String
}
```

---

### 6. **backend/config/economy.js** ⭐⭐⭐
**Vai trò:** Cấu hình game economy & blockchain

```javascript
// Game economy
const exchangeRatePoints = 1000;  // 1000 points = 10 coins
const exchangeRateCoin = 10;
const minWithdraw = 50;           // Tối thiểu 50 BOMDOG

// Blockchain config
const rpcUrl = process.env.BOMDOG_RPC_URL;
// https://ethereum-sepolia-rpc.publicnode.com

const contractAddress = process.env.BOMDOG_CONTRACT_ADDRESS;
// 0x73C6C18b1EDEB8319cA52f02f948c35FA8177401

const withdrawerKey = process.env.BOMDOG_WITHDRAWER_KEY;
// Private key ví chứa 10M BOMDOG

const abi = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)'
];
```

**Hàm quan trọng:**
```javascript
function getPointsPerClick(level) {
  // Level 1: 25 points/click
  // Level 2: 31 points/click
  // Công thức: basePoints * (1.25 ^ (level-1))
}

function getUpgradeCost(level) {
  // Level 1→2: 30 coins
  // Level 2→3: 45 coins
  // Công thức: baseCost * (1.5 ^ (level-1))
}
```

---

### 7. **contracts/BomdogToken.sol** ⭐⭐⭐
**Vai trò:** ERC20 Token contract trên blockchain

```solidity
contract BomdogToken is ERC20, Ownable {
    constructor(uint256 initialSupply, uint8 tokenDecimals) 
        ERC20("Bomdog Coin", "BOMDOG") 
    {
        _decimals = tokenDecimals;  // 18
        _mint(msg.sender, initialSupply);  // 10,000,000 BOMDOG
    }
    
    // Kế thừa từ ERC20:
    // - transfer(to, amount)     ← Backend gọi hàm này
    // - balanceOf(account)
    // - approve(spender, amount)
}
```

**Deployed tại:** `0x73C6C18b1EDEB8319cA52f02f948c35FA8177401` (Sepolia)

---

### 8. **frontend/src/** ⭐⭐
**Vai trò:** Giao diện game cho users

#### **app.js** - Main game logic
```javascript
// Kết nối MetaMask
async function connectWallet() {
  const accounts = await ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  walletAddress = accounts[0];
  // Gọi API: POST /api/wallet/connect
}

// Click Bomdog
function handleClick() {
  clickCount++;
  // Gọi API: POST /api/wallet/click
  updateUI();
}

// Đổi points
async function exchangePoints() {
  // Gọi API: POST /api/wallet/exchange
  // Body: { walletAddress, pointsToExchange }
}

// Rút tiền
async function withdraw() {
  // Gọi API: POST /api/wallet/withdraw
  // Body: { walletAddress, amount, targetAddress, network }
}
```

---

### 9. **frontend-admin/src/** ⭐⭐
**Vai trò:** Admin panel quản lý withdrawals

#### **Withdraw Management**
```javascript
// Lấy danh sách pending withdrawals
async function getWithdrawRequests() {
  // GET /api/admin/withdraw-requests?status=pending
}

// Approve withdrawal
async function approveWithdraw(requestId) {
  // POST /api/admin/withdraw-requests/:id
  // Body: { approve: true, note: "OK" }
  
  // Backend sẽ:
  // 1. Gọi performWithdrawOnChain()
  // 2. Gửi token từ blockchain
  // 3. Cập nhật status → 'approved'
  // 4. Lưu txHash
}
```

---

## 🔄 LUỒNG DỮ LIỆU CHI TIẾT

### 1. **User Click → Earn Points**
```
[Frontend] handleClick()
    ↓
[API] POST /api/wallet/click
    ↓
[Controller] walletEconomyController.recordClick()
    ↓
[Service] walletEconomyService.recordClick()
    ↓
[Model] WalletUser.points += pointsPerClick
    ↓
[Database] MongoDB lưu points mới
    ↓
[Response] { points: 125, score: 125, clicksProcessed: 1 }
```

### 2. **Exchange Points → Get Coins**
```
[Frontend] exchangePoints(1000)
    ↓
[API] POST /api/wallet/exchange
    ↓
[Controller] walletEconomyController.exchangePoints()
    ↓
[Service] walletEconomyService.exchangePoints()
    ↓
[Validation] 
  - points >= 1000? ✓
  - points % 1000 === 0? ✓
    ↓
[Database Transaction]
  - WalletUser.points -= 1000
  - WalletUser.bomdogCoin += 10
  - ExchangeHistory.create()
    ↓
[Response] { bomdogCoin: 110, points: 0 }
```

### 3. **Withdraw Request → Blockchain Transfer**
```
[Frontend] withdraw(50 BOMDOG)
    ↓
[API] POST /api/wallet/withdraw
    ↓
[Controller] walletEconomyController.withdraw()
    ↓
[Service] walletEconomyService.withdraw()
    ↓
[Validation]
  - amount >= 50? ✓
  - bomdogCoin >= 50? ✓
    ↓
[Database Transaction]
  - WalletUser.bomdogCoin -= 50
  - WalletUser.lockedBomdogCoin += 50
  - WithdrawHistory.create({ status: 'pending' })
    ↓
[Admin Panel] Hiển thị pending request
    ↓
[Admin] Click "Approve"
    ↓
[API] POST /api/admin/withdraw-requests/:id
    ↓
[Controller] walletEconomyAdminController.reviewWithdrawRequest()
    ↓
[Service] walletEconomyService.performWithdrawOnChain()
    ↓
[Blockchain]
  1. Load withdrawer wallet (private key từ .env)
  2. Connect to BOMDOG contract (0x73C6...)
  3. Call: contract.transfer(userAddress, 50e18)
  4. Wait for confirmation
    ↓
[Transaction Confirmed]
  - TX Hash: 0x5b36f8d7...
  - Gas used: ~50,000
  - Status: Success
    ↓
[Database Update]
  - WithdrawHistory.status = 'approved'
  - WithdrawHistory.txHash = '0x5b36...'
  - WalletUser.lockedBomdogCoin -= 50
    ↓
[User MetaMask] Nhận 50 BOMDOG token!
```

---

## ⚙️ CÁC FILE CẤU HÌNH

### **backend/.env** ⭐⭐⭐⭐⭐
```env
# Database
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-super-secret-key

# Blockchain - QUAN TRỌNG NHẤT
BOMDOG_CONTRACT_ADDRESS=0x73C6C18b1EDEB8319cA52f02f948c35FA8177401
BOMDOG_WITHDRAWER_KEY=61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465
BOMDOG_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
BOMDOG_WITHDRAW_METHOD=transfer(address,uint256)
BOMDOG_COIN_DECIMALS=18
BOMDOG_MIN_WITHDRAW=50
```

### **hardhat.config.js** ⭐⭐
```javascript
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    }
  }
};
```

---

## 🚀 CÁC SCRIPT QUAN TRỌNG

### **scripts/deploy-bomdog-simple.js** ⭐⭐⭐
```javascript
// Deploy BOMDOG Token lên Sepolia
async function main() {
  const BomdogToken = await ethers.getContractFactory("BomdogToken");
  const token = await BomdogToken.deploy(
    ethers.parseUnits("10000000", 18),  // 10M tokens
    18  // decimals
  );
  
  console.log("Token deployed:", await token.getAddress());
  // Output: 0x73C6C18b1EDEB8319cA52f02f948c35FA8177401
}
```

**Chạy:**
```bash
npx hardhat run scripts/deploy-bomdog-simple.js --network sepolia
```

---

## 🗂️ CÁC FILE PHỤ (Ít quan trọng hơn)

### **backend/middleware/**
- `auth.js` - Xác thực JWT token cho users
- `adminAuth.js` - Xác thực admin
- `checkDB.js` - Kiểm tra MongoDB connection

### **backend/models/** (khác)
- `ExchangeHistory.js` - Lịch sử đổi points
- `UpgradeHistory.js` - Lịch sử nâng cấp
- `GameHistory.js` - Lịch sử chơi game

### **Huong-Dan/**
Tài liệu hướng dẫn tiếng Việt (có thể đọc thêm)

---

## 📊 KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Click   │  │ Exchange │  │ Withdraw │                 │
│  │  Bomdog  │  │  Points  │  │  Coins   │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
└───────┼─────────────┼─────────────┼────────────────────────┘
        │             │             │
        │    HTTP     │    HTTP     │    HTTP
        │    POST     │    POST     │    POST
        ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes → Controllers → Services → Database          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────┐              │
│  │  walletEconomyService.js                │              │
│  │  ┌───────────────────────────────────┐  │              │
│  │  │ performWithdrawOnChain()          │  │              │
│  │  │   ├─ Load private key             │  │              │
│  │  │   ├─ Connect to contract          │  │              │
│  │  │   └─ Call transfer()              │  │              │
│  │  └───────────────┬───────────────────┘  │              │
│  └──────────────────┼──────────────────────┘              │
└───────────────────────┼──────────────────────────────────────┘
                        │ ethers.js
                        │ RPC call
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              ETHEREUM BLOCKCHAIN (Sepolia)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  BOMDOG Token (ERC20)                              │    │
│  │  Address: 0x73C6C18b1EDEB8319cA52f02f948c35FA8177401 │    │
│  │                                                     │    │
│  │  function transfer(address to, uint256 amount)     │    │
│  │    ├─ From: Withdrawer Wallet (0x9143...)         │    │
│  │    └─ To: User Wallet (0x...)                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ Transaction
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   USER METAMASK WALLET                      │
│                 Nhận BOMDOG Token                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 FLOW TIỀN & TOKEN

### **Trong Database (MongoDB):**
```
User chơi game → Points (ảo)
Points → Exchange → BOMDOG Coins (ảo, trong DB)
```

### **Trên Blockchain (Thật):**
```
Deploy contract → 10M BOMDOG → Withdrawer Wallet
Admin approve → Transfer → User Wallet (THẬT)
```

### **Ví Withdrawer (Quan trọng!):**
- Address: `0x91439D81f62146F54E9310a27459994f0aA602D6`
- Private Key: Lưu trong `BOMDOG_WITHDRAWER_KEY`
- Chứa: 10,000,000 BOMDOG
- Cần: ETH để trả gas fees (~$0.01/transaction)

---

## 🔐 BẢO MẬT

### **TUYỆT ĐỐI KHÔNG:**
- ❌ Commit file `.env` lên git
- ❌ Share private key với ai
- ❌ Deploy lên production mà không đổi JWT_SECRET

### **NÊN LÀM:**
- ✅ Dùng .gitignore để ignore .env
- ✅ Backup private key ở nơi an toàn
- ✅ Dùng environment variables trên hosting
- ✅ Enable 2FA trên ví withdrawer

---

## 📈 NÂNG CẤP TƯƠNG LAI

### **Có thể thêm:**
1. **Tự động approve** cho số tiền nhỏ (< 100 BOMDOG)
2. **Rate limiting** để chống spam withdraw
3. **Email notification** khi withdrawal thành công
4. **Multi-signature wallet** cho withdrawer (bảo mật cao hơn)
5. **Dashboard thống kê** cho admin
6. **Leaderboard** top earners

---

## 🆘 XỬ LÝ LỖI

### **Withdrawal failed:**
1. Kiểm tra BOMDOG_WITHDRAWER_KEY đúng chưa
2. Withdrawer wallet có đủ ETH gas không?
3. Withdrawer wallet có đủ BOMDOG không?
4. RPC URL có hoạt động không?

### **Token không hiện trong MetaMask:**
1. Đảm bảo đang ở Sepolia network
2. Import token với address: `0x73C6C18b1EDEB8319cA52f02f948c35FA8177401`
3. Check transaction trên Etherscan

---

## 📝 CHECKLIST DEPLOY

### **Trước khi production:**
- [ ] Đổi JWT_SECRET thành random string
- [ ] Cấu hình MongoDB production
- [ ] Deploy contract lên Ethereum Mainnet
- [ ] Nạp ETH vào withdrawer wallet
- [ ] Nạp BOMDOG vào withdrawer wallet
- [ ] Test withdrawal end-to-end
- [ ] Setup monitoring & alerts
- [ ] Backup database
- [ ] Setup SSL/HTTPS

---

## 🎓 HỌC THÊM

### **Blockchain:**
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Hardhat Tutorial](https://hardhat.org/tutorial)
- [ERC20 Standard](https://eips.ethereum.org/EIPS/eip-20)

### **Backend:**
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Mongoose](https://mongoosejs.com/docs/guide.html)
- [JWT Authentication](https://jwt.io/introduction)

---

## ✅ TÓM TẮT NHANH

**File chủ chốt cần hiểu:**
1. `backend/server.js` - Khởi động server
2. `backend/services/walletEconomyService.js` - Xử lý blockchain
3. `backend/controllers/walletEconomyController.js` - API logic
4. `backend/config/economy.js` - Config game & blockchain
5. `contracts/BomdogToken.sol` - ERC20 token
6. `backend/.env` - Configuration (QUAN TRỌNG NHẤT)

**Flow quan trọng nhất:**
```
User withdraw → Admin approve → performWithdrawOnChain() 
→ contract.transfer() → Token chuyển qua blockchain → User nhận trong MetaMask
```

**3 thành phần chính:**
1. **Frontend** - Giao diện game
2. **Backend** - Xử lý logic, kết nối blockchain
3. **Smart Contract** - Lưu trữ & chuyển token trên blockchain

---

🎉 **Chúc bạn thành công với dự án!**

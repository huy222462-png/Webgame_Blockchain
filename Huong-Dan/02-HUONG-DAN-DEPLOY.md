# 🚀 Hướng Dẫn Deploy Tích Hợp Web + Hardhat Tutorial

## 📋 Tổng Quan

Bạn có **2 phần dự án** cần deploy:

### 1. **Web Gaming Platform** (Root project)
- **Smart Contracts:** TaiXiuGame.sol, FishingGame.sol
- **Frontend:** React app (game UI)
- **Backend:** Express API + MongoDB
- **Hardhat Config:** `hardhat.config.js` (root)

### 2. **Hardhat Tutorial** (backend/hardhat-tutorial/)
- **Smart Contracts:** Counter.sol, MyToken.sol
- **Đã deploy:** Chain-296 (OP testnet) - MyToken: `0x73C6C18b1EDEB8319cA52f02f948c35FA8177401`
- **Hardhat Config:** `hardhat.config.ts` (TypeScript)

---

## 🎯 Phương Án Deploy Kết Hợp

### **Option 1: Deploy Riêng Biệt Trên Cùng 1 Network** ⭐ (Đề xuất)

Deploy tất cả contracts lên **cùng 1 network** (ví dụ: Sepolia, Mumbai, hoặc chain của trường)

#### **Ưu điểm:**
- ✅ Dễ quản lý, contracts có thể tương tác với nhau
- ✅ Chỉ cần 1 network trong MetaMask
- ✅ Frontend có thể kết nối tất cả contracts cùng lúc
- ✅ Phù hợp cho demo/presentation

#### **Cách thực hiện:**

##### **Bước 1: Chọn Network Deploy**

**Nếu thầy yêu cầu chain cụ thể:**
```bash
# Ví dụ: Chain-296 (Hera testnet) - đã có trong hardhat-tutorial
```

**Nếu tự chọn, đề xuất:**
- **Sepolia** (Ethereum testnet) - Phổ biến, nhiều tài liệu
- **Mumbai** (Polygon testnet) - Gas rẻ, nhanh
- **Goerli** (Ethereum testnet) - Ổn định

##### **Bước 2: Cấu Hình Network Chung**

Cập nhật `hardhat.config.js` (root) với network của hardhat-tutorial:

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Thêm network từ hardhat-tutorial
    hera: {
      url: "https://testnet.hashio.io/api",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 296
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  }
};
```

##### **Bước 3: Deploy Gaming Contracts Lên Cùng Network**

```bash
# Từ root directory
npx hardhat run scripts/deploy.js --network hera
# hoặc
npx hardhat run scripts/deploy.js --network sepolia
```

**Lưu lại địa chỉ contracts:**
```
TaiXiuGame deployed to: 0x...
FishingGame deployed to: 0x...
```

##### **Bước 4: Deploy Hardhat Tutorial Contracts (nếu chưa)**

```bash
cd backend/hardhat-tutorial
npx hardhat ignition deploy ignition/modules/MyToken.ts --network Hera
npx hardhat ignition deploy ignition/modules/Counter.ts --network Hera
```

**Contracts đã có:**
- MyToken: `0x73C6C18b1EDEB8319cA52f02f948c35FA8177401` (chain-296)

##### **Bước 5: Cấu Hình Frontend Tích Hợp**

Tạo `frontend/.env`:

```env
# Gaming contracts
VITE_TAIXIU_CONTRACT=0x... (từ bước 3)
VITE_FISHING_CONTRACT=0x... (từ bước 3)

# Tutorial contracts
VITE_MYTOKEN_CONTRACT=0x73C6C18b1EDEB8319cA52f02f948c35FA8177401
VITE_COUNTER_CONTRACT=0x... (từ bước 4)

# Backend API
VITE_API_URL=http://localhost:5000

# Network
VITE_CHAIN_ID=296
VITE_NETWORK_NAME=Hera Testnet
VITE_RPC_URL=https://testnet.hashio.io/api
```

##### **Bước 6: Tạo Component Tích Hợp Trong Frontend**

Tạo file `frontend/src/TutorialIntegration.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Import ABIs
import CounterABI from '../../../backend/hardhat-tutorial/artifacts/contracts/Counter.sol/Counter.json';
import MyTokenABI from '../../../backend/hardhat-tutorial/artifacts/contracts/MyToken.sol/MyToken.json';

function TutorialIntegration() {
  const [counter, setCounter] = useState(0);
  const [tokenBalance, setTokenBalance] = useState('0');
  
  const counterAddress = import.meta.env.VITE_COUNTER_CONTRACT;
  const tokenAddress = import.meta.env.VITE_MYTOKEN_CONTRACT;

  async function loadData() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Counter contract
    const counterContract = new ethers.Contract(
      counterAddress, 
      CounterABI.abi, 
      signer
    );
    const x = await counterContract.x();
    setCounter(x.toString());
    
    // MyToken contract
    const tokenContract = new ethers.Contract(
      tokenAddress,
      MyTokenABI.abi,
      signer
    );
    const balance = await tokenContract.balanceOf(signer.address);
    setTokenBalance(ethers.formatEther(balance));
  }

  async function incrementCounter() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(counterAddress, CounterABI.abi, signer);
    
    const tx = await contract.inc();
    await tx.wait();
    await loadData();
  }

  useEffect(() => {
    if (window.ethereum) loadData();
  }, []);

  return (
    <div className="tutorial-section">
      <h2>🎓 Hardhat Tutorial Integration</h2>
      
      <div className="counter-widget">
        <h3>Counter Contract</h3>
        <p>Current Value: {counter}</p>
        <button onClick={incrementCounter}>Increment (+1)</button>
      </div>
      
      <div className="token-widget">
        <h3>MyToken (HBAR)</h3>
        <p>Your Balance: {tokenBalance} HBAR</p>
      </div>
      
      <div className="contract-info">
        <p>Counter: <code>{counterAddress}</code></p>
        <p>MyToken: <code>{tokenAddress}</code></p>
      </div>
    </div>
  );
}

export default TutorialIntegration;
```

##### **Bước 7: Update App.jsx**

```jsx
import TaiXiuGame from './TaiXiuGame';
import FishingGame from './FishingGame';
import TutorialIntegration from './TutorialIntegration';

function App() {
  return (
    <div className="App">
      <h1>🎮 Blockchain Gaming Platform</h1>
      
      {/* Gaming Section */}
      <section className="games">
        <TaiXiuGame />
        <FishingGame />
      </section>
      
      {/* Tutorial Section */}
      <section className="tutorial">
        <TutorialIntegration />
      </section>
    </div>
  );
}
```

##### **Bước 8: Deploy Backend + Frontend**

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
npm run dev

# Terminal 3: Start Frontend
cd frontend && npm run dev
```

---

### **Option 2: Deploy Riêng 2 Ứng Dụng Độc Lập**

Nếu thầy muốn demo riêng biệt:

#### **A. Gaming Platform**
- Deploy contracts: TaiXiuGame, FishingGame
- Frontend: Gaming UI
- URL: `http://localhost:5173`

#### **B. Hardhat Tutorial**
- Contracts: Counter, MyToken (đã deploy chain-296)
- Tạo frontend riêng cho tutorial
- URL: `http://localhost:5174`

**Cách làm:**
```bash
# Tạo frontend cho tutorial
cd backend/hardhat-tutorial
mkdir frontend
cd frontend
npm create vite@latest . -- --template react
# Copy code TutorialIntegration.jsx vào đây
```

---

## 📝 Chuẩn Bị Báo Cáo Cho Thầy

### **1. Document Deployment**

Tạo file `DEPLOYMENT_REPORT.md`:

```markdown
# Báo Cáo Deploy Dự Án

## 1. Gaming Platform Contracts

| Contract | Address | Network | TX Hash |
|----------|---------|---------|---------|
| TaiXiuGame | 0x... | Hera (296) | 0x... |
| FishingGame | 0x... | Hera (296) | 0x... |

## 2. Tutorial Contracts

| Contract | Address | Network | TX Hash |
|----------|---------|---------|---------|
| MyToken | 0x73C6...7401 | Hera (296) | 0x... |
| Counter | 0x... | Hera (296) | 0x... |

## 3. Demo URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Blockchain Explorer:** https://testnet.hashio.io

## 4. Test Accounts

- Address: 0x...
- Private Key: (giữ bí mật)
- Testnet Balance: X ETH
```

### **2. Chuẩn Bị Demo**

**Checklist:**
- [ ] MetaMask kết nối đúng network
- [ ] Account có đủ gas fee
- [ ] All contracts deployed successfully
- [ ] Frontend hiển thị đúng
- [ ] Test mỗi chức năng 1 lần
- [ ] Screenshot kết quả
- [ ] Video demo (nếu cần)

### **3. Kiểm Tra Trước Khi Demo**

```bash
# 1. Verify contracts deployed
npx hardhat verify --network hera <contract-address>

# 2. Test frontend locally
cd frontend && npm run dev

# 3. Check backend API
curl http://localhost:5000/api/health

# 4. Test contract functions
npx hardhat console --network hera
> const Contract = await ethers.getContractAt("TaiXiuGame", "0x...")
> await Contract.gameCounter()
```

---

## 🔧 Troubleshooting

### **Lỗi: Network không khớp**
```bash
# Kiểm tra chainId
npx hardhat run scripts/check-network.js --network hera
```

### **Lỗi: Insufficient funds**
```bash
# Get testnet tokens
# Hera: https://testnet.hashio.io/api (faucet)
# Sepolia: https://sepoliafaucet.com
```

### **Lỗi: Contract not deployed**
```bash
# Re-deploy
npx hardhat run scripts/deploy.js --network hera
```

---

## 📞 Support

Nếu gặp vấn đề:
1. Check console errors (F12)
2. Check network connection
3. Verify contract addresses
4. Check MetaMask network

---

## ✅ Final Checklist

- [ ] All contracts deployed to same network
- [ ] Frontend .env configured correctly
- [ ] Backend connected to MongoDB
- [ ] MetaMask setup correctly
- [ ] Test all game functions
- [ ] Test tutorial contracts
- [ ] Documentation complete
- [ ] Screenshots/video ready
- [ ] Presentation prepared

**🎉 Chúc bạn demo thành công!**

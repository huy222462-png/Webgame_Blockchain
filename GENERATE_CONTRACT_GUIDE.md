# 🏭 HƯỚNG DẪN SINH SMART CONTRACT TỰ ĐỘNG

## 📚 CÁC CÁCH SINH CONTRACT

### **CÁCH 1: Dùng CLI Generator (Khuyến nghị)**

Tool tự động sinh contract từ template.

**Chạy:**
```bash
node scripts/generate-contract.js
```

**Chọn loại contract:**
1. **ERC20 Token** - Token tiền điện tử
2. **Game Contract** - Contract game với score/level
3. **NFT Collection** - ERC721 NFT

**Ví dụ:**
```bash
$ node scripts/generate-contract.js

🚀 SMART CONTRACT GENERATOR

Chọn loại contract:
1. ERC20 Token
2. Game Contract
3. NFT Collection (ERC721)

Nhập số (1-3): 1
Tên token (vd: MyToken): GameCoin
Symbol (vd: MTK): GMC
Decimals (18): 18

✅ Contract đã được tạo!
📁 File: contracts/GameCoinToken.sol
```

**Kết quả:**
- ✅ File contract: `contracts/GameCoinToken.sol`
- ✅ Deploy script: `scripts/deploy-GameCoinToken.js`
- ✅ Sẵn sàng compile & deploy

---

### **CÁCH 2: Factory Contract (On-chain)**

Deploy contracts trực tiếp từ blockchain.

**Deploy Factory:**
```bash
npx hardhat run scripts/deploy-factory.js --network sepolia
```

**Tạo contract mới:**
```javascript
// Từ frontend hoặc console
const factory = await ethers.getContractAt("ContractFactory", factoryAddress);
const tx = await factory.deploySimpleGame();
const receipt = await tx.wait();

// Lấy địa chỉ contract mới
const newGameAddress = receipt.events[0].args.contractAddress;
console.log("Game mới:", newGameAddress);
```

**Lợi ích:**
- ⚡ Không cần compile lại
- 🔄 Tạo nhiều contracts giống nhau
- 🎮 Users có thể tạo game riêng

---

## 📝 TEMPLATES CÓ SẴN

### **1. ERC20 Token Template**
```solidity
contract MyToken is ERC20, Ownable {
    - Mint/Burn tokens
    - Custom decimals
    - Owner controls
}
```

### **2. Game Contract Template**
```solidity
contract MyGame {
    - Player registration
    - Score tracking
    - Level system
    - Auto level-up
}
```

### **3. NFT Collection Template**
```solidity
contract MyNFT is ERC721 {
    - Mint NFTs
    - Set metadata URI
    - Max supply control
    - Mint price
}
```

---

## 🚀 QUY TRÌNH ĐẦY ĐỦ

### **Bước 1: Sinh Contract**
```bash
node scripts/generate-contract.js
```

### **Bước 2: Compile**
```bash
npx hardhat compile
```

### **Bước 3: Test (Optional)**
Tạo file `test/GameCoinToken.test.js`:
```javascript
const { expect } = require("chai");

describe("GameCoinToken", function () {
  it("Should deploy with correct supply", async function () {
    const Token = await ethers.getContractFactory("GameCoinToken");
    const token = await Token.deploy(
      ethers.parseUnits("1000000", 18),
      18
    );
    
    const supply = await token.totalSupply();
    expect(supply).to.equal(ethers.parseUnits("1000000", 18));
  });
});
```

**Chạy test:**
```bash
npx hardhat test
```

### **Bước 4: Deploy**
```bash
npx hardhat run scripts/deploy-GameCoinToken.js --network sepolia
```

### **Bước 5: Verify trên Etherscan**
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## 🔧 TÙY CHỈNH TEMPLATE

### **Thêm template mới:**

Mở `scripts/generate-contract.js` và thêm vào object `templates`:

```javascript
const templates = {
  // ... templates cũ
  
  marketplace: (name) => `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ${name}Marketplace {
    // Logic marketplace của bạn
}`,
};
```

Thêm option trong menu:
```javascript
console.log('4. Marketplace Contract');

// ... trong if-else
else if (choice === '4') {
  const name = await question('Tên marketplace: ');
  contractCode = templates.marketplace(name);
  fileName = `${name}Marketplace.sol`;
}
```

---

## 📊 SO SÁNH CÁC PHƯƠNG PHÁP

| Tính năng | CLI Generator | Factory Contract |
|-----------|---------------|------------------|
| Tốc độ | Nhanh | Rất nhanh |
| Chi phí gas | Không | Có (deploy cost) |
| Tùy biến | Cao | Giới hạn |
| Dùng cho | Development | Production |
| Cần compile | Có | Không |

---

## 💡 USE CASES

### **Cho giáo viên/demo:**
```bash
# Tạo token nhanh
node scripts/generate-contract.js
# Chọn 1 → Nhập tên → Xong!

# Compile
npx hardhat compile

# Deploy testnet
npx hardhat run scripts/deploy-MyToken.js --network sepolia
```

### **Cho dự án thật:**
1. Tạo contract với CLI
2. Chỉnh sửa logic theo yêu cầu
3. Viết tests
4. Audit code
5. Deploy production

### **Cho game platform:**
- Dùng Factory để users tạo game riêng
- Mỗi user = 1 game contract
- Factory quản lý tất cả

---

## 🎯 VÍ DỤ THỰC TẾ

### **Tạo GameFi Token:**
```bash
$ node scripts/generate-contract.js
Chọn: 1 (ERC20)
Tên: PlayToEarn
Symbol: PTE
Decimals: 18

✅ Tạo: contracts/PlayToEarnToken.sol
✅ Deploy: scripts/deploy-PlayToEarnToken.js
```

### **Tạo Racing Game:**
```bash
$ node scripts/generate-contract.js
Chọn: 2 (Game)
Tên: Racing

✅ Tạo: contracts/RacingGame.sol
✅ Deploy: scripts/deploy-RacingGame.js
```

### **Tạo Character NFT:**
```bash
$ node scripts/generate-contract.js
Chọn: 3 (NFT)
Tên: Character
Symbol: CHAR

✅ Tạo: contracts/CharacterNFT.sol
✅ Deploy: scripts/deploy-CharacterNFT.js
```

---

## 🆘 TROUBLESHOOTING

### **Lỗi: "Cannot find module"**
```bash
npm install
```

### **Lỗi: "Compilation failed"**
Kiểm tra OpenZeppelin đã cài chưa:
```bash
npm install --save-dev @openzeppelin/contracts
```

### **Factory contract không deploy được:**
- Kiểm tra gas limit
- Đảm bảo có đủ ETH trong ví

---

## 📚 HỌC THÊM

**Solidity Patterns:**
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity by Example](https://solidity-by-example.org/)
- [Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)

**Advanced Topics:**
- Proxy Patterns (Upgradeable Contracts)
- Multi-signature Wallets
- DAO Governance
- DeFi Protocols

---

## ✅ CHECKLIST TRƯỚC KHI DEPLOY PRODUCTION

- [ ] Code review kỹ lưỡng
- [ ] Test coverage > 80%
- [ ] Audit bởi chuyên gia bảo mật
- [ ] Verify contract trên Etherscan
- [ ] Backup deployer private key
- [ ] Document toàn bộ functions
- [ ] Setup monitoring & alerts
- [ ] Test trên testnet trước

---

🎓 **Để demo cho thầy:**
1. Chạy `node scripts/generate-contract.js`
2. Chọn loại contract và nhập thông tin
3. Show file contract đã tạo
4. Compile: `npx hardhat compile`
5. (Optional) Deploy testnet để show thật

Chúc bạn thành công! 🚀

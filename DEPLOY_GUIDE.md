# Hướng dẫn Deploy Smart Contract và Kết nối với ReactJS

## 1. Deploy Smart Contract

### Deploy lên Localhost (Hardhat Network)

```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy contracts
npm run deploy:all
```

### Deploy lên Testnet (Hera/Sepolia)

```bash
# Cấu hình PRIVATE_KEY trong file .env (root)
PRIVATE_KEY=your_private_key_here

# Deploy lên Hera testnet
npm run deploy:all:hera

# Hoặc deploy lên Sepolia
npm run deploy:sepolia
```

## 2. Cập nhật Contract Address

Sau khi deploy thành công, copy địa chỉ contract vào file `frontend/.env`:

```env
VITE_BOMDOG_CONTRACT=0x... # Địa chỉ BomdogGame contract
VITE_TAIXIU_CONTRACT=0x...  # Địa chỉ TaiXiuGame contract
VITE_FISHING_CONTRACT=0x... # Địa chỉ FishingGame contract
```

## 3. Khởi động Frontend

```bash
npm run frontend
```

## 4. Cấu trúc Kết nối

### Smart Contract ↔ ReactJS Flow

```
┌─────────────────┐
│  Smart Contract │
│  (BomdogGame)   │
└────────┬────────┘
         │
         │ ethers.js
         │
┌────────▼────────────────┐
│  blockchain.js          │
│  - getBomdogContract()  │
│  - BOMDOG_ABI           │
└────────┬────────────────┘
         │
         │ Custom Hook
         │
┌────────▼────────────────┐
│  useBomdogContract()    │
│  - loadPlayerData()     │
│  - earnClick()          │
│  - upgradeClick()       │
└────────┬────────────────┘
         │
         │ React Component
         │
┌────────▼────────────────┐
│  Bomdog.jsx             │
│  - UI Display           │
│  - User Interactions    │
└─────────────────────────┘
```

## 5. Các File Quan Trọng

### Backend (Smart Contract)
- `contracts/BomdogGame.sol` - Smart contract chính
- `scripts/deploy-all.js` - Script deploy tất cả contracts
- `hardhat.config.js` - Cấu hình Hardhat

### Frontend (ReactJS)
- `src/utils/blockchain.js` - Kết nối ethers.js với contract
- `src/hooks/useBomdogContract.js` - Custom React hook
- `src/Bomdog.jsx` - Component game UI
- `.env` - Contract addresses và config

## 6. Test Kết Nối

1. **Kết nối MetaMask** với mạng đã deploy (Localhost/Hera/Sepolia)
2. **Mở frontend** tại http://localhost:5173
3. **Click "Connect Wallet"**
4. **Chơi game** - Mỗi action sẽ gửi transaction lên blockchain

## 7. Troubleshooting

### Contract chưa deploy
```
Error: Contract not deployed on this network
```
→ Chạy `npm run deploy:all` hoặc cập nhật địa chỉ trong `.env`

### Wrong network
```
Error: Please switch to correct network
```
→ Chuyển MetaMask sang mạng đúng (chainId 1337 cho localhost, 296 cho Hera)

### Insufficient funds
```
Error: insufficient funds for gas
```
→ Cần có ETH/MATIC trong ví để trả gas fee

## 8. Network Configuration

### Localhost (Hardhat)
- Chain ID: 1337
- RPC URL: http://127.0.0.1:8545

### Hera Testnet
- Chain ID: 296
- RPC URL: https://testnet.hashio.io/api
- Faucet: https://faucet.hedera.com/

### Sepolia Testnet
- Chain ID: 11155111
- RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
- Faucet: https://sepoliafaucet.com/

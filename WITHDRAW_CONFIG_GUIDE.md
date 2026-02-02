# 🔧 Hướng dẫn cấu hình Withdraw Contract

## ⚠️ Lỗi hiện tại
**"Hợp đồng rút tiền chưa được cấu hình"**

Lỗi này xảy ra khi admin duyệt yêu cầu rút tiền vì thiếu thông tin contract blockchain.

## 📋 Giải pháp

### Bước 1: Kiểm tra file .env
File `.env` đã được cập nhật với các biến:
- ✅ `BOMDOG_RPC_URL` - URL kết nối blockchain
- ✅ `BOMDOG_WITHDRAWER_KEY` - Private key để thực hiện giao dịch
- ❌ `BOMDOG_CONTRACT_ADDRESS` - **CẦN CẬP NHẬT** (hiện tại đang trống)

### Bước 2: Deploy Bomdog Token Contract

```powershell
# Compile contract
npx hardhat compile

# Deploy lên Sepolia testnet
npx hardhat run scripts/deploy-bomdog-simple.js --network sepolia

# Hoặc deploy lên local network (cần chạy hardhat node trước)
npx hardhat node  # Terminal 1
npx hardhat run scripts/deploy-bomdog-simple.js --network localhost  # Terminal 2
```

### Bước 3: Cập nhật địa chỉ contract vào .env

Sau khi deploy thành công, bạn sẽ thấy:
```
✅ BOMDOG Token deployed!
📍 Address: 0x1234567890abcdef...

📋 Cập nhật vào backend/.env:
BOMDOG_CONTRACT_ADDRESS=0x1234567890abcdef...
```

**Copy địa chỉ contract** và cập nhật vào file `.env`:
```env
BOMDOG_CONTRACT_ADDRESS=0x1234567890abcdef...
```

### Bước 4: Khởi động lại Backend

```powershell
# Dừng server hiện tại (Ctrl+C)
# Khởi động lại
npm start
# hoặc
npm run dev
```

## 🔍 Kiểm tra cấu hình

Sau khi cập nhật, hệ thống sẽ kiểm tra 3 biến:
1. ✅ `BOMDOG_RPC_URL` - Đã có
2. ✅ `BOMDOG_WITHDRAWER_KEY` - Đã có  
3. ❓ `BOMDOG_CONTRACT_ADDRESS` - **Cần deploy**

Nếu thiếu 1 trong 3, sẽ báo lỗi: **"Withdraw contract not configured"**

## 📝 Lưu ý quan trọng

### Về Network
- **Development**: Dùng local hardhat node hoặc Sepolia testnet
- **Production**: Deploy lên mainnet và cập nhật RPC URL tương ứng

### Về Private Key (BOMDOG_WITHDRAWER_KEY)
- Account này cần có **đủ ETH** để trả gas fees
- Lấy ETH testnet miễn phí tại: https://sepoliafaucet.com/
- ⚠️ **KHÔNG BAO GIỜ** commit private key thật lên git!

### Về Contract Address
- Sau khi deploy, địa chỉ contract **không thay đổi**
- Nếu deploy lại contract mới, cần cập nhật lại địa chỉ

## 🚀 Quick Start - Deploy ngay

```powershell
# 1. Compile
npx hardhat compile

# 2. Deploy lên Sepolia
npx hardhat run scripts/deploy-bomdog-simple.js --network sepolia

# 3. Copy địa chỉ contract từ output

# 4. Mở file .env và cập nhật
BOMDOG_CONTRACT_ADDRESS=<địa_chỉ_vừa_deploy>

# 5. Restart backend
npm run dev
```

## ✅ Kiểm tra thành công

Sau khi cấu hình đúng:
1. Vào Admin Dashboard
2. Chọn "Withdraw Requests"
3. Duyệt 1 yêu cầu rút tiền
4. Nếu thành công → Hiện transaction hash
5. Nếu lỗi → Kiểm tra lại cấu hình

## 🆘 Nếu vẫn lỗi

Kiểm tra:
1. Backend console có log lỗi gì không?
2. Account WITHDRAWER_KEY có đủ ETH không?
3. Contract address có đúng định dạng không? (0x...)
4. RPC URL có hoạt động không?

---

💡 **Tip**: Sau khi deploy lần đầu, lưu lại contract address để không cần deploy lại.

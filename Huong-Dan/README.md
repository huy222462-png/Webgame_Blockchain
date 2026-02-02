# 📚 HƯỚNG DẪN ĐẦY ĐỦ - DEPLOY WEB + HARDHAT TUTORIAL

## 🎯 Mục Đích

Hướng dẫn deploy và demo dự án **Blockchain Gaming Platform** kết hợp với **Hardhat Tutorial** cho thầy.

---

## 📖 THỨ TỰ ĐỌC

Đọc theo thứ tự từ **00 → 05** để hiểu đầy đủ:

### **[00-FIX-MONGODB.md](00-FIX-MONGODB.md)** 🔧
**Đọc đầu tiên nếu gặp lỗi MongoDB!**
- Fix lỗi "mongod is not recognized"
- Setup MongoDB cho dự án
- Troubleshooting MongoDB

### **[01-BAT-DAU-O-DAY.md](01-BAT-DAU-O-DAY.md)** ⭐ 
**TÓM TẮT NHANH - ĐỌC FILE NÀY TRƯỚC!**
- Tóm tắt toàn bộ dự án
- 30 phút deploy + demo
- Các bước chính
- Key points

### **[02-HUONG-DAN-DEPLOY.md](02-HUONG-DAN-DEPLOY.md)** 🚀
**HƯỚNG DẪN DEPLOY CHI TIẾT**
- Deploy Gaming contracts
- Deploy Tutorial contracts  
- Cấu hình network
- Tích hợp frontend
- Scripts tự động

### **[03-HUONG-DAN-DEMO.md](03-HUONG-DAN-DEMO.md)** 🎮
**HƯỚNG DẪN DEMO CHO THẦY**
- Checklist chuẩn bị
- Step-by-step demo
- Timeline 15 phút
- Câu hỏi thầy có thể hỏi
- Tips demo thành công

### **[04-TICH-HOP-TUTORIAL.md](04-TICH-HOP-TUTORIAL.md)** 🎓
**TÍCH HỢP TUTORIAL VÀO FRONTEND**
- Cập nhật App.jsx
- Component TutorialIntegration
- CSS styling
- Testing

### **[05-TAI-LIEU-DAY-DU.md](05-TAI-LIEU-DAY-DU.md)** 📚
**TÀI LIỆU ĐẦY ĐỦ**
- Architecture overview
- API documentation
- Smart contract specs
- Full documentation

---

## 🎯 LỘ TRÌNH HỌC

### **Nếu bạn là người mới:**
```
00-FIX-MONGODB.md 
    ↓
01-BAT-DAU-O-DAY.md (đọc tổng quan)
    ↓
05-TAI-LIEU-DAY-DU.md (hiểu kiến trúc)
    ↓
02-HUONG-DAN-DEPLOY.md (deploy từng bước)
    ↓
04-TICH-HOP-TUTORIAL.md (tích hợp)
    ↓
03-HUONG-DAN-DEMO.md (chuẩn bị demo)
```

### **Nếu bạn đã hiểu cơ bản:**
```
00-FIX-MONGODB.md (nếu cần)
    ↓
01-BAT-DAU-O-DAY.md
    ↓
02-HUONG-DAN-DEPLOY.md
    ↓
03-HUONG-DAN-DEMO.md
```

### **Nếu bạn cần deploy gấp:**
```
00-FIX-MONGODB.md
    ↓
01-BAT-DAU-O-DAY.md
    ↓
Làm theo 7 bước trong file 01
    ↓
DONE!
```

---

## 📋 CHECKLIST TỔNG QUAN

### **Trước khi bắt đầu:**
- [ ] Node.js >= 16 installed
- [ ] MongoDB installed (fix theo file 00 nếu cần)
- [ ] MetaMask extension installed
- [ ] Đã đọc file 01-BAT-DAU-O-DAY.md

### **Sau khi deploy:**
- [ ] Contracts deployed successfully
- [ ] Frontend .env configured
- [ ] MongoDB running
- [ ] Backend API running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] MetaMask connected
- [ ] Test 1 transaction thành công

### **Trước khi demo:**
- [ ] Đọc file 03-HUONG-DAN-DEMO.md
- [ ] Test tất cả chức năng
- [ ] Chuẩn bị screenshots
- [ ] Có plan B nếu network chậm

---

## 🗂️ CẤU TRÚC FILES

```
Huong-Dan/
├── README.md                      ← Bạn đang đọc
├── 00-FIX-MONGODB.md             ← Fix MongoDB
├── 01-BAT-DAU-O-DAY.md           ← Tóm tắt nhanh ⭐
├── 02-HUONG-DAN-DEPLOY.md        ← Deploy chi tiết
├── 03-HUONG-DAN-DEMO.md          ← Demo cho thầy
├── 04-TICH-HOP-TUTORIAL.md       ← Tích hợp tutorial
└── 05-TAI-LIEU-DAY-DU.md         ← Docs đầy đủ
```

---

## 🎓 NỘI DUNG CHÍNH

### **Dự Án Gồm:**

1. **Gaming Platform** (Root)
   - TaiXiuGame.sol - Game đặt cược Tài/Xỉu
   - FishingGame.sol - Game câu cá với jackpot
   - React Frontend - UI game
   - Express Backend - API + MongoDB

2. **Hardhat Tutorial** (backend/hardhat-tutorial/)
   - Counter.sol - Smart contract đếm
   - MyToken.sol - ERC20 token (HBAR)
   - TypeScript tests
   - Ignition deployment

### **Mục Tiêu:**
✅ Deploy tất cả contracts lên **cùng 1 network** (Hera - Chain 296)
✅ Tích hợp vào **1 frontend duy nhất**
✅ Demo đầy đủ cho thầy trong **15 phút**

---

## 🔑 THÔNG TIN QUAN TRỌNG

### **Network:**
- **Name:** Hera Testnet
- **Chain ID:** 296
- **RPC URL:** https://testnet.hashio.io/api
- **Explorer:** https://testnet.hashio.io

### **Test Account:**
- **Private Key:** `0x61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465`
- ⚠️ **Chỉ dùng cho testnet!**

### **Contracts Deployed:**
- MyToken (Tutorial): `0x73C6C18b1EDEB8319cA52f02f948c35FA8177401`
- TaiXiuGame: (Sau khi deploy)
- FishingGame: (Sau khi deploy)
- Counter: (Sau khi deploy)

---

## 🚀 QUICK START (5 PHÚT)

Nếu muốn chạy ngay:

```powershell
# 1. Fix MongoDB (nếu cần)
$env:PATH += ";C:\Program Files\MongoDB\Server\8.2\bin"
New-Item -Path "C:\data\db" -ItemType Directory -Force

# 2. Terminal 1: Start MongoDB
mongod --dbpath "C:\data\db"

# 3. Terminal 2: Start Backend
cd d:\Nam4\Blockchain
npm run dev

# 4. Terminal 3: Start Frontend
cd d:\Nam4\Blockchain\frontend
npm run dev

# 5. Mở browser: http://localhost:5173
```

---

## 💡 TIPS HỌC TẬP

### **Khi gặp lỗi:**
1. Đọc error message kỹ
2. Check file 00-FIX-MONGODB.md (MongoDB issues)
3. Check file 03-HUONG-DAN-DEMO.md (Troubleshooting section)
4. Check browser console (F12)
5. Check terminal logs

### **Khi cần hiểu code:**
1. Đọc file 05-TAI-LIEU-DAY-DU.md
2. Xem smart contracts trong `/contracts`
3. Xem React components trong `/frontend/src`
4. Xem API routes trong `/backend/routes`

### **Khi cần deploy:**
1. Đọc file 02-HUONG-DAN-DEPLOY.md
2. Làm từng bước
3. Lưu lại contract addresses
4. Test từng bước

---

## 📞 SUPPORT

### **Lỗi thường gặp:**
- MongoDB không chạy → File 00
- Contract deployment fail → File 02, section Troubleshooting
- Frontend không connect → File 03, section Troubleshooting
- MetaMask lỗi → File 03, section Troubleshooting

### **Cần thêm info:**
- Architecture → File 05
- API endpoints → File 05
- Smart contract details → File 05
- Testing → File 05

---

## 🎯 MỤC TIÊU SAU KHI HỌC

Sau khi đọc xong các file này, bạn sẽ:

✅ Hiểu kiến trúc blockchain full-stack
✅ Deploy smart contracts lên testnet
✅ Tích hợp blockchain vào React app
✅ Sử dụng Hardhat development framework
✅ Setup và quản lý MongoDB
✅ Demo project một cách chuyên nghiệp
✅ Trả lời được câu hỏi kỹ thuật từ thầy

---

## 📊 THỜI GIAN DỰ KIẾN

| Task | Thời gian | File tham khảo |
|------|-----------|----------------|
| Setup MongoDB | 5-10 phút | 00 |
| Deploy contracts | 5-10 phút | 01, 02 |
| Config frontend | 2-5 phút | 01, 02 |
| Setup MetaMask | 5 phút | 03 |
| Test chức năng | 10 phút | 03 |
| Chuẩn bị demo | 15 phút | 03 |
| **Tổng** | **~1 giờ** | |

---

## ✨ BẮT ĐẦU NGAY

### **Bước 1:** Đọc [01-BAT-DAU-O-DAY.md](01-BAT-DAU-O-DAY.md)
### **Bước 2:** Nếu MongoDB lỗi, đọc [00-FIX-MONGODB.md](00-FIX-MONGODB.md)
### **Bước 3:** Deploy theo [02-HUONG-DAN-DEPLOY.md](02-HUONG-DAN-DEPLOY.md)
### **Bước 4:** Chuẩn bị demo theo [03-HUONG-DAN-DEMO.md](03-HUONG-DAN-DEMO.md)

---

**🎉 Chúc bạn thành công!**

_Nếu có câu hỏi, hãy đọc kỹ các file hoặc check Troubleshooting sections._

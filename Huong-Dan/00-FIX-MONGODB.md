# 🔧 FIX LỖI MONGODB - "mongod is not recognized"

## ❌ VẤN ĐỀ

MongoDB đã cài đặt nhưng khi chạy `mongod --version` báo lỗi:
```
mongod : The term 'mongod' is not recognized as the name of a cmdlet...
```

## ✅ NGUYÊN NHÂN

MongoDB đã cài đặt ở `C:\Program Files\MongoDB\Server\8.2\bin` nhưng **CHƯA ĐƯỢC THÊM VÀO PATH**.

---

## 🛠️ CÁCH SỬA (3 Phương Án)

### **Phương Án 1: Chạy với đường dẫn đầy đủ** ⭐ (Nhanh nhất)

Không cần config gì, chỉ cần chạy với full path:

```powershell
# Chạy MongoDB
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"

# Hoặc tạo alias trong PowerShell session
$env:PATH += ";C:\Program Files\MongoDB\Server\8.2\bin"
mongod --version
```

**Ưu điểm:** Không cần quyền admin, fix ngay lập tức
**Nhược điểm:** Phải gõ lại mỗi lần mở PowerShell mới

---

### **Phương Án 2: Thêm PATH vĩnh viễn** ⭐⭐ (Đề xuất)

#### **Bước 1: Mở System Environment Variables**

Cách 1 - Qua GUI:
1. Nhấn `Win + R`
2. Gõ: `sysdm.cpl` → Enter
3. Tab **"Advanced"** → Click **"Environment Variables"**

Cách 2 - Qua Settings:
1. Search **"Environment Variables"** trong Start Menu
2. Click **"Edit the system environment variables"**

#### **Bước 2: Edit PATH**

1. Trong **System variables** (phần dưới), tìm biến **"Path"**
2. Click **"Path"** → Click **"Edit"**
3. Click **"New"**
4. Paste đường dẫn: `C:\Program Files\MongoDB\Server\8.2\bin`
5. Click **OK** → **OK** → **OK**

#### **Bước 3: Restart PowerShell & Test**

```powershell
# Đóng PowerShell cũ, mở lại PowerShell MỚI

# Test
mongod --version
# Kết quả: db version v8.2.0
```

**Ưu điểm:** Fix vĩnh viễn, dùng được mọi nơi
**Nhược điểm:** Cần quyền admin, phải restart terminal

---

### **Phương Án 3: Dùng MongoDB Compass** (GUI)

Nếu không muốn dùng command line:

1. Mở **MongoDB Compass** (đã cài cùng MongoDB)
2. Connect tới: `mongodb://localhost:27017`
3. Không cần chạy `mongod` command

**Ưu điểm:** Dễ dùng, có GUI
**Nhược điểm:** Phải mở app riêng

---

## 🚀 SETUP ĐẦY ĐỦ CHO DỰ ÁN

### **Bước 1: Tạo thư mục data**

MongoDB cần thư mục để lưu database:

```powershell
# Tạo thư mục data
New-Item -Path "C:\data\db" -ItemType Directory -Force
```

### **Bước 2: Chạy MongoDB Server**

#### **Cách A: Dùng full path (không cần fix PATH)**

```powershell
# Chạy MongoDB server
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"

# Giữ terminal này mở, MongoDB đang chạy!
# Kết quả: "Waiting for connections on port 27017"
```

#### **Cách B: Sau khi đã fix PATH**

```powershell
# Chạy MongoDB server
mongod --dbpath "C:\data\db"

# Giữ terminal này mở!
```

### **Bước 3: Test kết nối**

Mở **PowerShell mới** (Terminal thứ 2):

```powershell
# Dùng mongo shell (nếu có)
mongo

# Hoặc test qua Node.js
node -e "require('mongodb').MongoClient.connect('mongodb://localhost:27017', (e,c) => console.log(e||'Connected!'))"
```

### **Bước 4: Chạy Backend**

Trong **PowerShell thứ 3**:

```powershell
cd d:\Nam4\Blockchain

# Đảm bảo .env có MONGO_URI đúng
# MONGO_URI=mongodb://localhost:27017/blockchain-game

npm run dev
```

Kết quả mong muốn:
```
Server running on port 5000
MongoDB connected successfully ✅
```

---

## 📋 CHECKLIST HOÀN CHỈNH

### **Option A: Dùng Full Path (Không cần admin)**

- [ ] Terminal 1: Chạy MongoDB
  ```powershell
  New-Item -Path "C:\data\db" -ItemType Directory -Force
  & "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"
  ```
  
- [ ] Terminal 2: Chạy Backend
  ```powershell
  cd d:\Nam4\Blockchain
  npm run dev
  ```
  
- [ ] Terminal 3: Chạy Frontend
  ```powershell
  cd d:\Nam4\Blockchain\frontend
  npm run dev
  ```

### **Option B: Sau khi Fix PATH**

- [ ] Fix PATH theo Phương Án 2 ở trên
- [ ] Restart PowerShell
- [ ] Terminal 1: `mongod --dbpath "C:\data\db"`
- [ ] Terminal 2: `npm run dev`
- [ ] Terminal 3: `cd frontend && npm run dev`

---

## 🐛 TROUBLESHOOTING

### **Lỗi: "Data directory C:\data\db not found"**

```powershell
# Tạo thư mục
New-Item -Path "C:\data\db" -ItemType Directory -Force
```

### **Lỗi: "Address already in use" (port 27017 đã dùng)**

```powershell
# Kill process đang dùng port 27017
Stop-Process -Name mongod -Force

# Hoặc dùng port khác
mongod --port 27018 --dbpath "C:\data\db"
# Nhớ update MONGO_URI: mongodb://localhost:27018/...
```

### **Lỗi: "Insufficient permissions"**

```powershell
# Chạy PowerShell as Administrator
# Right-click PowerShell icon → "Run as administrator"
```

### **Lỗi: "shutting down with code:100"**

MongoDB không shutdown đúng lần trước:

```powershell
# Xóa file lock
Remove-Item "C:\data\db\mongod.lock" -Force

# Chạy lại
mongod --dbpath "C:\data\db"
```

---

## 💡 KHUYẾN NGHỊ

### **Cho Development (Đang code):**
✅ **Dùng Phương Án 2** - Thêm PATH vĩnh viễn
- Tiện lợi nhất
- Chỉ cần làm 1 lần
- Giống môi trường production

### **Cho Demo nhanh:**
✅ **Dùng Phương Án 1** - Full path
- Không cần config
- Chạy ngay

### **Cho người không thích command line:**
✅ **Dùng Phương Án 3** - MongoDB Compass
- GUI đẹp
- Dễ quản lý database

---

## 📝 TÓM TẮT LỆNH NHANH

```powershell
# FIX NHANH - Dùng full path (copy-paste)
$env:PATH += ";C:\Program Files\MongoDB\Server\8.2\bin"
New-Item -Path "C:\data\db" -ItemType Directory -Force
Start-Process powershell -ArgumentList "-NoExit", "-Command", "mongod --dbpath C:\data\db"

# Test
mongod --version

# Chạy backend (terminal mới)
cd d:\Nam4\Blockchain
npm run dev
```

---

## ✅ KẾT QUẢ MONG ĐỢI

Sau khi fix xong:

```powershell
PS> mongod --version
db version v8.2.0
Build Info: {
    "version": "8.2.0",
    "gitVersion": "...",
    ...
}
```

```powershell
PS> npm run dev
Server running on port 5000
MongoDB connected successfully ✅
```

---

**🎉 DONE! Bây giờ MongoDB chạy được rồi, tiếp tục với file [01-BAT-DAU-O-DAY.md](01-BAT-DAU-O-DAY.md)!**

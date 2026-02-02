# 🔧 Hướng dẫn cấu hình MongoDB

## ❌ Lỗi hiện tại
```
MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
Operation `users.findOne()` buffering timed out after 10000ms
```

## ✅ Giải pháp

### **Cách 1: MongoDB Atlas (Khuyến nghị - Miễn phí, không cần cài đặt)**

1. **Đăng ký MongoDB Atlas:**
   - Truy cập: https://www.mongodb.com/cloud/atlas/register
   - Đăng ký tài khoản miễn phí

2. **Tạo Cluster:**
   - Chọn "Build a Database" → "M0 FREE" (miễn phí)
   - Chọn cloud provider và region gần bạn
   - Đặt tên cluster (ví dụ: `Cluster0`)

3. **Tạo Database User:**
   - Vào "Database Access" → "Add New Database User"
   - Username: `admin` (hoặc tên bạn muốn)
   - Password: Tạo password mạnh (ghi nhớ lại!)
   - Database User Privileges: "Atlas admin"

4. **Whitelist IP:**
   - Vào "Network Access" → "Add IP Address"
   - Chọn "Allow Access from Anywhere" (0.0.0.0/0) cho development
   - Hoặc thêm IP cụ thể của bạn

5. **Lấy Connection String:**
   - Vào "Database" → Click "Connect"
   - Chọn "Connect your application"
   - Copy connection string, ví dụ:
     ```
     mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Cập nhật file `backend/.env`:**
   ```env
   MONGO_URI=mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/webgame?retryWrites=true&w=majority
   ```
   **Lưu ý:** Thay `admin`, `password123`, và `cluster0.xxxxx` bằng thông tin của bạn, và thêm `/webgame` trước `?`

---

### **Cách 2: MongoDB Local (Nếu đã cài MongoDB)**

1. **Tạo thư mục data:**
   ```powershell
   New-Item -Path "C:\data\db" -ItemType Directory -Force
   ```

2. **Chạy MongoDB Server (Terminal mới):**
   ```powershell
   # Cách 1: Dùng full path
   & "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"
   
   # Cách 2: Nếu đã thêm vào PATH
   mongod --dbpath "C:\data\db"
   ```

3. **Giữ terminal này mở** - MongoDB sẽ chạy trên port 27017

4. **File `backend/.env` giữ nguyên:**
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/webgame
   ```

---

## 🔍 Kiểm tra cấu hình

Sau khi cập nhật `MONGO_URI`, khởi động lại server:

```bash
npm run dev
```

**Kết quả mong muốn:**
```
✅ Connected to MongoDB: mongodb+srv://***@cluster0.xxxxx.mongodb.net/...
Backend đang lắng nghe tại http://localhost:5000
```

**Nếu vẫn lỗi:**
- Kiểm tra file `backend/.env` có đúng đường dẫn không
- Kiểm tra MongoDB Atlas đã whitelist IP chưa
- Kiểm tra username/password trong connection string có đúng không

---

## 📝 Ví dụ file `.env` hoàn chỉnh

```env
# MongoDB Connection (MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/webgame?retryWrites=true&w=majority

# Hoặc MongoDB Local
# MONGO_URI=mongodb://127.0.0.1:27017/webgame

# Server Port
PORT=5000

# JWT Secret
JWT_SECRET=dev-access-secret-change-me

# Admin Key (optional)
ADMIN_KEY=your-admin-secret-key
```

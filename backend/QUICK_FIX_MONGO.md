# ⚡ QUICK FIX - MongoDB Atlas Connection

## 🔴 Vấn đề hiện tại:
Server đang đọc MongoDB local thay vì MongoDB Atlas vì:
- File `.env` có `YOUR_PASSWORD_HERE` (chưa thay password thật)
- Hoặc dotenv chưa load đúng file `.env`

## ✅ Giải pháp nhanh:

### Bước 1: Mở file `backend/.env`

### Bước 2: Tìm dòng này:
```env
MONGO_URI=mongodb+srv://vinh223378_db_user:YOUR_PASSWORD_HERE@cluster0.h5qahvo.mongodb.net/webgame?retryWrites=true&w=majority&appName=Cluster0
```

### Bước 3: Thay `YOUR_PASSWORD_HERE` bằng password thật

**Ví dụ:** Nếu password là `abc123`, thì sửa thành:
```env
MONGO_URI=mongodb+srv://vinh223378_db_user:abc123@cluster0.h5qahvo.mongodb.net/webgame?retryWrites=true&w=majority&appName=Cluster0
```

### Bước 4: Nếu không nhớ password

1. Vào https://cloud.mongodb.com/
2. **Database Access** → Tìm user `vinh223378_db_user`
3. Click **Edit** → **Reset Password**
4. Tạo password mới (ví dụ: `MyNewPassword123`)
5. Cập nhật vào file `.env`:
   ```env
   MONGO_URI=mongodb+srv://vinh223378_db_user:MyNewPassword123@cluster0.h5qahvo.mongodb.net/webgame?retryWrites=true&w=majority&appName=Cluster0
   ```

### Bước 5: Kiểm tra IP Whitelist

1. MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. Chọn **"Allow Access from Anywhere"** (0.0.0.0/0) cho development
4. Click **Confirm**

### Bước 6: Restart server

**QUAN TRỌNG:** Sau khi sửa `.env`, bạn PHẢI restart server:

```bash
# Dừng server (Ctrl+C)
# Sau đó chạy lại:
npm run dev
```

### Bước 7: Kiểm tra kết quả

Bạn sẽ thấy:
```
✅ Loaded MONGO_URI from .env
📝 MONGO_URI từ .env: mongodb+srv://***@cluster0.h5qahvo.mongodb.net/...
✅ MongoDB connected successfully
   Database: webgame
   Host: cluster0.h5qahvo.mongodb.net
```

---

## 🔍 Debug nếu vẫn lỗi:

### Test connection string:
```bash
node backend/check-mongo.js
```

### Kiểm tra .env được load:
Server sẽ log:
- `✅ Loaded MONGO_URI from .env` → OK
- `⚠️ MONGO_URI not found in .env` → File .env không được load

### Lỗi thường gặp:

1. **"Authentication failed"**
   - Password sai → Reset password trong MongoDB Atlas
   - Username sai → Kiểm tra lại username

2. **"IP not whitelisted"**
   - Vào Network Access → Add IP Address
   - Chọn "Allow Access from Anywhere"

3. **"Invalid connection string"**
   - Đảm bảo không có khoảng trắng
   - Password có ký tự đặc biệt cần URL encode

---

## 📋 File .env hoàn chỉnh mẫu:

```env
# MongoDB Connection (MongoDB Atlas)
MONGO_URI=mongodb+srv://vinh223378_db_user:YOUR_REAL_PASSWORD@cluster0.h5qahvo.mongodb.net/webgame?retryWrites=true&w=majority&appName=Cluster0

# Server Port
PORT=5000

# JWT Secret
JWT_SECRET=dev-access-secret-change-me

# Admin Key (optional)
ADMIN_KEY=your-admin-secret-key
```

**Lưu ý:** Thay `YOUR_REAL_PASSWORD` bằng password thật!

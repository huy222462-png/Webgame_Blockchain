# 🔧 Cập nhật MONGO_URI cho MongoDB Atlas

## 📝 Connection String của bạn:

```
mongodb+srv://vinh223378_db_user:<db_password>@cluster0.h5qahvo.mongodb.net/?appName=Cluster0
```

## ✅ Cách sửa:

### Bước 1: Mở file `backend/.env`

### Bước 2: Tìm dòng `MONGO_URI` và sửa thành:

```env
MONGO_URI=mongodb+srv://vinh223378_db_user:YOUR_PASSWORD@cluster0.h5qahvo.mongodb.net/webgame?retryWrites=true&w=majority&appName=Cluster0
```

**Lưu ý quan trọng:**
1. **Thay `YOUR_PASSWORD`** bằng password thật của database user `vinh223378_db_user`
2. **Thêm `/webgame`** trước dấu `?` để chỉ định database name
3. **Thêm `retryWrites=true&w=majority`** để đảm bảo write operations an toàn

### Bước 3: Ví dụ hoàn chỉnh

Nếu password của bạn là `MyPassword123`, thì MONGO_URI sẽ là:

```env
MONGO_URI=mongodb+srv://vinh223378_db_user:MyPassword123@cluster0.h5qahvo.mongodb.net/webgame?retryWrites=true&w=majority&appName=Cluster0
```

### Bước 4: Nếu không nhớ password

1. Vào MongoDB Atlas Dashboard: https://cloud.mongodb.com/
2. Vào **Database Access** → Tìm user `vinh223378_db_user`
3. Click **Edit** → **Reset Password**
4. Tạo password mới và cập nhật vào file `.env`

### Bước 5: Kiểm tra IP Whitelist

1. Vào MongoDB Atlas → **Network Access**
2. Đảm bảo IP của bạn đã được whitelist:
   - Nếu development: Chọn **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Nếu production: Thêm IP cụ thể

### Bước 6: Khởi động lại server

```bash
npm run dev
```

Bạn sẽ thấy:
```
✅ MongoDB connected successfully
   Database: webgame
   Host: cluster0.h5qahvo.mongodb.net
```

---

## 🔍 Kiểm tra nhanh

Sau khi cập nhật, chạy:

```bash
node backend/check-mongo.js
```

Nếu kết nối thành công, bạn sẽ thấy:
```
✅ Kết nối MongoDB thành công!
```

---

## ❌ Nếu vẫn lỗi

### Lỗi "Authentication failed"
- Kiểm tra username và password có đúng không
- Reset password trong MongoDB Atlas

### Lỗi "IP not whitelisted"
- Vào Network Access → Add IP Address
- Chọn "Allow Access from Anywhere" cho development

### Lỗi "Invalid connection string"
- Đảm bảo format đúng: `mongodb+srv://user:pass@cluster.net/dbname?options`
- Không có khoảng trắng trong connection string
- Password có ký tự đặc biệt cần URL encode

---

## 📋 File .env hoàn chỉnh mẫu

```env
# MongoDB Connection (MongoDB Atlas)
MONGO_URI=mongodb+srv://vinh223378_db_user:YOUR_PASSWORD@cluster0.h5qahvo.mongodb.net/webgame?retryWrites=true&w=majority&appName=Cluster0

# Server Port
PORT=5000

# JWT Secret
JWT_SECRET=dev-access-secret-change-me

# Admin Key (optional)
ADMIN_KEY=your-admin-secret-key
```

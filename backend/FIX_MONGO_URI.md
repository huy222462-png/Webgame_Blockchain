# 🔧 Sửa lỗi MONGO_URI

## ❌ Lỗi hiện tại:
```
Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
MONGO_URI: mongosh "mongodb+srv://cluster0.h5qahvo.mongodb.net/" --apiVersion 1 --username vinh223378_db_user
```

## ✅ Nguyên nhân:
Bạn đã copy nhầm **lệnh mongosh** thay vì **connection string**!

## 🔧 Cách sửa:

### **Bước 1: Lấy Connection String đúng từ MongoDB Atlas**

1. **Vào MongoDB Atlas Dashboard:**
   - Truy cập: https://cloud.mongodb.com/
   - Đăng nhập vào tài khoản của bạn

2. **Tìm cluster của bạn:**
   - Cluster name: `Cluster0` (hoặc tên bạn đã đặt)
   - Cluster URL: `cluster0.h5qahvo.mongodb.net`

3. **Click nút "Connect"** trên cluster

4. **Chọn "Connect your application"** (KHÔNG chọn "Connect with MongoDB Shell")

5. **Copy connection string** - sẽ có dạng:
   ```
   mongodb+srv://<username>:<password>@cluster0.h5qahvo.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Thay thế:**
   - `<username>` → `vinh223378_db_user` (username của bạn)
   - `<password>` → Password bạn đã tạo khi tạo database user
   - Thêm `/webgame` trước dấu `?` để chỉ định database name

### **Bước 2: Cập nhật file `backend/.env`**

Mở file `backend/.env` và sửa dòng `MONGO_URI`:

**SAI (hiện tại):**
```env
MONGO_URI=mongosh "mongodb+srv://cluster0.h5qahvo.mongodb.net/" --apiVersion 1 --username vinh223378_db_user
```

**ĐÚNG (cần sửa thành):**
```env
MONGO_URI=mongodb+srv://vinh223378_db_user:YOUR_PASSWORD@cluster0.h5qahvo.mongodb.net/webgame?retryWrites=true&w=majority
```

**Lưu ý:** 
- Thay `YOUR_PASSWORD` bằng password thật của database user `vinh223378_db_user`
- Nếu không nhớ password, vào MongoDB Atlas → Database Access → Edit user → Reset password

### **Bước 3: Ví dụ hoàn chỉnh**

Nếu password của bạn là `MyPassword123`, thì MONGO_URI sẽ là:
```env
MONGO_URI=mongodb+srv://vinh223378_db_user:MyPassword123@cluster0.h5qahvo.mongodb.net/webgame?retryWrites=true&w=majority
```

### **Bước 4: Khởi động lại server**

```bash
npm run dev
```

Bạn sẽ thấy:
```
✅ Connected to MongoDB: mongodb+srv://***@cluster0.h5qahvo.mongodb.net/...
```

---

## 📋 Checklist:

- [ ] Đã vào MongoDB Atlas Dashboard
- [ ] Đã click "Connect" → "Connect your application"
- [ ] Đã copy connection string (không phải lệnh mongosh)
- [ ] Đã thay `<username>` và `<password>` trong connection string
- [ ] Đã thêm `/webgame` trước dấu `?`
- [ ] Đã cập nhật file `backend/.env`
- [ ] Đã khởi động lại server

---

## 🔍 Kiểm tra nhanh:

Connection string đúng phải có format:
```
mongodb+srv://username:password@cluster.xxxxx.mongodb.net/database?options
```

Hoặc MongoDB local:
```
mongodb://127.0.0.1:27017/database
```

# Admin Panel Frontend

Frontend riêng biệt cho Admin Panel, chạy ở port **5174** (tách biệt với frontend game ở port 5173).

## Cài đặt

**QUAN TRỌNG: Phải cài dependencies trước khi chạy!**

```bash
cd frontend-admin
npm install
```

## Chạy Development

```bash
npm run dev
```

Admin panel sẽ chạy tại: **http://localhost:5174**

## Cấu hình

Tạo file `.env` (hoặc copy từ `.env.example`):

```env
VITE_API_URL=http://localhost:5000
```

## Routes

- `/` - Admin Dashboard (yêu cầu đăng nhập)
- `/login` - Trang đăng nhập admin

## Lưu ý

- Admin panel hoàn toàn tách biệt với frontend game (`frontend/`)
- Chạy trên port riêng (5174) để tránh xung đột và dễ quản lý
- Yêu cầu role `admin` hoặc `super_admin` để truy cập

## Troubleshooting

Nếu gặp lỗi `'vite' is not recognized`:
1. Đảm bảo đã chạy `npm install` trong thư mục `frontend-admin`
2. Kiểm tra `node_modules` đã được tạo chưa
3. Thử xóa `node_modules` và `package-lock.json` rồi cài lại: `npm install`

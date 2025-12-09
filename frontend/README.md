# Frontend (MetaMask login) — React (Vite)

Frontend đã được chuyển sang React sử dụng Vite để có giao diện tốt hơn và phát triển nhanh.

Chạy frontend (PowerShell / cmd):

```
cd E:\Nam4\Blockchain\frontend
npm install
npm run dev
# Mở http://localhost:5173 (mặc định Vite)
```

Các điểm chính:
- Mã nguồn chính: `frontend/src/` (App.jsx, main.jsx, index.css)
- Biến môi trường API: tạo `.env` hoặc `.env.local` trong `frontend/` với ví dụ:
	- `VITE_API_URL=http://localhost:5000`
- Nếu bạn muốn build tĩnh: `npm run build` rồi `npm run preview` để xem bản build.

Chức năng hiện có:
- Kết nối MetaMask (eth_requestAccounts)
- Ký thông điệp (personal_sign)
- Khu vực game placeholder (bắt đầu chơi sau khi kết nối).

Gợi ý test API (nếu muốn kết nối backend):
- Backend chạy mặc định ở `http://localhost:5000` (server đã được tạo ở root project)
- Ví dụ gọi register: POST http://localhost:5000/api/users/register (Content-Type: application/json)

Nếu cần, tôi sẽ thêm endpoint xác thực signature và cập nhật UI để gọi endpoint đó.
# Frontend (MetaMask login)

Tệp này chứa giao diện mẫu để đăng nhập bằng MetaMask và một khu vực trò chơi placeholder cho báo cáo.

Hướng dẫn nhanh
- Mở `frontend/index.html` trong trình duyệt có tiện ích MetaMask (Chrome/Edge/Brave).
- Hoặc phục vụ thư mục `frontend/` bằng server tĩnh (khuyến nghị) và mở `http://localhost:8080`.

Ví dụ (PowerShell) nếu bạn có Python:
```
cd frontend
python -m http.server 8080
```

Hoặc nếu bạn có `npx http-server`:
```
cd frontend
npx http-server -p 8080
```

Ghi chú kỹ thuật
- `connectMetaMask()` sẽ yêu cầu quyền truy cập tài khoản (`eth_requestAccounts`).
- `handleSignIn()` sử dụng `personal_sign` để ký 1 thông điệp mẫu — gửi message+signature+address lên backend để xác thực nếu cần.
- Lắng nghe `accountsChanged` và `chainChanged` để cập nhật UI khi người dùng đổi tài khoản hoặc mạng.

Kiểm thử cơ bản
1. Mở trang bằng trình duyệt có MetaMask.
2. Nhấn "Kết nối MetaMask" và cho phép kết nối.
3. Nhấn "Đăng nhập (ký)" để ký thông điệp và kiểm tra signature.

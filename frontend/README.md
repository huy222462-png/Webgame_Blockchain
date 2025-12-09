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

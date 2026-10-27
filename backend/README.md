# Backend TickCore

Java 21, Spring Boot 3.2.5, Maven, MySQL 8.0.16+. Package gốc `com.cinema.booking`.

## Đã triển khai

- Flyway V1 tạo `users`, refresh/password reset sessions và lịch sử thay đổi role; V2 tạo danh mục và lõi đặt vé; V3 thêm thành phố và mức giá vé khởi tạo; V4 thêm `auth_version`; V5 seed thể loại phim; V6 thêm index cleanup token; V7 snapshot tên/email actor trong audit role.
- `seat_allocations` có unique key theo suất/ghế để cùng điều phối hold và booking.
- JPA cho người dùng, phim, rạp, phòng, ghế, suất chiếu, hold, allocation, booking, vé từng ghế, payment, combo, promotion và review.
- JWT access token, refresh rotation lưu hash, đăng ký/đăng nhập, bootstrap admin qua biến môi trường, phân quyền `USER`/`ADMIN`.
- Đọc/sửa hồ sơ, đổi mật khẩu, khóa/mở khóa và audit đổi role.
- CRUD phim, tìm kiếm/lọc phim theo trạng thái, ngôn ngữ, thể loại, độ tuổi; CRUD thành phố/rạp/phòng và quản lý sơ đồ ghế. Ghế đã nằm trong allocation không thể đổi loại hoặc bị bỏ khỏi sơ đồ.
- Tìm lịch chiếu theo phim/rạp/ngày, lọc admin, tạo/sửa/hủy lịch với kiểm tra chồng giờ dưới khóa phòng; sơ đồ ghế trả trạng thái/giá, cấu hình giá vé được lưu từ database.
- CRUD combo và khuyến mãi; kiểm tra mã theo thời gian, tổng đơn, lượt dùng và mức giảm tối đa. Lượt mã được giữ cùng transaction tạo đơn; combo được khóa khi checkout để snapshot giá nhất quán.
- Review công khai được phân trang, ẩn khỏi danh sách khi bị kiểm duyệt; chỉ người có booking CONFIRMED đã chiếu mới tạo, mỗi user một review/phim.
- Dashboard tổng hợp doanh thu từ đơn CONFIRMED, số đơn/suất/người dùng mới, doanh thu theo ngày, top phim theo giá vé và lấp đầy theo vé đã bán; khoảng ngày theo múi giờ nghiệp vụ, tối đa 366 ngày.
- Giữ tối đa 8 ghế trong 10 phút mặc định và không quá giờ bắt đầu suất chiếu; khóa ghế theo ID, từ chối ghế đã phân bổ/ghế lối đi, nhả hold và job dọn hold hết hạn.
- Tạo đơn chờ từ hold sở hữu bởi user, tính lại giá ghế/combo/khuyến mãi ở server, sinh mã vé riêng từng ghế và chuyển allocation sang booking trong transaction.
- Thanh toán mô phỏng tùy chọn và check-in từng mã vé chỉ sau khi đơn đã xác nhận thanh toán; job hết hạn đơn chờ nhả ghế và lượt mã giảm giá.

## Cấu hình và chạy

Yêu cầu MySQL 8.0.16+ (CHECK constraint được MySQL thực thi từ 8.0.16). Có thể dùng Docker Compose để tạo database local:

```powershell
cd backend
Copy-Item .env.example .env
# Sửa MYSQL_ROOT_PASSWORD, MYSQL_PASSWORD, DB_PASSWORD, JWT_SECRET và ADMIN_BOOTSTRAP_PASSWORD trong .env.
docker compose --env-file .env up -d mysql
docker compose --env-file .env ps
```

Compose chỉ publish cổng MySQL trên máy local (`127.0.0.1`) và giữ dữ liệu trong volume `tickcore_mysql_data`. Để kết nối tới MySQL đã cài sẵn, tạo database `cinema_booking` với charset `utf8mb4` và collation `utf8mb4_0900_ai_ci`, rồi đặt `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` tương ứng.

Mở PowerShell trong thư mục `backend/`. Có thể nạp các biến từ `.env` vào phiên hiện tại:

```powershell
Get-Content .env | Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' -and -not $_.StartsWith('#') } | ForEach-Object {
    $name, $value = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
}
# Chỉ bật khôi phục mật khẩu sau khi cấu hình SMTP:
$env:SMTP_HOST = 'smtp.example.com'
$env:SMTP_PORT = '587'
$env:SMTP_USERNAME = 'your_smtp_user'
$env:SMTP_PASSWORD = 'your_smtp_password'
$env:PASSWORD_RESET_ENABLED = 'true'
$env:PASSWORD_RESET_FROM = 'no-reply@example.com'
$env:FRONTEND_URL = 'http://localhost:3000'
```

Profile `dev` bật bộ mô phỏng thanh toán để thử giao diện; profile mặc định và production tắt mô phỏng. Mô phỏng chỉ ghi nhận kết quả giả, không xác nhận giao dịch ngân hàng. Khởi động backend từ thư mục `backend/`:

```powershell
mvn spring-boot:run
```

Hoặc từ thư mục gốc dự án: `mvn -f backend/pom.xml spring-boot:run`.

Flyway chạy migration khi khởi động; Hibernate dùng `ddl-auto: validate`. Admin ban đầu chỉ được tạo nếu email và mật khẩu bootstrap được cấu hình, mật khẩu tối thiểu 12 ký tự. Không lưu các bí mật này trong Git.

Để biên dịch mà chưa kết nối database:

```powershell
mvn -DskipTests compile
```

Đặt lại mật khẩu mặc định tắt. Khi bật, token ngẫu nhiên dùng một lần được lưu dưới dạng SHA-256, có thời hạn 30 phút và mọi token cũ bị vô hiệu hóa sau khi đặt lại. Nếu gửi email gặp lỗi, chi tiết được ghi ở log server nhưng API vẫn trả thông báo chung để tránh tiết lộ email có tài khoản hay không.

## Còn thiếu

Hủy đơn chưa tích hợp hoàn tiền thật và chưa có cổng thanh toán thật. Cần xác minh migration trên MySQL trước khi nối frontend.

Chi tiết quyết định nghiệp vụ nằm trong [hợp đồng backend](BACKEND_DOMAIN_CONTRACT.md). Hợp đồng API đối chiếu với frontend ở [README gốc](../README.md#giả-định).

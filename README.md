# Cinema Booking / TickCore

Ứng dụng đặt vé với React 18, Vite, TypeScript strict và MSW. Backend Spring Boot 3/Java 21 đang được phát triển theo hợp đồng MySQL, xác thực và nghiệp vụ đặt vé.

Yêu cầu gốc: [cinema-booking-prompt.md](cinema-booking-prompt.md). Bảng đối chiếu và bằng chứng kiểm tra: [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Chạy frontend

Yêu cầu Node.js 22.12+ hoặc 24 và npm.

```sh
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Trên PowerShell dùng `Copy-Item .env.example .env` thay cho `cp` nếu cần. Truy cập `http://localhost:3000`. Mặc định `.env.example` bật mock; không cần chạy backend.

Những lần chạy tiếp theo chỉ cần `cd frontend` và `npm run dev`. Dừng Vite/build bằng `Ctrl+C` trước khi cài lại bằng `npm ci`; trên Windows, tiến trình đang chạy có thể khóa file Rolldown và gây lỗi `EPERM`. Nếu cài bị dở, chạy lại `npm ci` thành công trước khi khởi động Vite.

```sh
npm run lint
npm run build
npm run test:mock
npm run test:http
npm run check:i18n
npm run check:contract
npm run format:check
```

## Tài khoản mock

| Vai trò | Email | Mật khẩu thử nghiệm |
| --- | --- | --- |
| USER | user@tickcore.vn | password123 |
| ADMIN | admin@tickcore.vn | password123 |
| USER thứ hai | user2@tickcore.vn | password123 |

Các thông tin trên chỉ dành cho mock. Đăng ký, CRUD và đặt vé cập nhật dữ liệu trong bộ nhớ của tab, khởi tạo lại khi tải lại toàn trang.

Thử luồng: chọn phim đang chiếu → ngày có suất tương lai → ghế → combo → mã `WELCOME10` hoặc `GIAM30K` → thanh toán → kết quả → Vé của tôi. `HETHAN` kiểm tra mã hết hạn; `VIP500K` yêu cầu đơn tối thiểu 500.000 VND. Đơn chỉ ở trạng thái chờ sau khi tạo; trong hộp thoại thanh toán, chọn mô phỏng thành công hoặc thất bại cho bất kỳ phương thức nào. QR thanh toán chỉ phục vụ demo, khác QR vé; QR vé chỉ được cấp khi đơn được xác nhận.

Thử check-in: đăng nhập ADMIN → **Quét vé / Check-in** (`/admin/ticket-scan`) → dùng máy quét QR ở chế độ bàn phím hoặc nhập mã `TC20261026001`, rồi nhấn Enter. Vé hợp lệ sẽ ghi thời gian và tên tài khoản quét; quét lại bị từ chối và báo lần quét trước. Khi bật mock, trạng thái chỉ lưu trong bộ nhớ. Backend thật lưu check-in theo từng ghế trong MySQL; phân quyền nhân viên riêng và quét bằng camera chưa có.

## Backend và kết nối API thật

```sh
cd backend
mvn compile
```

Cài Java 21, Maven và MySQL 8.0.16+. Backend có Flyway V1–V7, entity JPA, JWT có thể thu hồi ngay qua auth version, đăng ký/đăng nhập, SMTP reset mật khẩu tùy chọn, giữ ghế transactional, tạo đơn chờ, mô phỏng thanh toán local, check-in từng vé, CRUD danh mục và dashboard. Tạo schema `cinema_booking`, cấu hình biến môi trường rồi chạy `mvn spring-boot:run` theo [hướng dẫn backend](backend/README.md); tích hợp cổng thanh toán thật và kiểm thử trên MySQL vẫn còn thiếu.

Sau khi tự cài backend, đặt `VITE_ENABLE_MOCK=false`, giữ `VITE_API_BASE_URL=/api/v1` để Vite proxy `/api` tới `http://localhost:8080`, rồi khởi động lại Vite. Hoặc đặt base URL tuyệt đối và cấu hình CORS phía backend. Component đi qua lớp API nên không cần sửa giao diện.

## Thư mục

```text
frontend/src/
  app/ routes/             Router lazy-load, provider và chặn quyền
  components/              UI, layout, trạng thái lỗi/rỗng
  features/                Các trang và lớp API theo chức năng
  hooks/ stores/ lib/      Polling, đồng hồ, Zustand, HTTP, token, định dạng
  mocks/                   MSW và dữ liệu demo
  i18n/ styles/ types/     Bản dịch, màu sáng/tối và hợp đồng dữ liệu
backend/src/main/
  java/com/cinema/booking/  Controller, service, repository, JPA entity, DTO, bảo mật
  resources/db/migration/   Schema MySQL do Flyway quản lý
```

## Giả định

- Giữ tên thương hiệu TickCore của frontend hiện có; Cinema Booking là tên dự án trong tài liệu.
- Giữ Tailwind 4 với cấu hình CSS-first, thêm dark variant theo class, thay cho tạo `tailwind.config.ts` của Tailwind 3.
- Giữ Vite và thư viện đã cài; không nâng/hạ hàng loạt dependency trong lần đối chiếu.
- Tiền là số nguyên VND; thời gian ISO-8601; khóa chính Java `Long`, phía TypeScript dùng `number`. Các trường union chuỗi được biểu diễn bằng `String` trong DTO Java.
- Bảng gốc yêu cầu cấu hình giá nhưng chưa có API: bổ sung `GET/PUT /api/v1/admin/pricing` cho frontend, mock và controller. Các đường dẫn mở khóa người dùng và xóa đánh giá admin được bổ sung đối xứng theo yêu cầu chức năng.
- Bộ lọc độ tuổi bổ sung tham số `ageRating`; `Room.seatLayout` là dữ liệu tùy chọn để mở lại trình chỉnh ghế mà không cần endpoint đọc mới.
- Kết quả kiểm tra mã giảm giá có thêm `minOrderAmount` tùy chọn để hiển thị đúng điều kiện tối thiểu. Khuyến mãi trên trang chủ là nội dung giới thiệu mã mẫu trong file dịch vì hợp đồng gốc không có API danh sách khuyến mãi công khai.
- `showtime.basePrice` là giá ghế thường trước phụ thu. Giá thực tế = giá suất + chênh lệch loại ghế so với ghế thường + phụ thu định dạng + cuối tuần. Ghế đôi là một đơn vị đặt, nằm trong giới hạn 8 đơn vị ghế.
- Hợp đồng `Booking` gốc thiếu `movieId`, `showtimeId` và hạn đơn. Mock giữ liên kết ghế/đơn nội bộ; UI xác định quyền đánh giá bằng tên phim trong vé đã xem. Khi mở rộng backend thật nên bổ sung các ID này đồng bộ hai bên.
- Một người chỉ có một đánh giá cho mỗi phim. Chỉ vé `CONFIRMED` của suất đã chiếu cho phép tạo đánh giá.
- Mock chỉ hỗ trợ cạnh tranh ghế trong cùng kho dữ liệu của một tab. Đồng bộ nhiều thiết bị cần backend thật; hook polling đã có chú thích chuyển WebSocket/STOMP.
- Mock quên/đặt lại mật khẩu chỉ mô phỏng phản hồi; backend có thể gửi email reset nếu bật và cấu hình SMTP. Thanh toán và QR vé không kết nối ngân hàng hay cổng thanh toán thật.

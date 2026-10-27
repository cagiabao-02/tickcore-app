# Hợp đồng nghiệp vụ backend TickCore

Trạng thái: **Bước 1 đã được chuyển thành working contract; MySQL đã chốt, hệ thống hiện chỉ có USER và ADMIN.**

Tài liệu này đối chiếu `cinema-booking-prompt.md`, `PROJECT_STATUS.md`, các DTO backend và `frontend/src/types/index.ts`. Prompt gốc yêu cầu backend chỉ là khung; việc biến các quyết định dưới đây thành schema/code cần được chốt trước.

## 1. Phạm vi đã có trong hợp đồng hiện tại

- Java 21, Spring Boot 3, Maven; tầng controller → service → repository; controller/service trao đổi DTO, không trả entity.
- MySQL 8.0.16+ đã chốt; `application.yml` dùng URL mẫu có timezone UTC. Flyway V1–V7 tạo auth, danh mục, booking và dữ liệu tham chiếu; V4 thêm phiên bản xác thực, V5 seed 10 thể loại mock, V6 thêm index cleanup, V7 snapshot actor cho audit role; chưa chạy xác minh trên MySQL.
- Vai trò hiện có: `USER`, `ADMIN`. Phân quyền quản trị phải được kiểm tra ở backend.
- Hold ghế tối đa 10 phút và hết hạn không muộn hơn giờ bắt đầu suất chiếu; đơn từ hold còn hạn; tối đa 8 ghế; tiền VND là số nguyên; thời gian API theo ISO-8601.
- Đơn mới ở `PENDING`; chỉ sau khi xác nhận thanh toán mới chuyển `CONFIRMED` và phát hành QR vé. Hủy/hết hạn phải giải phóng ghế.
- Hủy vé người dùng bị giới hạn bởi mốc 2 giờ trước suất chiếu. Đánh giá cần vé đã xác nhận của suất đã chiếu.
- Frontend đã hỗ trợ QR riêng theo từng ghế và hiển thị người/thời điểm check-in; backend lưu trạng thái check-in trong `booking_seats`.

## 2. Mô hình dữ liệu đề xuất

| Nhóm | Bảng dự kiến | Ghi chú |
|---|---|---|
| Tài khoản | `users` | email duy nhất, password hash, hồ sơ, role, trạng thái khóa |
| Audit quyền | `user_role_history` | tài khoản mục tiêu, người thực hiện, role cũ/mới, lý do, thời điểm |
| Danh mục | `movies`, `genres`, `movie_genres` | phim và quan hệ nhiều-nhiều thể loại |
| Rạp/phòng | `cities`, `cinemas`, `rooms`, `seats` | ghế duy nhất theo phòng; ghế aisle không bán được |
| Lịch | `showtimes` | phim, phòng, giờ bắt đầu/kết thúc, format, phụ đề, giá cơ sở; không cho suất cùng phòng chồng giờ |
| Giữ ghế | `seat_holds`, `seat_allocations` | chủ sở hữu, suất, hết hạn; `UNIQUE(showtime_id, seat_id)` điều phối độc quyền cả hold và booking |
| Đơn | `bookings`, `booking_seats`, `booking_combos` | lưu snapshot giá/tên/ghế; mỗi ghế có mã vé riêng, dữ liệu cũ được giữ khi hủy |
| Thanh toán | `payments` | một đơn có thể có nhiều lần thử; trạng thái, phương thức, số tiền, mã tham chiếu và idempotency key |
| Bán hàng | `combos`, `promotions`, `ticket_pricing` | giá, hiệu lực, giới hạn lượt và cấu hình giá |
| Đánh giá | `reviews` | mỗi user tối đa một đánh giá cho mỗi phim nếu giữ quy tắc mock hiện tại |
| Check-in | trường trên `booking_seats` | mã vé duy nhất, người quét, thời điểm; cập nhật có điều kiện để từ chối quét lặp nguyên tử |

Nên dùng migration Flyway có version; không để Hibernate tự thay schema production.

## 3. Bất biến nghiệp vụ cần giữ

1. Mỗi ghế của một suất chỉ có tối đa một allocation: hold còn hạn hoặc đơn chưa hủy/hết hạn.
2. Tạo đơn kiểm tra hold thuộc đúng user, đúng suất, chưa hết hạn; giá, giảm giá và tổng tiền phải được server tính lại.
3. Không nhận trạng thái thanh toán thành công do trình duyệt tự khai. Đơn chỉ xác nhận sau phản hồi đã xác thực từ cổng thanh toán; mô phỏng chỉ dùng profile dev/test.
4. Mô phỏng thanh toán lặp thành công trả lại kết quả hiện tại; check-in khóa mã vé và từ chối quét lặp. Callback thật cần idempotency key từ provider.
5. Check-in và hủy đơn khóa booking trước rồi mới xử lý vé; nếu một vé trong đơn đã check-in thì không cho hủy đơn, tránh hai thao tác đua trạng thái.
6. Không xóa dữ liệu lịch sử cần đối soát; hủy vé/đơn nên đổi trạng thái và giữ lại thông tin.
7. Đổi role cập nhật `users` và thêm `user_role_history` trong cùng transaction; ngăn tự hạ quyền ngoài quy trình và không để mất admin cuối cùng. `auth_version` tăng khi đổi quyền/trạng thái/mật khẩu hoặc logout để access JWT cũ bị từ chối ngay.

## 4. Khoảng trống hợp đồng hiện tại cần xử lý

- `BookingResponse` và frontend `Booking` đã có `movieId`, `showtimeId` tùy chọn để không phá dữ liệu mock cũ; quyền đánh giá phía backend dựa trên các ID ổn định và booking trong database.
- Mỗi `booking_seats` có `ticket_code` riêng; response và giao diện kết quả đã hỗ trợ QR theo ghế. Cần giữ tương thích này ở API danh sách vé.
- `PaymentRequest.outcome` cho phép client gửi `SUCCESS`/`FAILED`. Chỉ được dùng trong mock hoặc profile dev; production cần API khởi tạo giao dịch và callback/webhook được xác minh từ nhà cung cấp thanh toán.
- Khôi phục mật khẩu chỉ hoạt động khi bật `PASSWORD_RESET_ENABLED` và cấu hình SMTP; token ngẫu nhiên dùng một lần chỉ lưu hash, hết hạn theo cấu hình (mặc định 30 phút), và reset thu hồi các refresh session.
- `GET /api/v1/admin/users/{id}/role-history` trả lịch sử phân trang; mỗi bản ghi giữ actor ID cùng tên/email snapshot, role cũ/mới, lý do tùy chọn và thời điểm.
- `UserResponse.role` giữ kiểu chuỗi để tương thích JSON frontend; `RoleRequest.role` và domain dùng enum `USER`/`ADMIN`.
- DTO thời gian giữ chuỗi để tương thích JSON; entity dùng `Instant` cho lịch chiếu/đơn và `LocalDate` cho ngày sinh/phim.

## 5. Các quyết định và giả định đang áp dụng

| Quyết định | Đề xuất mặc định | Tác động |
|---|---|---|
| Database | **Đang áp dụng MySQL** theo driver/config hiện có | Migration V1 tạo auth; V2 tạo danh mục và lõi booking; V3 thêm thành phố/giá; V4 thêm `auth_version`; V5 seed thể loại; V6 thêm index cleanup; V7 snapshot audit actor; MySQL 8.0.16+ để thực thi CHECK constraints |
| Quyền quét vé | **Chỉ ADMIN được quét vé trong phiên bản này** | Nếu sau này cần nhân viên rạp, thiết kế quyền riêng theo rạp trước khi bổ sung role |
| QR/check-in | **Dùng một vé/QR cho mỗi ghế** | Check-in chỉ tác động ticket được quét; role ADMIN |
| Thanh toán thật | **Đang giả định một đơn có nhiều lần thử thanh toán** | Mỗi callback phải idempotent; SUCCESS chỉ từ nguồn đã xác thực |
| Lịch sử role | **Áp dụng `user_role_history`**, FK actor/target, `reason` tùy chọn | Migration V1 tạo bảng audit |
| Giữ ghế đồng thời | Transaction + khóa hàng theo thứ tự suất → phòng → ghế và unique `seat_allocations(showtime_id, seat_id)`; cần kiểm thử song song trên MySQL | Tránh bán trùng ghế và tránh sửa sơ đồ ghế đồng thời với hold trên nhiều instance |

## 6. Thứ tự tiếp theo sau khi chốt

1. MySQL và mô hình USER/ADMIN đã chốt; QR mỗi ghế và nhiều lần thử thanh toán đang là giả định triển khai.
2. Migration V1–V7 tạo auth, danh mục/booking, dữ liệu tham chiếu ban đầu, `auth_version`, index cleanup và snapshot audit; entity đang được đối chiếu với schema. Đã triển khai CRUD/tìm kiếm phim, rạp, phòng, sơ đồ ghế, suất chiếu, giá vé, combo, khuyến mãi, review và dashboard.
3. Đã nối giữ ghế transactional, khóa ghế ổn định và unique `seat_allocations(showtime_id, seat_id)`; job thu hồi hold/đơn hết hạn khóa hàng trước khi xóa allocation.
4. Đã nối tạo đơn, thanh toán mô phỏng trong profile dev, check-in từng vé và job hết hạn; cần kiểm tra migration/tranh chấp trên MySQL và bổ sung payment gateway thật.

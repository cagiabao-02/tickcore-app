# Đối chiếu dự án với cinema-booking-prompt.md

Đối chiếu ngày 26/10/2026. Đã đọc toàn bộ tài liệu gốc trước khi sửa mã. Thư mục được kiểm tra là thư mục dự án hiện tại; không có thư mục con tên `prj`.

## Hiện trạng trước khi tiếp tục

- Có frontend với React, router lazy-load, UI/layout, Zustand, i18n, các trang khách hàng và admin, dữ liệu MSW.
- `npm run build` đã chạy thành công, nhưng chưa có script/config ESLint và Prettier hoàn chỉnh.
- Có 12 phim, 4 rạp/2 thành phố, 3 phòng/rạp, lịch chiếu 7 ngày, 6 combo, 4 mã giảm giá và tài khoản demo.
- Nhiều nút thêm/sửa admin chưa có xử lý; mock tạo/sửa/xóa chỉ trả phản hồi, chưa thay đổi kho dữ liệu.
- Đăng ký chưa lưu tài khoản; tạo đơn chưa kiểm tra hạn/chủ sở hữu hold; thanh toán thất bại không đến trang kết quả.
- Đánh giá mới có danh sách; thiếu form, điều kiện đã xem, sửa/xóa. Thiếu bộ lọc tuổi/ngôn ngữ phim, ảnh đại diện và đường dẫn chi tiết QR trong danh sách vé.
- Chưa có `backend/` và ba README theo yêu cầu.

## Đối chiếu các bước ở Phần 5

| Bước | Ban đầu | Đã tiếp tục thực hiện |
| --- | --- | --- |
| 1. Khởi tạo frontend | Có Vite/React/strict TS/alias/proxy; thiếu lint | Thêm ESLint TypeScript/Hooks, Prettier và scripts; sửa favicon |
| 2. Nền tảng | Có khung, còn lỗi refresh và bản dịch | Sửa hàng đợi refresh, giữ lựa chọn lưu phiên, xóa cache khi đăng xuất; chuẩn hóa lỗi; khớp khóa Việt/Anh; sửa dark variant và CSS reset ghi đè Tailwind; focus trap modal |
| 3. Mock | Đủ dữ liệu demo, nghiệp vụ chưa kín | Lưu đăng ký/CRUD; kiểm tra quyền, ghế hợp lệ, hạn hold, mã giảm giá; trả ghế khi hủy/hết hạn; nhánh thanh toán xác định; kiểm thử HTTP |
| 4. Khách hàng | Phần lớn trang đã có; nhiều chi tiết thiếu | Hoàn thiện các mục trong bảng dưới, kiểm tra luồng chính trên trình duyệt |
| 5. Admin | Chủ yếu bảng xem dữ liệu | Nối CRUD và form kiểm tra cho sáu tài nguyên; sơ đồ ghế, giá vé, lịch theo ngày, lọc/thống kê, vai trò và hộp xác nhận |
| 6. Backend | Đang triển khai | Có V1–V7 Flyway, seed thể loại, cleanup token hết hạn, audit role có API tra cứu, entity JPA, JWT/auth version, reset mật khẩu qua SMTP tùy chọn, giữ ghế transaction, tạo đơn chờ, thanh toán mô phỏng dev, check-in từng vé; CRUD/tìm kiếm danh mục và dashboard đã nối; Maven compile đạt. Còn cổng thanh toán thật và xác minh migration/tranh chấp trên MySQL |
| 7. Tài liệu | Chỉ có prompt gốc | README gốc/frontend/backend, giả định, cách chạy và bảng đối chiếu này |

## Chức năng khách hàng ở Phần 3

| # | Mục | Kết quả đối chiếu và phần đã bổ sung |
| --- | --- | --- |
| 1 | Trang chủ | Giữ banner tự chạy, poster và tìm kiếm; thêm thông tin mã khuyến mãi mẫu, nhãn banner, trạng thái lỗi |
| 2 | Danh sách phim | Thêm lọc ngôn ngữ/độ tuổi; tìm kiếm debounce, URL, sắp xếp, phân trang; sửa đồng bộ ô tìm kiếm khi dùng lịch sử trình duyệt |
| 3 | Chi tiết phim | Giữ thông tin phim; thêm nhúng trailer YouTube khi có URL, khu đánh giá đầy đủ |
| 4 | Chọn suất | Sửa bộ lọc thành phố; giữ thanh 7 ngày; chặn suất đã qua; số ghế trống tính từ sơ đồ thực tế |
| 5 | Ghế | Giữ giới hạn 8, phân loại/giá, polling 5 giây và cuộn ngang; giá đọc cấu hình; không chọn lối đi; mở trực tiếp bằng URL được |
| 6 | Hold | Giữ ghế tối đa 10 phút và không quá giờ chiếu; đồng hồ sticky; modal hết hạn nhả ghế và về sơ đồ; xác nhận khi rời luồng trong SPA và cảnh báo đóng trang |
| 7 | Combo | Tăng/giảm, tải/lỗi/rỗng; sửa bỏ qua để xóa lựa chọn combo |
| 8 | Mã giảm giá | Kiểm tra cùng quy tắc khi áp mã và tạo đơn; hạn, mức tối thiểu, lượt dùng, trần giảm; gỡ mã; xóa giảm giá khi giỏ đổi |
| 9 | Thanh toán | Tạo đơn chờ trước; chỉ xác nhận sau khi chọn kết quả mô phỏng; QR thanh toán tách khỏi QR vé; chặn hết hạn và giữ mã đơn khi thử lại lỗi mạng |
| 10 | Kết quả | Chỉ hiện QR vé sau xác nhận; đơn chờ có thể tiếp tục thanh toán; hiển thị trạng thái hủy |
| 11 | Vé | Ba tab, phân trang, link chi tiết QR; hủy có xác nhận và kiểm tra còn trên 2 giờ |
| 12 | Đăng ký/đăng nhập | Giữ form Zod/RHF, ẩn/hiện mật khẩu và redirect; đăng ký mock đã lưu được tài khoản; sửa lựa chọn ghi nhớ phiên |
| 13 | Quên/đặt lại mật khẩu | Có giao diện và API mock phản hồi; không gửi email thật, đúng phạm vi tài liệu |
| 14 | Hồ sơ | Thêm nhập URL/hiển thị ảnh đại diện; sửa thông tin và đổi mật khẩu mock kiểm tra mật khẩu cũ |
| 15 | Đánh giá | Thêm gửi 1–5 sao, bình luận, sửa/xóa của mình, điều kiện có vé đã chiếu; phân trang/sắp xếp; cập nhật điểm trung bình |
| 16 | Việt/Anh | Đồng bộ khóa tĩnh, dịch nhãn form/menu/kết quả; lưu lựa chọn, cập nhật ngôn ngữ tài liệu HTML |
| 17 | Sáng/tối/hệ thống | Sửa Tailwind dark theo class; giữ lưu lựa chọn và áp dụng trước render |
| 18 | Trang lỗi | Có 404/403, ErrorState và thử lại; USER bị chặn admin đã xác minh trên trình duyệt |

## Chức năng admin ở Phần 3

| # | Mục | Kết quả |
| --- | --- | --- |
| 1 | Dashboard | Khoảng ngày, biểu đồ ngày/tháng, top phim và tỷ lệ lấp đầy; tổng doanh thu dùng cùng nguồn vé xác nhận |
| 2 | Phim | Tìm, lọc trạng thái, sắp xếp, phân trang, CRUD; đầy đủ trường form được yêu cầu |
| 3 | Rạp | CRUD tên/thành phố/địa chỉ/điện thoại |
| 4 | Phòng | CRUD; đặt hàng/cột, đổi từng ô thường/VIP/đôi/lối đi; lưu và áp dụng lên sơ đồ khách hàng |
| 5 | Suất chiếu | CRUD, kiểm tra chồng giờ cùng phòng, bảng và xem lịch theo ngày |
| 6 | Giá vé | Trang cấu hình giá từng loại ghế và phụ thu 3D/IMAX/cuối tuần; API bổ sung đồng bộ cả ba phía |
| 7 | Combo | CRUD tên/mô tả/ảnh/giá/bật-tắt; đã thử thêm và thấy bảng cập nhật trên trình duyệt |
| 8 | Khuyến mãi | CRUD phần trăm/số tiền, tối thiểu, trần giảm, hiệu lực, giới hạn lượt và bật-tắt |
| 9 | Đặt vé | Lọc trạng thái/ngày/phim, mở chi tiết, xác nhận hủy và nhả ghế; thêm màn hình quét mã/check-in mock, ghi người và thời gian, chặn quét lặp |
| 10 | Người dùng | Tìm kiếm, khóa/mở khóa, đổi USER/ADMIN; xem lịch sử vai trò gồm người thực hiện, thời điểm và lý do |
| 11 | Đánh giá | Ẩn/hiện, xóa có xác nhận |

Bảng quản trị dùng DataTable chung có tải, rỗng, sắp xếp và phân trang. Những thao tác xóa tài nguyên có hộp xác nhận.

## Bằng chứng kiểm tra

- Bổ sung sau phản hồi IDE: loại `src/main.ts` template khỏi tsconfig để `src/main.tsx` thực sự được kiểm tra; thêm `vite-env.d.ts`; đổi tùy chọn MSW 3 sang `onUnhandledFrame`. Đã xác minh danh sách file TypeScript chứa `main.tsx` và chạy lại build/lint/kiểm thử.
- `npm run dev`: Vite khởi động, đã dùng ứng dụng trên trình duyệt.
- `npm run lint`, `npm run build`, `npm run format:check`: đạt sau khi sửa và định dạng mã.
- `npm run test:mock`: 60 kiểm tra qua HTTP/MSW, gồm đăng ký/đăng nhập, quyền admin, tranh chấp giữ trùng ghế, hold hết hạn, thanh toán và hủy, check-in hợp lệ, từ chối người không có quyền/mã lạ/quét lặp, CRUD combo, xung đột suất, sơ đồ ghế, đánh giá và hết hạn đơn chờ.
- `npm run test:http`: refresh đồng thời một lần, không treo khi thiếu refresh token, giữ session/local storage, không refresh lỗi login, lỗi hàng đợi có dạng ApiError.
- `npm run check:i18n`: 461 khóa Việt/Anh khớp và không thiếu khóa tĩnh được tham chiếu trong TypeScript.
- `npm run check:contract`: 73 endpoint MSW/controller khớp, 72 lời gọi API frontend có endpoint tương ứng, 27 DTO khớp tên trường; đã quét 95 public service method và không còn stub.
- `mvn compile`: đã thành công với Java 21; không cần DB thật.
- Đã đi luồng trình duyệt: đăng nhập → phim → ngày chiếu → ghế → combo → checkout → đơn chờ và QR thanh toán demo; xác nhận không có kết quả/QR vé trước khi chọn mô phỏng thành công.
- Đã kiểm tra hiển thị vé ở 360px, USER bị chặn admin, thêm combo admin, Việt/Anh và sáng/tối/hệ thống.
- Đã thử hủy hộp thoại rời luồng rồi thanh toán thành công; xác nhận rời luồng nhả hold và đi đúng `/movies`.

Ảnh kiểm chứng: [vé mobile](docs/screenshots/tickets-mobile.jpg), [admin tiếng Anh chế độ sáng](docs/screenshots/admin-english-light.jpg), [đặt vé thành công](docs/screenshots/booking-success.jpg).

## Chưa làm hoặc cần lưu ý khi tiếp tục

1. **Backend chưa hoàn chỉnh:** chưa tích hợp cổng thanh toán thật. Migration và tranh chấp giao dịch chưa được xác minh trên MySQL trong môi trường này; WebSocket chưa triển khai. Reset mật khẩu cần bật SMTP, mặc định đang tắt.
2. Mock lưu trong bộ nhớ một tab, tải lại trang sẽ tạo dữ liệu mới. Chưa có đồng bộ giữ ghế giữa hai tab/thiết bị độc lập; backend thật sẽ đảm nhiệm việc đó. Tranh chấp hai tài khoản đã được thử trong cùng kho mock qua HTTP.
3. Đã kiểm tra luồng chính và các trường hợp lỗi quan trọng; chưa chạy kiểm thử hình ảnh tự động cho toàn bộ trang, mọi kích thước màn hình và mọi tổ hợp trường form. Không coi kết quả build là bằng chứng cho toàn bộ QA giao diện.
4. Kiểu hợp đồng chung giữ ở `src/types/index.ts`; `features/*/types.ts` tái xuất để tránh hai định nghĩa lệch nhau. Những luồng liên quan dùng component/UI và hook dùng chung thay vì tạo thư mục trống chỉ để giống sơ đồ.
5. Ngân hàng thật, triển khai hosting và email thật không thuộc phạm vi mock. Backend hỗ trợ reset mật khẩu qua SMTP cấu hình riêng; mock vẫn dùng phản hồi giả. Xem [Giả định trong README](README.md#giả-định) trước khi nối backend.

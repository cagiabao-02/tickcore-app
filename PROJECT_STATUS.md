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
| 6. Backend | Chưa có | Thêm khung Java 21/Spring Boot 3/Maven theo tầng; DTO record, controller, service stub, entity trống, repository, cấu hình và job TODO; biên dịch Maven |
| 7. Tài liệu | Chỉ có prompt gốc | README gốc/frontend/backend, giả định, cách chạy và bảng đối chiếu này |

## Chức năng khách hàng ở Phần 3

| # | Mục | Kết quả đối chiếu và phần đã bổ sung |
| --- | --- | --- |
| 1 | Trang chủ | Giữ banner tự chạy, poster và tìm kiếm; thêm thông tin mã khuyến mãi mẫu, nhãn banner, trạng thái lỗi |
| 2 | Danh sách phim | Thêm lọc ngôn ngữ/độ tuổi; tìm kiếm debounce, URL, sắp xếp, phân trang; sửa đồng bộ ô tìm kiếm khi dùng lịch sử trình duyệt |
| 3 | Chi tiết phim | Giữ thông tin phim; thêm nhúng trailer YouTube khi có URL, khu đánh giá đầy đủ |
| 4 | Chọn suất | Sửa bộ lọc thành phố; giữ thanh 7 ngày; chặn suất đã qua; số ghế trống tính từ sơ đồ thực tế |
| 5 | Ghế | Giữ giới hạn 8, phân loại/giá, polling 5 giây và cuộn ngang; giá đọc cấu hình; không chọn lối đi; mở trực tiếp bằng URL được |
| 6 | Hold | Giữ ghế 10 phút; đồng hồ sticky; modal hết hạn nhả ghế và về sơ đồ; xác nhận khi rời luồng trong SPA và cảnh báo đóng trang |
| 7 | Combo | Tăng/giảm, tải/lỗi/rỗng; sửa bỏ qua để xóa lựa chọn combo |
| 8 | Mã giảm giá | Kiểm tra cùng quy tắc khi áp mã và tạo đơn; hạn, mức tối thiểu, lượt dùng, trần giảm; gỡ mã; xóa giảm giá khi giỏ đổi |
| 9 | Thanh toán | Thẻ/QR thành công, ví thất bại có chủ ý; chặn hết hạn; giữ mã đơn khi thử lại lỗi mạng để tránh tạo đơn trùng |
| 10 | Kết quả | Sửa khóa dịch, lỗi điều hướng do reset giỏ; thêm lý do thất bại và thử lại; QR thật từ mã vé; hiển thị trạng thái hủy |
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
| 9 | Đặt vé | Lọc trạng thái/ngày/phim, mở chi tiết, xác nhận hủy và nhả ghế |
| 10 | Người dùng | Tìm kiếm, khóa/mở khóa, đổi USER/ADMIN |
| 11 | Đánh giá | Ẩn/hiện, xóa có xác nhận |

Bảng quản trị dùng DataTable chung có tải, rỗng, sắp xếp và phân trang. Những thao tác xóa tài nguyên có hộp xác nhận.

## Bằng chứng kiểm tra

- Bổ sung sau phản hồi IDE: loại `src/main.ts` template khỏi tsconfig để `src/main.tsx` thực sự được kiểm tra; thêm `vite-env.d.ts`; đổi tùy chọn MSW 3 sang `onUnhandledFrame`. Đã xác minh danh sách file TypeScript chứa `main.tsx` và chạy lại build/lint/kiểm thử.
- `npm run dev`: Vite khởi động, đã dùng ứng dụng trên trình duyệt.
- `npm run lint`, `npm run build`, `npm run format:check`: đạt sau khi sửa và định dạng mã.
- `npm run test:mock`: 45 kiểm tra qua HTTP/MSW, gồm đăng ký/đăng nhập, quyền admin, giữ trùng ghế, hold hết hạn, quyền sở hữu đơn, mã hết hạn, thanh toán thất bại/thử lại/hủy, CRUD combo, xung đột suất, sơ đồ lối đi/VIP, giá mới, đánh giá và hết hạn đơn chờ.
- `npm run test:http`: refresh đồng thời một lần, không treo khi thiếu refresh token, giữ session/local storage, không refresh lỗi login, lỗi hàng đợi có dạng ApiError.
- `npm run check:i18n`: 421 khóa Việt/Anh khớp và không thiếu khóa tĩnh được tham chiếu trong TypeScript.
- `npm run check:contract`: 71 endpoint MSW/controller khớp, 70 lời gọi API frontend có endpoint tương ứng, 26 DTO khớp tên trường; 77 thân hàm service chỉ có stub.
- `mvn compile`: đã thành công với Java 21; không cần DB thật.
- Đã đi luồng trình duyệt: đăng nhập → phim → ngày chiếu → 2 ghế → combo → WELCOME10 → ví thất bại → thử lại bằng thẻ thành công → QR → Vé của tôi.
- Đã kiểm tra hiển thị vé ở 360px, USER bị chặn admin, thêm combo admin, Việt/Anh và sáng/tối/hệ thống.
- Đã thử hủy hộp thoại rời luồng rồi thanh toán thành công; xác nhận rời luồng nhả hold và đi đúng `/movies`.

Ảnh kiểm chứng: [vé mobile](docs/screenshots/tickets-mobile.jpg), [admin tiếng Anh chế độ sáng](docs/screenshots/admin-english-light.jpg), [đặt vé thành công](docs/screenshots/booking-success.jpg).

## Chưa làm hoặc cần lưu ý khi tiếp tục

1. **Nghiệp vụ backend, JPA, DB, JWT thật, WebSocket và lịch cleanup thật chưa được viết có chủ ý**, theo Phần 1/4. Backend chỉ đạt mục tiêu biên dịch khung; không xác nhận chạy ứng dụng kết nối DB.
2. Mock lưu trong bộ nhớ một tab, tải lại trang sẽ tạo dữ liệu mới. Chưa có đồng bộ giữ ghế giữa hai tab/thiết bị độc lập; backend thật sẽ đảm nhiệm việc đó. Tranh chấp hai tài khoản đã được thử trong cùng kho mock qua HTTP.
3. Đã kiểm tra luồng chính và các trường hợp lỗi quan trọng; chưa chạy kiểm thử hình ảnh tự động cho toàn bộ trang, mọi kích thước màn hình và mọi tổ hợp trường form. Không coi kết quả build là bằng chứng cho toàn bộ QA giao diện.
4. Kiểu hợp đồng chung giữ ở `src/types/index.ts`; `features/*/types.ts` tái xuất để tránh hai định nghĩa lệch nhau. Những luồng liên quan dùng component/UI và hook dùng chung thay vì tạo thư mục trống chỉ để giống sơ đồ.
5. Ngân hàng, email, lưu dữ liệu lâu dài và triển khai hosting không thuộc phạm vi mock hiện tại. Xem [Giả định trong README](README.md#giả-định) trước khi nối backend.

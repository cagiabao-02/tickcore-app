# Prompt tạo Cinema Booking (React + Spring Boot)

Cả tài liệu này là **một prompt duy nhất**: copy từ Phần 1 đến hết Phần 5 rồi đưa cho AI. Frontend dùng React + Vite + TypeScript; backend dùng Spring Boot, Maven, chia theo tầng.

---

## Phần 1: vai trò, mục tiêu và công nghệ

Bạn là một senior full-stack engineer. Hãy tạo giúp tôi project web đặt vé xem phim tên **Cinema Booking** dưới dạng monorepo gồm hai thư mục: `frontend/` (React) và `backend/` (Spring Boot).

**Mục tiêu**

- `frontend/` phải hoàn chỉnh, đầy đủ chức năng, chạy được ngay bằng dữ liệu giả (mock) mà không cần backend.
- `backend/` chỉ là khung sườn: các thư mục chia theo tầng, các file, và các hàm **để trống** kèm ghi chú nói rõ hàm làm gì. Tôi sẽ tự viết toàn bộ logic backend. Tuyệt đối không tự viết logic nghiệp vụ, truy vấn, hay cấu hình bảo mật chi tiết cho backend.
- Frontend gọi API qua một lớp service duy nhất, để sau này tôi chỉ cần tắt mock và trỏ sang Spring Boot thật mà không phải sửa code giao diện.

**Quy tắc làm việc**

1. Làm tuần tự theo từng bước ở phần "Tiêu chí hoàn thành"; xong mỗi bước thì chạy kiểm tra (build, lint) và sửa lỗi trước khi sang bước sau.
2. Mọi file, component, hook, service và hàm quan trọng đều có comment **tiếng Việt** ghi rõ chức năng (một đến hai dòng, không dài dòng).
3. Tên biến, hàm, file và thư mục dùng tiếng Anh. Văn bản hiển thị cho người dùng nằm trong file dịch, không viết cứng trong component.
4. TypeScript chế độ `strict`, không dùng `any`. Mọi dữ liệu từ API đều có kiểu khai báo.
5. Không bịa thêm chức năng ngoài danh sách; nếu thấy thiếu hoặc mâu thuẫn thì ghi vào cuối README mục "Giả định" và chọn phương án hợp lý nhất.
6. Không đưa khóa bí mật, mật khẩu thật hay đường dẫn riêng tư vào code. Dùng file `.env.example`.

**Công nghệ frontend**

- React 18, Vite, TypeScript (`strict`).
- React Router v6 cho điều hướng; route lazy-load theo trang.
- TanStack Query cho gọi API và cache; Axios làm HTTP client.
- Zustand cho trạng thái toàn cục nhỏ (auth, theme, ngôn ngữ, giỏ đặt vé).
- React Hook Form + Zod cho form và kiểm tra dữ liệu.
- Tailwind CSS cho giao diện (dùng chế độ `class` để làm tối/sáng); icon dùng `lucide-react`.
- `i18next` + `react-i18next` cho đa ngôn ngữ (tiếng Việt và tiếng Anh, mặc định tiếng Việt).
- Recharts cho biểu đồ trang admin; `date-fns` cho xử lý ngày giờ.
- MSW (Mock Service Worker) để giả lập API, bật tắt bằng biến môi trường.
- ESLint + Prettier; script `lint`, `build`, `dev` phải chạy không lỗi.

**Công nghệ backend (chỉ khung sườn)**

- Java 21, Spring Boot 3.x, **Maven**.
- Dependency: Spring Web, Spring Security, Spring Data JPA, Validation, WebSocket, Lombok, driver MySQL, jjwt (JWT), springdoc-openapi. Không cần cấu hình chạy được với DB thật; `application.yml` chỉ cần các khóa mẫu có chú thích.

**Định hướng giao diện**

- Phong cách rạp chiếu phim hiện đại: poster phim là trung tâm, màu nhấn đỏ cam trên nền trung tính, chữ dễ đọc.
- Thiết kế mobile-first, responsive tốt từ 360px đến màn hình rộng.
- Có đủ trạng thái tải (skeleton), trạng thái rỗng, trạng thái lỗi kèm nút thử lại, thông báo (toast) và trang 404.
- Hỗ trợ bàn phím và nhãn `aria` cho các thành phần chính (sơ đồ ghế, form, menu).

---

## Phần 2: cấu trúc thư mục và kiến trúc frontend

Hãy tổ chức `frontend/` theo từng chức năng (feature), mỗi chức năng tự chứa trang, component, hook, lớp gọi API và kiểu dữ liệu của riêng nó.

```text
frontend/
├─ .env.example              # VITE_API_BASE_URL, VITE_ENABLE_MOCK
├─ index.html
├─ vite.config.ts            # alias "@" -> src, proxy /api -> localhost:8080
├─ tailwind.config.ts
├─ public/
│  └─ mockServiceWorker.js   # file của MSW
└─ src/
   ├─ main.tsx
   ├─ app/                   # App.tsx, providers, router, queryClient
   ├─ routes/                # ProtectedRoute, AdminRoute, bảng route
   ├─ components/
   │  ├─ ui/                 # Button, Input, Modal, Tabs, Skeleton, Toast, Pagination...
   │  ├─ layout/             # Header, Footer, MainLayout, AdminLayout, Sidebar
   │  └─ common/             # ThemeToggle, LanguageSwitcher, EmptyState, ErrorState
   ├─ features/
   │  ├─ auth/               # đăng nhập, đăng ký, quên mật khẩu
   │  ├─ profile/            # hồ sơ, đổi mật khẩu
   │  ├─ movies/             # danh sách, chi tiết, tìm kiếm, lọc
   │  ├─ cinemas/            # rạp, thành phố
   │  ├─ showtimes/          # lịch chiếu theo ngày và rạp
   │  ├─ booking/            # sơ đồ ghế, giữ ghế, combo, mã giảm giá, tóm tắt
   │  ├─ payment/            # thanh toán mô phỏng, trang kết quả
   │  ├─ tickets/            # vé của tôi, chi tiết vé, mã QR, hủy vé
   │  ├─ reviews/            # đánh giá phim
   │  └─ admin/              # dashboard, movies, cinemas, rooms, showtimes,
   │                         # combos, promotions, bookings, users, reviews
   ├─ lib/                   # httpClient (axios), tokenStorage, format (tiền, ngày)
   ├─ stores/                # authStore, themeStore, languageStore, bookingStore
   ├─ hooks/                 # useDebounce, useCountdown, useSeatMapRealtime...
   ├─ i18n/                  # index.ts, locales/vi.json, locales/en.json
   ├─ mocks/                 # browser.ts, handlers/*.ts, data/*.ts (dữ liệu giả)
   ├─ types/                 # kiểu dùng chung (ApiError, Page<T>, Role...)
   └─ styles/                # index.css (Tailwind + biến màu sáng/tối)
```

Mỗi thư mục trong `features/` có cùng bố cục con: `pages/`, `components/`, `hooks/`, `api.ts` (các hàm gọi API), `types.ts`.

**Quy định kiến trúc**

1. **Lớp API:** chỉ `lib/httpClient.ts` và các `api.ts` được gọi Axios. Component không gọi Axios trực tiếp mà đi qua hook TanStack Query (`useMovies`, `useCreateBooking`...).
2. **Mock bằng MSW:** khi `VITE_ENABLE_MOCK=true`, MSW chặn đúng các đường dẫn của hợp đồng API ở Phần 4 và trả dữ liệu giả. Code `api.ts` không được rẽ nhánh theo mock; tắt biến này là frontend gọi thẳng Spring Boot.
3. **Dữ liệu giả phải đủ sống động:** ít nhất 12 phim (đang chiếu và sắp chiếu), 4 rạp ở 2 thành phố, mỗi rạp 3 phòng, suất chiếu trải 7 ngày tới, 6 combo, 4 mã giảm giá (một mã hết hạn, một mã có điều kiện đơn tối thiểu), vài tài khoản mẫu (một `USER`, một `ADMIN`) và vài đánh giá. Mock phải mô phỏng đúng nghiệp vụ: ghế đã đặt thì không giữ lại được, giữ ghế có thời hạn và tự hết hạn.
4. **Xác thực JWT:** lưu `accessToken` (và `refreshToken` nếu có) qua `tokenStorage`; interceptor tự gắn header `Authorization: Bearer <token>`; gặp 401 thì thử refresh một lần, thất bại thì đăng xuất và chuyển về trang đăng nhập kèm đường dẫn quay lại. Có hai vai trò `USER` và `ADMIN`; `ProtectedRoute` chặn người chưa đăng nhập, `AdminRoute` chặn người không phải admin.
5. **Giao diện sáng/tối:** ba chế độ `light`, `dark`, `system`; nút chuyển trên header; lưu lựa chọn vào `localStorage`; áp dụng trước khi render để tránh nháy màu. Dùng biến màu CSS, không viết cứng màu trong component.
6. **Đa ngôn ngữ:** tiếng Việt và tiếng Anh, nút chuyển trên header, lưu lựa chọn. Ngày giờ và tiền tệ định dạng theo ngôn ngữ (VND dùng `Intl.NumberFormat`). Tên phim, mô tả lấy từ dữ liệu, không dịch.
7. **Giữ ghế theo thời gian thực:** viết hook `useSeatMapRealtime(showtimeId)` mặc định dùng polling 5 giây; để sẵn chú thích chỗ thay bằng WebSocket/STOMP của Spring Boot sau này. Hook `useCountdown(expiresAt)` đếm ngược thời gian giữ ghế.
8. **Xử lý lỗi thống nhất:** mọi lỗi API được chuẩn hóa thành `ApiError { status, code, message, details }`, hiển thị bằng toast hoặc `ErrorState`.

---

## Phần 3: chức năng frontend (phải làm đủ)

Cột "Ghi chú" là yêu cầu chi tiết; hãy chép ý chính vào comment đầu file của trang hoặc component tương ứng.

### Phía khách hàng

| # | Chức năng | Đường dẫn | Ghi chú |
| --- | --- | --- | --- |
| 1 | Trang chủ | `/` | Banner trượt tự động; hai khu "Đang chiếu" và "Sắp chiếu" dạng lưới poster; ô tìm kiếm nhanh; khu combo và khuyến mãi nổi bật |
| 2 | Danh sách phim | `/movies` | Tab Đang chiếu / Sắp chiếu; lọc theo thể loại, ngôn ngữ, độ tuổi; tìm theo tên có debounce; sắp xếp theo mới nhất và điểm; phân trang; trạng thái lọc nằm trên URL để chia sẻ được |
| 3 | Chi tiết phim | `/movies/:id` | Poster, trailer nhúng, thời lượng, thể loại, độ tuổi, đạo diễn, diễn viên, mô tả, điểm trung bình; lịch chiếu theo ngày và rạp; khu đánh giá; nút "Đặt vé" cuộn tới lịch chiếu |
| 4 | Chọn rạp và suất chiếu | trong trang chi tiết phim | Chọn thành phố, rạp, ngày (thanh 7 ngày); suất chiếu hiển thị giờ, định dạng 2D/3D/IMAX, phụ đề/lồng tiếng, số ghế còn; suất đã qua giờ bị làm mờ và không bấm được |
| 5 | Chọn ghế | `/booking/:showtimeId/seats` | Sơ đồ ghế theo hàng A, B, C...; loại ghế thường, VIP, đôi; trạng thái trống, đang chọn, đã đặt, đang bị người khác giữ; tối đa 8 ghế mỗi lần; hiện tổng tiền theo loại ghế; chú thích màu; sơ đồ cuộn ngang được trên điện thoại |
| 6 | Giữ ghế tạm thời | cùng trang chọn ghế | Khi bấm "Tiếp tục" gọi API giữ ghế, nhận `holdId` và `expiresAt`; đồng hồ đếm ngược 10 phút hiện cố định trên đầu trang; hết giờ thì nhả ghế, báo bằng modal và đưa về lại sơ đồ ghế; rời trang thì có hộp xác nhận |
| 7 | Chọn combo bắp nước | `/booking/:showtimeId/combos` | Danh sách combo có ảnh, mô tả, giá; tăng giảm số lượng; có thể bỏ qua bước này |
| 8 | Mã giảm giá | trong trang tóm tắt | Nhập mã, bấm áp dụng; hiện số tiền giảm hoặc lỗi cụ thể (hết hạn, không đủ điều kiện, sai mã); gỡ mã được |
| 9 | Tóm tắt đơn và thanh toán mô phỏng | `/booking/:showtimeId/checkout` | Tóm tắt phim, rạp, phòng, giờ, ghế, combo, giảm giá, tổng tiền; chọn phương thức (thẻ, ví điện tử, chuyển khoản QR) toàn bộ là giả lập; nút "Thanh toán" có trạng thái đang xử lý; mock trả thành công hoặc thất bại để thử cả hai nhánh; vẫn hiện đồng hồ giữ ghế |
| 10 | Kết quả đặt vé | `/booking/result/:bookingId` | Thành công: mã đặt vé, mã QR, thông tin vé, nút xem "Vé của tôi"; thất bại: lý do và nút thử lại |
| 11 | Vé của tôi | `/tickets` | Tab Sắp tới / Đã xem / Đã hủy; chi tiết vé có mã QR; hủy vé khi còn trên 2 giờ trước giờ chiếu, có hộp xác nhận |
| 12 | Đăng ký, đăng nhập | `/register`, `/login` | Kiểm tra dữ liệu bằng Zod; hiện lỗi từng ô; ẩn/hiện mật khẩu; "ghi nhớ đăng nhập"; sau đăng nhập quay lại trang đang xem dở |
| 13 | Quên và đặt lại mật khẩu | `/forgot-password`, `/reset-password` | Chỉ cần giao diện và gọi API; mock luôn báo đã gửi email |
| 14 | Hồ sơ cá nhân | `/profile` | Xem và sửa họ tên, số điện thoại, ngày sinh, ảnh đại diện; đổi mật khẩu |
| 15 | Đánh giá phim | trong `/movies/:id` | Chấm 1 đến 5 sao kèm bình luận; chỉ người đã có vé suất đã chiếu mới được đánh giá, người khác thấy lời nhắc; sửa và xóa đánh giá của mình; danh sách có phân trang và sắp xếp mới nhất / điểm cao |
| 16 | Đa ngôn ngữ | toàn site | Nút chuyển Việt / Anh trên header; lưu lựa chọn |
| 17 | Giao diện sáng/tối | toàn site | Ba chế độ light, dark, system; lưu lựa chọn |
| 18 | Trang phụ trợ | `*`, `/403` | Trang 404, trang không có quyền, giao diện lỗi mạng |

### Phía quản trị (đường dẫn bắt đầu bằng `/admin`, chỉ role ADMIN)

| # | Chức năng | Ghi chú |
| --- | --- | --- |
| 1 | Dashboard | Thẻ số liệu (doanh thu, số vé, số suất chiếu, người dùng mới); biểu đồ doanh thu theo ngày/tháng; top 5 phim bán chạy; tỷ lệ lấp đầy ghế theo rạp; chọn khoảng thời gian |
| 2 | Quản lý phim | Bảng có tìm kiếm, lọc, phân trang; thêm, sửa, xóa; form có poster, trailer, thể loại, thời lượng, độ tuổi, ngày khởi chiếu, trạng thái (sắp chiếu, đang chiếu, ngừng chiếu) |
| 3 | Quản lý rạp | CRUD rạp: tên, thành phố, địa chỉ, số điện thoại |
| 4 | Quản lý phòng chiếu | CRUD phòng thuộc rạp; **trình chỉnh sơ đồ ghế**: đặt số hàng, số cột, bấm từng ô để đổi loại ghế (thường, VIP, đôi, lối đi) |
| 5 | Quản lý suất chiếu | CRUD suất chiếu theo phim, phòng, giờ, định dạng, giá cơ bản; báo lỗi nếu trùng giờ trong cùng phòng; xem dạng bảng và dạng lịch theo ngày |
| 6 | Giá vé | Cấu hình giá theo loại ghế và phụ thu theo định dạng (3D, IMAX), cuối tuần |
| 7 | Quản lý combo | CRUD combo: tên, mô tả, ảnh, giá, bật/tắt bán |
| 8 | Quản lý mã giảm giá | CRUD mã: loại (phần trăm hoặc số tiền), giá trị, đơn tối thiểu, giảm tối đa, ngày hiệu lực, số lượt dùng, bật/tắt |
| 9 | Quản lý đặt vé | Bảng đơn đặt vé; lọc theo trạng thái, ngày, phim; xem chi tiết; hủy đơn |
| 10 | Quản lý người dùng | Danh sách, tìm kiếm; khóa/mở khóa; đổi vai trò USER/ADMIN |
| 11 | Quản lý đánh giá | Danh sách đánh giá; ẩn hoặc xóa đánh giá vi phạm |

Mọi bảng admin dùng chung một component bảng có sắp xếp, phân trang, trạng thái tải và trạng thái rỗng. Mọi thao tác xóa đều có hộp xác nhận.

---

## Phần 4: khung sườn backend và hợp đồng API

Tạo `backend/` theo **tầng** (package-by-layer), package gốc `com.cinema.booking`, build bằng **Maven**. Trong mỗi tầng, file đặt tên theo chức năng, ví dụ `MovieController`, `MovieService`, `MovieRepository`, `Movie`, `MovieResponse`.

```text
backend/
├─ pom.xml                       # Maven: Spring Boot parent + các dependency ở Phần 1
└─ src/main/
   ├─ resources/application.yml  # khóa mẫu: datasource, jwt.secret, jwt.expiration, cors.allowed-origins
   └─ java/com/cinema/booking/
      ├─ CinemaBookingApplication.java
      ├─ config/        # SecurityConfig, CorsConfig, OpenApiConfig, WebSocketConfig, SchedulerConfig
      ├─ security/      # JwtService, JwtAuthenticationFilter, CustomUserDetailsService
      ├─ controller/    # AuthController, UserController, MovieController, CinemaController,
      │                 # ShowtimeController, SeatHoldController, BookingController, PaymentController,
      │                 # ComboController, PromotionController, ReviewController
      │   └─ admin/     # AdminDashboardController, AdminMovieController, AdminCinemaController,
      │                 # AdminRoomController, AdminShowtimeController, AdminComboController,
      │                 # AdminPromotionController, AdminBookingController, AdminUserController,
      │                 # AdminReviewController
      ├─ service/       # AuthService, UserService, MovieService, CinemaService, RoomService,
      │                 # ShowtimeService, SeatHoldService, BookingService, PaymentService,
      │                 # ComboService, PromotionService, ReviewService, DashboardService
      ├─ repository/    # một repository cho mỗi entity
      ├─ entity/        # User, Movie, Genre, Cinema, Room, Seat, Showtime, SeatHold, Booking,
      │                 # BookingSeat, BookingCombo, Payment, Combo, Promotion, Review
      ├─ dto/
      │   ├─ request/   # LoginRequest, RegisterRequest, SeatHoldRequest, CreateBookingRequest...
      │   └─ response/  # MovieResponse, ShowtimeResponse, SeatMapResponse, SeatHoldResponse,
      │                 # BookingResponse, PageResponse, ApiError...
      ├─ exception/     # GlobalExceptionHandler, BusinessException, NotFoundException
      ├─ scheduler/     # SeatHoldCleanupJob, PendingBookingExpireJob
      └─ util/          # CodeGenerator (mã đặt vé), DateTimeUtil
```

**Cách viết khung sườn**

1. **Ranh giới tầng:** controller chỉ gọi service; service gọi repository; controller và service nhận, trả DTO chứ không trả entity trực tiếp.
2. **Controller:** khai báo đầy đủ `@RestController`, `@RequestMapping`, `@GetMapping`/`@PostMapping`... đúng đường dẫn ở bảng bên dưới, kèm ghi chú quyền truy cập (công khai, USER, ADMIN). Thân hàm gọi service hoặc để trống, không thêm logic.
3. **Service:** mỗi service là một class với các hàm để trống theo bảng "Hàm service" bên dưới.
4. **Repository:** chỉ tạo interface kế thừa `JpaRepository`, kèm comment liệt kê các truy vấn cần viết (tên hàm và ý nghĩa), không viết `@Query`.
5. **Entity:** chỉ khai báo class và comment liệt kê các trường, khóa ngoại, quan hệ dự kiến; không viết annotation JPA.
6. **DTO:** viết thành `record` Java với các trường khớp **đúng tên và kiểu** với `types.ts` ở frontend, để hai phía ăn khớp.
7. **Bảo mật và cấu hình:** các class trong `config/` và `security/` chỉ có khung và comment mô tả việc cần làm (ví dụ "cho phép `/api/v1/auth/**`, chặn `/api/v1/admin/**` nếu không có role ADMIN").
8. **Thân hàm** luôn có dạng sau để project biên dịch được (`mvn compile` không lỗi):

```java
/**
 * Giữ ghế tạm thời cho một suất chiếu.
 * - Kiểm tra các ghế còn trống và chưa bị người khác giữ.
 * - Tạo bản ghi giữ ghế hết hạn sau 10 phút.
 * - Trả về holdId và expiresAt cho frontend đếm ngược.
 */
public SeatHoldResponse holdSeats(Long showtimeId, SeatHoldRequest request) {
    // TODO: tự cài đặt
    throw new UnsupportedOperationException("Chưa cài đặt");
}
```

**Hàm service cần có (để trống, có ghi chú)**

| Module | Hàm chính |
| --- | --- |
| auth | `register`, `login`, `refreshToken`, `logout`, `forgotPassword`, `resetPassword` |
| user | `getMyProfile`, `updateMyProfile`, `changePassword`; admin: `searchUsers`, `lockUser`, `unlockUser`, `changeRole` |
| movie | `searchMovies` (lọc, tìm, phân trang), `getMovieDetail`, `listGenres`; admin: `createMovie`, `updateMovie`, `deleteMovie` |
| cinema | `listCities`, `listCinemas`, `getCinema`; admin: CRUD rạp, CRUD phòng, `saveSeatLayout` |
| showtime | `searchShowtimes`, `getShowtime`, `getSeatMap`, `calculatePrice`; admin: `createShowtime`, `updateShowtime`, `deleteShowtime`, `checkRoomConflict` |
| booking | `holdSeats`, `releaseHold`, `createBooking`, `getMyBookings`, `getBookingDetail`, `cancelBooking`; job định kỳ: `releaseExpiredHolds`, `expirePendingBookings`; admin: `searchBookings`, `cancelBookingAsAdmin` |
| payment | `simulatePayment` (chỉ ghi nhận kết quả giả lập, cập nhật trạng thái đơn) |
| combo | `listActiveCombos`; admin: CRUD combo |
| promotion | `validatePromotion`, `calculateDiscount`; admin: CRUD mã giảm giá |
| review | `listReviews`, `createReview`, `updateReview`, `deleteReview`, `canUserReview`; admin: `hideReview`, `deleteReviewAsAdmin` |
| dashboard | `getSummary`, `getRevenueByDay`, `getTopMovies`, `getOccupancyByCinema` |

### Hợp đồng API (frontend, mock và backend đều phải theo)

Quy ước chung: tiền tệ là số nguyên VND; thời gian theo ISO-8601; khóa chính kiểu `Long`; danh sách phân trang trả `{ content, page, size, totalElements, totalPages }`; lỗi trả `{ status, code, message, details, timestamp }`; xác thực bằng header `Authorization: Bearer <JWT>`.

| Phương thức | Đường dẫn (tiền tố `/api/v1`) | Mô tả | Quyền |
| --- | --- | --- | --- |
| POST | `/auth/register` | Đăng ký | Công khai |
| POST | `/auth/login` | Đăng nhập, trả access và refresh token | Công khai |
| POST | `/auth/refresh` | Làm mới token | Công khai |
| POST | `/auth/logout` | Đăng xuất | USER |
| POST | `/auth/forgot-password`, `/auth/reset-password` | Quên và đặt lại mật khẩu | Công khai |
| GET, PUT | `/users/me` | Xem và sửa hồ sơ | USER |
| PUT | `/users/me/password` | Đổi mật khẩu | USER |
| GET | `/movies` | Danh sách phim (`status`, `genre`, `language`, `keyword`, `sort`, `page`, `size`) | Công khai |
| GET | `/movies/{id}` | Chi tiết phim | Công khai |
| GET | `/genres` | Danh sách thể loại | Công khai |
| GET | `/cities`, `/cinemas`, `/cinemas/{id}` | Thành phố và rạp (`city`) | Công khai |
| GET | `/showtimes` | Suất chiếu (`movieId`, `cinemaId`, `date`) | Công khai |
| GET | `/showtimes/{id}` | Chi tiết một suất chiếu | Công khai |
| GET | `/showtimes/{id}/seats` | Sơ đồ ghế và trạng thái từng ghế | Công khai |
| POST | `/showtimes/{id}/seat-holds` | Giữ ghế (`seatIds`), trả `holdId`, `expiresAt` | USER |
| DELETE | `/seat-holds/{holdId}` | Nhả ghế đang giữ | USER |
| GET | `/combos` | Combo đang bán | Công khai |
| POST | `/promotions/validate` | Kiểm tra mã (`code`, `subtotal`), trả số tiền giảm | USER |
| POST | `/bookings` | Tạo đơn từ `holdId`, `combos`, `promoCode` | USER |
| GET | `/bookings/me` | Vé của tôi (`status`, phân trang) | USER |
| GET | `/bookings/{id}` | Chi tiết đơn | USER |
| POST | `/bookings/{id}/cancel` | Hủy vé | USER |
| POST | `/payments/simulate` | Thanh toán mô phỏng (`bookingId`, `method`) | USER |
| GET | `/movies/{id}/reviews` | Danh sách đánh giá | Công khai |
| POST | `/movies/{id}/reviews` | Viết đánh giá | USER |
| PUT, DELETE | `/reviews/{id}` | Sửa và xóa đánh giá của mình | USER |
| GET | `/admin/dashboard/summary`, `/revenue`, `/top-movies`, `/occupancy` | Số liệu thống kê (`from`, `to`) | ADMIN |
| CRUD | `/admin/movies`, `/admin/cinemas`, `/admin/rooms`, `/admin/showtimes`, `/admin/combos`, `/admin/promotions` | Thêm, sửa, xóa, danh sách | ADMIN |
| PUT | `/admin/rooms/{id}/seat-layout` | Lưu sơ đồ ghế phòng chiếu | ADMIN |
| GET, POST | `/admin/bookings`, `/admin/bookings/{id}/cancel` | Danh sách và hủy đơn | ADMIN |
| GET, PUT | `/admin/users`, `/admin/users/{id}/lock`, `/admin/users/{id}/role` | Quản lý người dùng | ADMIN |
| GET, PUT | `/admin/reviews`, `/admin/reviews/{id}/hide` | Quản lý đánh giá | ADMIN |

---

## Phần 5: các bước làm và tiêu chí hoàn thành

Làm lần lượt theo các bước sau; cuối mỗi bước chạy kiểm tra và sửa lỗi rồi mới đi tiếp.

1. **Khởi tạo frontend:** Vite + React + TypeScript, cài thư viện, cấu hình alias, Tailwind, ESLint, Prettier, `.env.example`, proxy `/api`.
2. **Nền tảng:** `types/`, `lib/httpClient`, `stores/`, i18n (hai file dịch), theme sáng/tối, router, `ProtectedRoute`, `AdminRoute`, bộ component UI dùng chung và layout.
3. **Mock:** dữ liệu giả và handler MSW cho toàn bộ hợp đồng API ở Phần 4.
4. **Chức năng khách hàng:** làm theo thứ tự 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 13, 16, 17, 18 trong bảng Phần 3.
5. **Chức năng admin:** dashboard trước, rồi các trang quản lý theo thứ tự bảng.
6. **Backend:** khung sườn theo Phần 4.
7. **README.md** ở thư mục gốc và trong từng thư mục con: cách cài, cách chạy, cách tắt mock để nối backend thật, sơ đồ thư mục, danh sách tài khoản mock, mục "Giả định".

**Tiêu chí hoàn thành**

- `npm run dev`, `npm run lint`, `npm run build` chạy không lỗi.
- Có thể đi hết luồng từ trang chủ, chọn phim, chọn suất, chọn ghế, chọn combo, áp mã, thanh toán giả lập đến xem vé trong "Vé của tôi" chỉ với dữ liệu mock.
- Mọi trang ở bảng Phần 3 đều truy cập được; trang admin bị chặn với tài khoản USER.
- Chuyển ngôn ngữ và chuyển sáng/tối hoạt động ở mọi trang, không còn chữ cứng chưa dịch.
- Hết giờ giữ ghế thì ghế được nhả và người dùng được thông báo.
- `mvn compile` trong `backend/` không lỗi; mọi hàm service đều để trống và có comment tiếng Việt mô tả.
- Đường dẫn trong frontend (`api.ts`), handler mock và controller backend trùng khớp với bảng hợp đồng API.
- Không có logic nghiệp vụ backend nào được tự viết.

Khi xong, báo ngắn gọn: những gì đã làm, những gì chưa làm hoặc còn nghi vấn, và các giả định đã chọn.

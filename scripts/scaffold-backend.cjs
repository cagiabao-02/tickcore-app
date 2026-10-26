/** Tạo khung Java một lần từ hợp đồng TypeScript; không cài đặt nghiệp vụ backend. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('../frontend/node_modules/typescript');
const root = path.resolve(__dirname, '..', 'backend');
if (fs.existsSync(root)) throw new Error('Backend đã tồn tại; không được ghi đè bằng bộ tạo khung.');
const base = 'src/main/java/com/cinema/booking/';
function write(file, source) { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, source + '\n'); }
function java(pkg, name, body, imports = '') { write(base + pkg.replaceAll('.', '/') + '/' + name + '.java', `package com.cinema.booking.${pkg};\n\n${imports}\n${body}`); }
write('pom.xml', `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.2.5</version><relativePath/></parent>
  <groupId>com.cinema</groupId><artifactId>booking</artifactId><version>0.0.1-SNAPSHOT</version><name>Cinema Booking</name>
  <properties><java.version>21</java.version><project.build.sourceEncoding>UTF-8</project.build.sourceEncoding></properties>
  <dependencies>
    ${['web','security','data-jpa','validation','websocket'].map((name) => `<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-${name}</artifactId></dependency>`).join('\n    ')}
    <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
    <dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId><scope>runtime</scope></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-api</artifactId><version>0.12.5</version></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-impl</artifactId><version>0.12.5</version><scope>runtime</scope></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-jackson</artifactId><version>0.12.5</version><scope>runtime</scope></dependency>
    <dependency><groupId>org.springdoc</groupId><artifactId>springdoc-openapi-starter-webmvc-ui</artifactId><version>2.5.0</version></dependency>
  </dependencies>
  <build><plugins><plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin></plugins></build>
</project>`);
write('src/main/resources/application.yml', `# Giá trị mẫu; chủ dự án tự cấu hình DB, JWT và bảo mật khi cài đặt backend.
spring:
  datasource:
    url: ${'${'}DB_URL:jdbc:mysql://localhost:3306/cinema_booking}
    username: ${'${'}DB_USERNAME:}
    password: ${'${'}DB_PASSWORD:}
  jpa:
    hibernate:
      ddl-auto: none # Chưa có entity JPA; tự thiết kế schema trước khi chạy.
jwt:
  secret: ${'${'}JWT_SECRET:} # Không đặt khóa thật trong mã nguồn.
  expiration: ${'${'}JWT_EXPIRATION:3600000}
cors:
  allowed-origins: ${'${'}CORS_ALLOWED_ORIGINS:http://localhost:3000}`);
write('src/main/java/com/cinema/booking/CinemaBookingApplication.java', `package com.cinema.booking;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
/** Điểm khởi động; khung chỉ yêu cầu biên dịch, chưa chạy với cơ sở dữ liệu. */
@SpringBootApplication
public class CinemaBookingApplication {
    public static void main(String[] args) { SpringApplication.run(CinemaBookingApplication.class, args); }
}`);
// DTO record lấy đúng tên trường và cấu trúc JSON từ hợp đồng hiện có.
const source = ts.createSourceFile('types.ts', fs.readFileSync(path.resolve(__dirname, '../frontend/src/types/index.ts'), 'utf8'), ts.ScriptTarget.Latest, true);
const interfaces = new Map(source.statements.filter(ts.isInterfaceDeclaration).map((node) => [node.name.text, node]));
const dtoName = (name) => name === 'Page' ? 'PageResponse' : name === 'ApiError' || name.endsWith('Response') ? name : name + 'Response';
function type(node, field, owner) {
  if (ts.isUnionTypeNode(node)) return type(node.types.find((part) => part.kind !== ts.SyntaxKind.NullKeyword && !(ts.isLiteralTypeNode(part) && part.literal.kind === ts.SyntaxKind.NullKeyword)), field, owner);
  if (node.kind === ts.SyntaxKind.StringKeyword) return 'String';
  if (node.kind === ts.SyntaxKind.BooleanKeyword) return 'Boolean';
  if (node.kind === ts.SyntaxKind.NumberKeyword) {
    if (/^(id|.*Id)$/.test(field)) return 'Long';
    if (/price|amount|revenue|discount|subtotal|surcharge/i.test(field) && field !== 'revenueChange') return 'Long';
    if (/averageRating|Rate|Change/.test(field)) return 'Double';
    return 'Integer';
  }
  if (ts.isArrayTypeNode(node)) return `List<${type(node.elementType, field === 'seatIds' ? 'id' : field, owner)}>`;
  if (ts.isTypeReferenceNode(node)) {
    const name = node.typeName.getText(source);
    if (name === 'T') return 'T';
    if (name === 'Record') return 'Map<String, String>';
    if (name === 'Array') return `List<${type(node.typeArguments[0], field, owner)}>`;
    return interfaces.has(name) ? dtoName(name) : 'String';
  }
  if (ts.isTypeLiteralNode(node)) {
    const name = owner + field[0].toUpperCase() + field.slice(1) + 'Item';
    record(name, node.members);
    return name;
  }
  throw new Error('Không hỗ trợ kiểu: ' + node.getText(source));
}
function record(name, members, generic = '') {
  const fields = members.filter(ts.isPropertySignature).map((member) => `${type(member.type, member.name.getText(source), name)} ${member.name.getText(source)}`);
  java('dto.response', name, `/** Dữ liệu ${name}; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */\npublic record ${name}${generic}(${fields.join(', ')}) {}`, 'import java.util.List;\nimport java.util.Map;');
}
for (const [name, node] of interfaces) record(dtoName(name), node.members, name === 'Page' ? '<T>' : '');
java('dto.response', 'MessageResponse', '/** Thông báo kết quả thao tác. */\npublic record MessageResponse(String message) {}');
java('dto.response', 'PaymentSimulationResponse', '/** Kết quả thanh toán mô phỏng. */\npublic record PaymentSimulationResponse(Boolean success, BookingResponse booking) {}');
const requests = {
  LoginRequest: 'String email, String password', RegisterRequest: 'String email, String fullName, String password',
  RefreshTokenRequest: 'String refreshToken', ForgotPasswordRequest: 'String email', ResetPasswordRequest: 'String token, String password',
  UpdateProfileRequest: 'String fullName, String phone, String dateOfBirth, String avatarUrl', ChangePasswordRequest: 'String currentPassword, String newPassword',
  SeatHoldRequest: 'List<Long> seatIds', BookingComboRequest: 'Long comboId, Integer quantity',
  CreateBookingRequest: 'Long holdId, Long showtimeId, List<BookingComboRequest> combos, String promoCode',
  PaymentRequest: 'Long bookingId, String method', PromotionValidationRequest: 'String code, Long subtotal',
  ReviewRequest: 'Integer rating, String comment', RoleRequest: 'String role',
  MovieSearchRequest: 'String status, String genre, String language, String ageRating, String keyword, String sort, Integer page, Integer size',
  ShowtimeSearchRequest: 'Long movieId, Long cinemaId, String date',
  SearchRequest: 'String keyword, String status, String from, String to, Long movieId, Long cinemaId, Integer page, Integer size',
  ReviewSearchRequest: 'String sort, Integer page, Integer size', DateRangeRequest: 'String from, String to',
};
for (const [name, fields] of Object.entries(requests)) java('dto.request', name, `/** Tham số ${name} từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */\npublic record ${name}(${fields}) {}`, 'import java.util.List;');
for (const name of ['Movie','Cinema','Room','Showtime','Combo','Promotion']) {
  const node = interfaces.get(name);
  const fields = node.members.filter(ts.isPropertySignature).map((member) => `${type(member.type, member.name.getText(source), dtoName(name))} ${member.name.getText(source)}`);
  java('dto.request', name + 'Request', `/** Dữ liệu quản trị ${name}; trường do máy chủ tạo có thể để null. */\npublic record ${name}Request(${fields.join(', ')}) {}`, 'import java.util.List;\nimport java.util.Map;\nimport com.cinema.booking.dto.response.*;');
}
const entities = {
  User: 'id, email, passwordHash, fullName, phone, dateOfBirth, avatarUrl, role, locked, createdAt; một-nhiều Booking và Review',
  Movie: 'id, title, originalTitle, posterUrl, bannerUrl, trailerUrl, description, duration, releaseDate, endDate, language, ageRating, director, cast, status; nhiều-nhiều Genre; một-nhiều Showtime và Review',
  Genre: 'id, name, slug; nhiều-nhiều Movie', Cinema: 'id, name, city, address, phone; một-nhiều Room', Room: 'id, name, cinemaId, totalRows, totalColumns; nhiều-một Cinema; một-nhiều Seat và Showtime',
  Seat: 'id, roomId, row, column, type; nhiều-một Room', Showtime: 'id, movieId, roomId, startTime, endTime, format, subtitleType, basePrice; nhiều-một Movie và Room',
  SeatHold: 'id, userId, showtimeId, expiresAt; liên kết các Seat đang giữ', Booking: 'id, bookingCode, userId, showtimeId, holdId, status, subtotal, discount, totalAmount, promoCode, createdAt; một-nhiều BookingSeat và BookingCombo; một-một Payment',
  BookingSeat: 'id, bookingId, seatId, price; nhiều-một Booking và Seat', BookingCombo: 'id, bookingId, comboId, quantity, price; nhiều-một Booking và Combo',
  Payment: 'id, bookingId, method, status, amount, createdAt; một-một Booking', Combo: 'id, name, description, imageUrl, price, active',
  Promotion: 'id, code, type, value, minOrderAmount, maxDiscount, startDate, endDate, usageLimit, usedCount, active', Review: 'id, userId, movieId, rating, comment, hidden, createdAt, updatedAt; nhiều-một User và Movie',
};
for (const [name, fields] of Object.entries(entities)) {
  java('entity', name, `/** Dự kiến: ${fields}. Chưa khai báo trường hoặc annotation JPA. */\npublic class ${name} {}`);
  java('repository', name + 'Repository', `/** TODO: findById: lấy ${name}; findAll: phân trang; bổ sung truy vấn lọc theo các khóa liên kết của entity. Không viết @Query ở khung. */\npublic interface ${name}Repository extends JpaRepository<${name}, Long> {}`, `import org.springframework.data.jpa.repository.JpaRepository;\nimport com.cinema.booking.entity.${name};`);
}
const services = {};
const endpoints = {};
function endpoint(controller, service, verb, url, name, result, params = [], note = '') {
  (services[service] ||= new Map()).set(name + params.map((p) => p.type).join(','), { name, result, params, note });
  (endpoints[controller] ||= []).push({ service, verb, url, name, result, params, note });
}
const body = (type, name = 'request') => ({ type, name, annotation: '@Valid @RequestBody' });
const id = (name = 'id') => ({ type: 'Long', name, annotation: `@PathVariable("${name}")` });
const query = (type) => ({ type, name: 'query', annotation: '@ModelAttribute' });
const E = endpoint;
for (const [url, name, result, request] of [
  ['register','register','MessageResponse','RegisterRequest'], ['login','login','AuthTokensResponse','LoginRequest'], ['refresh','refreshToken','AuthTokensResponse','RefreshTokenRequest'], ['logout','logout','MessageResponse',null], ['forgot-password','forgotPassword','MessageResponse','ForgotPasswordRequest'], ['reset-password','resetPassword','MessageResponse','ResetPasswordRequest'],
]) E('AuthController','AuthService','Post',`/auth/${url}`,name,result,request ? [body(request)] : [], url === 'logout' ? 'USER: đăng xuất và thu hồi phiên.' : 'Công khai: xử lý xác thực tương ứng.');
E('UserController','UserService','Get','/users/me','getMyProfile','UserResponse',[],'USER: lấy hồ sơ tài khoản hiện tại.');
E('UserController','UserService','Put','/users/me','updateMyProfile','UserResponse',[body('UpdateProfileRequest')],'USER: chỉ sửa các trường hồ sơ được phép.');
E('UserController','UserService','Put','/users/me/password','changePassword','MessageResponse',[body('ChangePasswordRequest')],'USER: kiểm tra mật khẩu cũ và đổi mật khẩu.');
E('MovieController','MovieService','Get','/movies','searchMovies','PageResponse<MovieResponse>',[query('MovieSearchRequest')],'Công khai: lọc, tìm kiếm, sắp xếp và phân trang phim.');
E('MovieController','MovieService','Get','/movies/{id}','getMovieDetail','MovieResponse',[id()],'Công khai: lấy thông tin phim và điểm đánh giá.');
E('MovieController','MovieService','Get','/genres','listGenres','List<GenreResponse>',[],'Công khai: liệt kê thể loại.');
E('CinemaController','CinemaService','Get','/cities','listCities','List<CityResponse>',[],'Công khai: liệt kê thành phố có rạp.');
E('CinemaController','CinemaService','Get','/cinemas','listCinemas','List<CinemaResponse>',[{ type:'Long', name:'city', annotation:'@RequestParam(value = "city", required = false)' }],'Công khai: lọc rạp theo thành phố.');
E('CinemaController','CinemaService','Get','/cinemas/{id}','getCinema','CinemaResponse',[id()],'Công khai: lấy chi tiết rạp.');
E('ShowtimeController','ShowtimeService','Get','/showtimes','searchShowtimes','List<ShowtimeResponse>',[query('ShowtimeSearchRequest')],'Công khai: lọc lịch theo phim, rạp và ngày.');
E('ShowtimeController','ShowtimeService','Get','/showtimes/{id}','getShowtime','ShowtimeResponse',[id()],'Công khai: lấy thông tin suất chiếu.');
E('ShowtimeController','ShowtimeService','Get','/showtimes/{id}/seats','getSeatMap','SeatMapResponse',[id()],'Công khai: lấy ghế cùng trạng thái và giá theo cấu hình.');
E('SeatHoldController','SeatHoldService','Post','/showtimes/{id}/seat-holds','holdSeats','SeatHoldResponse',[id(),body('SeatHoldRequest')],'USER: kiểm tra ghế trống, giữ tối đa 8 ghế trong 10 phút, trả holdId và expiresAt.');
E('SeatHoldController','SeatHoldService','Delete','/seat-holds/{holdId}','releaseHold','MessageResponse',[id('holdId')],'USER: kiểm tra chủ sở hữu và nhả các ghế đang giữ.');
E('BookingController','BookingService','Post','/bookings','createBooking','BookingResponse',[body('CreateBookingRequest')],'USER: kiểm tra hold còn hạn, giá combo và điều kiện mã, tạo đơn chờ.');
E('BookingController','BookingService','Get','/bookings/me','getMyBookings','PageResponse<BookingResponse>',[query('SearchRequest')],'USER: lọc vé theo trạng thái và phân trang.');
E('BookingController','BookingService','Get','/bookings/{id}','getBookingDetail','BookingResponse',[id()],'USER: chỉ lấy đơn thuộc tài khoản hiện tại.');
E('BookingController','BookingService','Post','/bookings/{id}/cancel','cancelBooking','BookingResponse',[id()],'USER: chỉ hủy vé của mình khi còn trên 2 giờ trước suất chiếu.');
E('PaymentController','PaymentService','Post','/payments/simulate','simulatePayment','PaymentSimulationResponse',[body('PaymentRequest')],'USER: ghi nhận kết quả giả lập, cập nhật trạng thái đơn; không tích hợp thanh toán thật.');
E('ComboController','ComboService','Get','/combos','listActiveCombos','List<ComboResponse>',[],'Công khai: liệt kê combo đang bán.');
E('PromotionController','PromotionService','Post','/promotions/validate','validatePromotion','PromotionValidationResponse',[body('PromotionValidationRequest')],'USER: kiểm tra hiệu lực, lượt dùng, mức tối thiểu và giảm tối đa.');
E('ReviewController','ReviewService','Get','/movies/{id}/reviews','listReviews','PageResponse<ReviewResponse>',[id(),query('ReviewSearchRequest')],'Công khai: phân trang, sắp xếp, không trả đánh giá bị ẩn.');
E('ReviewController','ReviewService','Post','/movies/{id}/reviews','createReview','ReviewResponse',[id(),body('ReviewRequest')],'USER: chỉ tạo khi có vé đã chiếu và chưa đánh giá phim.');
E('ReviewController','ReviewService','Put','/reviews/{id}','updateReview','ReviewResponse',[id(),body('ReviewRequest')],'USER: chỉ sửa đánh giá của mình.');
E('ReviewController','ReviewService','Delete','/reviews/{id}','deleteReview','MessageResponse',[id()],'USER: chỉ xóa đánh giá của mình.');
for (const name of ['Movie','Cinema','Room','Showtime','Combo','Promotion']) {
  const resource = name.toLowerCase() + 's'; const controller = 'Admin' + name + 'Controller'; const service = name + 'Service';
  E(controller,service,'Get',`/admin/${resource}`,'search' + name + 's',`PageResponse<${name}Response>`,[query('SearchRequest')],`ADMIN: lọc và phân trang ${resource}.`);
  E(controller,service,'Post',`/admin/${resource}`,'create' + name,`${name}Response`,[body(name + 'Request')],`ADMIN: tạo ${resource}, kiểm tra dữ liệu và liên kết.`);
  E(controller,service,'Put',`/admin/${resource}/{id}`,'update' + name,`${name}Response`,[id(),body(name + 'Request')],`ADMIN: cập nhật ${resource}; kiểm tra xung đột nếu là suất chiếu.`);
  E(controller,service,'Delete',`/admin/${resource}/{id}`,'delete' + name,'MessageResponse',[id()],`ADMIN: xóa ${resource}, kiểm tra các dữ liệu liên quan.`);
}
E('AdminRoomController','RoomService','Put','/admin/rooms/{id}/seat-layout','saveSeatLayout','SeatLayoutResponse',[id(),body('SeatLayoutResponse')],'ADMIN: kiểm tra hàng, cột, loại ghế và lưu sơ đồ phòng.');
E('AdminShowtimeController','ShowtimeService','Get','/admin/pricing','getPricing','List<TicketPricingResponse>',[],'ADMIN: API bổ sung cho yêu cầu giá vé chưa có trong bảng hợp đồng gốc.');
E('AdminShowtimeController','ShowtimeService','Put','/admin/pricing','savePricing','List<TicketPricingResponse>',[body('List<TicketPricingResponse>')],'ADMIN: lưu giá ghế, phụ thu định dạng và cuối tuần.');
E('AdminBookingController','BookingService','Get','/admin/bookings','searchBookings','PageResponse<BookingResponse>',[query('SearchRequest')],'ADMIN: lọc đơn theo ngày, phim, trạng thái.');
E('AdminBookingController','BookingService','Post','/admin/bookings/{id}/cancel','cancelBookingAsAdmin','BookingResponse',[id()],'ADMIN: hủy đơn và nhả ghế theo quy tắc quản trị.');
E('AdminUserController','UserService','Get','/admin/users','searchUsers','PageResponse<UserResponse>',[query('SearchRequest')],'ADMIN: tìm người dùng, phân trang.');
E('AdminUserController','UserService','Put','/admin/users/{id}/lock','lockUser','UserResponse',[id()],'ADMIN: khóa tài khoản.');
E('AdminUserController','UserService','Put','/admin/users/{id}/unlock','unlockUser','UserResponse',[id()],'ADMIN: mở khóa; bổ sung đường dẫn đối xứng với frontend hiện tại.');
E('AdminUserController','UserService','Put','/admin/users/{id}/role','changeRole','UserResponse',[id(),body('RoleRequest')],'ADMIN: đổi vai trò USER hoặc ADMIN.');
E('AdminReviewController','ReviewService','Get','/admin/reviews','searchReviews','PageResponse<ReviewResponse>',[query('SearchRequest')],'ADMIN: phân trang đánh giá gồm cả mục bị ẩn.');
E('AdminReviewController','ReviewService','Put','/admin/reviews/{id}/hide','hideReview','ReviewResponse',[id()],'ADMIN: ẩn hoặc hiện đánh giá vi phạm.');
E('AdminReviewController','ReviewService','Delete','/admin/reviews/{id}','deleteReviewAsAdmin','MessageResponse',[id()],'ADMIN: xóa đánh giá vi phạm.');
for (const [url,name,result] of [['summary','getSummary','DashboardSummaryResponse'],['revenue','getRevenueByDay','List<RevenueByDayResponse>'],['top-movies','getTopMovies','List<TopMovieResponse>'],['occupancy','getOccupancyByCinema','List<OccupancyByCinemaResponse>']]) E('AdminDashboardController','DashboardService','Get',`/admin/dashboard/${url}`,name,result,[query('DateRangeRequest')],'ADMIN: thống kê theo khoảng thời gian.');
function extra(service, name, result, params, note) { (services[service] ||= new Map()).set(name + params.map((p) => p.type).join(','), { name, result, params, note }); }
extra('ShowtimeService','calculatePrice','Long',[{type:'Long',name:'showtimeId'},{type:'String',name:'seatType'}],'Tính giá theo loại ghế, định dạng và cuối tuần.');
extra('ShowtimeService','checkRoomConflict','Boolean',[body('ShowtimeRequest')],'Kiểm tra khoảng giờ giao nhau trong cùng phòng, kể cả khi sửa suất chiếu.');
extra('PromotionService','calculateDiscount','Long',[body('PromotionValidationRequest')],'Tính số tiền giảm nguyên VND, giới hạn mức tối đa và tổng đơn.');
extra('ReviewService','canUserReview','Boolean',[{type:'Long',name:'movieId'}],'Kiểm tra người dùng hiện tại có vé đã chiếu của phim và chưa đánh giá.');
extra('SeatHoldService','releaseExpiredHolds','void',[],'Nhả ghế hết hạn giữ; sẽ được job định kỳ gọi khi tự cài đặt.');
extra('BookingService','expirePendingBookings','void',[],'Đổi trạng thái đơn chưa thanh toán hết hạn và nhả ghế.');
const imports = 'import java.util.List;\nimport com.cinema.booking.dto.request.*;\nimport com.cinema.booking.dto.response.*;';
for (const [name, methods] of Object.entries(services)) {
  const bodies = [...methods.values()].map(({name:method,result,params,note}) => `    /** ${note} */\n    public ${result} ${method}(${params.map((p) => p.type + ' ' + p.name).join(', ')}) {\n        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.\n        throw new UnsupportedOperationException("Chưa cài đặt");\n    }`).join('\n\n');
  java('service', name, `/** Khung dịch vụ ${name}; toàn bộ nghiệp vụ do chủ dự án tự viết. */\n@Service\npublic class ${name} {\n${bodies}\n}`, imports + '\nimport org.springframework.stereotype.Service;');
}
for (const [name, methods] of Object.entries(endpoints)) {
  const service = methods[0].service;
  const admin = name.startsWith('Admin');
  const bodies = methods.map(({verb,url,name:method,result,params,note}) => `    /** ${note} */\n    @${verb}Mapping("${url}")\n    public ${result} ${method}(${params.map((p) => p.annotation + ' ' + p.type + ' ' + p.name).join(', ')}) {\n        return service.${method}(${params.map((p) => p.name).join(', ')});\n    }`).join('\n\n');
  java(admin ? 'controller.admin' : 'controller', name, `/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */\n@RestController\n@RequestMapping("/api/v1")\npublic class ${name} {\n    private final ${service} service;\n    public ${name}(${service} service) { this.service = service; }\n\n${bodies}\n}`, imports + `\nimport com.cinema.booking.service.${service};\nimport jakarta.validation.Valid;\nimport org.springframework.web.bind.annotation.*;`);
}
const shells = {
  config: { SecurityConfig:'Cho phép /api/v1/auth/** và API công khai; yêu cầu USER cho đặt vé và ADMIN cho /api/v1/admin/**; chưa cấu hình filter chain.', CorsConfig:'Đọc cors.allowed-origins và khai báo CORS sau khi cài đặt backend.', OpenApiConfig:'Khai báo thông tin API và bearer JWT trong Swagger khi cài đặt.', WebSocketConfig:'Cấu hình STOMP/WebSocket để thay polling sơ đồ ghế sau này.', SchedulerConfig:'Bật lịch chạy cleanup giữ ghế và đơn chờ khi nghiệp vụ đã được viết.' },
  security: { JwtService:'Ký, đọc, kiểm tra hạn JWT; lấy khóa từ biến môi trường. Chưa cài đặt.', JwtAuthenticationFilter:'Đọc Authorization Bearer, xác thực JWT và gắn SecurityContext. Chưa cài đặt.', CustomUserDetailsService:'Tải tài khoản theo email, kiểm tra khóa và vai trò từ repository. Chưa cài đặt.' },
  exception: { GlobalExceptionHandler:'Ánh xạ lỗi chuẩn thành ApiError gồm status, code, message, details, timestamp. Chưa đăng ký handler.' },
};
for (const [pkg, classes] of Object.entries(shells)) for (const [name,note] of Object.entries(classes)) java(pkg,name,`/** TODO: ${note} */\npublic class ${name} {}`);
for (const name of ['BusinessException','NotFoundException']) java('exception',name,`/** Ngoại lệ dự kiến; bổ sung mã lỗi và mapping khi cài đặt backend. */\npublic class ${name} extends RuntimeException {}`);
for (const [name,service,method,note] of [['SeatHoldCleanupJob','SeatHoldService','releaseExpiredHolds','Dọn giữ ghế hết hạn'],['PendingBookingExpireJob','BookingService','expirePendingBookings','Hết hạn đơn chờ thanh toán']]) java('scheduler',name,`/** ${note}; chưa gắn lịch chạy hoặc thực thi nghiệp vụ. */\npublic class ${name} {\n    /** TODO: gọi ${service}.${method} sau khi chủ dự án cài đặt dịch vụ. */\n    public void run() { throw new UnsupportedOperationException("Chưa cài đặt"); }\n}`);
for (const [name,method,result,note] of [['CodeGenerator','generateBookingCode','String','Sinh mã đặt vé duy nhất.'],['DateTimeUtil','nowIso','String','Chuẩn hóa thời gian ISO-8601.']]) java('util',name,`/** ${note} Chỉ khung, chưa có thuật toán. */\npublic class ${name} {\n    public ${result} ${method}() { throw new UnsupportedOperationException("Chưa cài đặt"); }\n}`);
write('.gitignore', 'target/\n.env\n.idea/');
console.log('Đã tạo khung backend: DTO, controller, service, repository, entity và cấu hình mẫu.');

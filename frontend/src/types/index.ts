/**
 * Kiểu lỗi chuẩn từ API backend.
 * Mọi lỗi API đều được chuẩn hóa thành dạng này.
 */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string>;
  timestamp?: string;
}

/**
 * Kiểu phân trang chuẩn từ API (tương thích Spring Boot Page<T>).
 */
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Vai trò người dùng trong hệ thống.
 */
export type Role = 'USER' | 'ADMIN';

/**
 * Trạng thái phim.
 */
export type MovieStatus = 'NOW_SHOWING' | 'COMING_SOON' | 'STOPPED';

/**
 * Trạng thái đặt vé.
 */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

/**
 * Trạng thái thanh toán.
 */
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

/**
 * Phương thức thanh toán (mô phỏng).
 */
export type PaymentMethod = 'CREDIT_CARD' | 'E_WALLET' | 'QR_TRANSFER';
/** Kết quả do bộ mô phỏng phát ra; không phải xác nhận nhận tiền thật. */
export type PaymentOutcome = 'SUCCESS' | 'FAILED';

/**
 * Loại ghế trong phòng chiếu.
 */
export type SeatType = 'STANDARD' | 'VIP' | 'COUPLE' | 'AISLE';

/**
 * Trạng thái ghế trong một suất chiếu.
 */
export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'OCCUPIED' | 'HELD';

/**
 * Định dạng chiếu phim.
 */
export type ShowFormat = '2D' | '3D' | 'IMAX';

/**
 * Loại phụ đề / âm thanh.
 */
export type SubtitleType = 'SUBTITLED' | 'DUBBED';

/**
 * Loại mã giảm giá.
 */
export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT';

/**
 * Trạng thái vé (tab trong trang Vé của tôi).
 */
export type TicketTab = 'UPCOMING' | 'WATCHED' | 'CANCELLED';

/**
 * Chế độ giao diện sáng/tối.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Ngôn ngữ hỗ trợ.
 */
export type Language = 'vi' | 'en';

/**
 * Phản hồi khi đăng nhập thành công.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Thông báo thao tác và kết quả thanh toán mô phỏng từ API. */
export interface MessageResponse {
  message: string;
}
export interface PaymentSimulation {
  success: boolean;
  booking: Booking;
}

/**
 * Thông tin người dùng hiện tại.
 */
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  role: Role;
  locked: boolean;
  createdAt: string;
}

/** Bản ghi audit về thay đổi vai trò của tài khoản. */
export interface UserRoleHistory {
  id: number;
  targetUserId: number;
  changedByUserId: number;
  changedByName: string;
  changedByEmail: string;
  oldRole: Role;
  newRole: Role;
  reason: string | null;
  changedAt: string;
}

/**
 * Thể loại phim.
 */
export interface Genre {
  id: number;
  name: string;
  slug: string;
}

/**
 * Thông tin phim.
 */
export interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  posterUrl: string;
  bannerUrl: string | null;
  trailerUrl: string | null;
  description: string;
  duration: number;
  releaseDate: string;
  endDate: string | null;
  language: string;
  ageRating: string;
  director: string;
  cast: string;
  status: MovieStatus;
  genres: Genre[];
  averageRating: number;
  totalReviews: number;
}

/**
 * Thành phố có rạp.
 */
export interface City {
  id: number;
  name: string;
  slug: string;
}

/**
 * Rạp chiếu phim.
 */
export interface Cinema {
  id: number;
  name: string;
  city: City;
  address: string;
  phone: string;
  totalRooms: number;
}

/**
 * Phòng chiếu trong rạp.
 */
export interface Room {
  id: number;
  name: string;
  cinemaId: number;
  cinemaName: string;
  totalRows: number;
  totalColumns: number;
  totalSeats: number;
  seatLayout?: SeatLayout;
}

/**
 * Một ghế trong sơ đồ ghế.
 */
export interface Seat {
  id: number;
  row: string;
  column: number;
  label: string;
  type: SeatType;
  price: number;
  status: SeatStatus;
}

/**
 * Layout ghế phòng chiếu (cho admin).
 */
export interface SeatLayout {
  rows: number;
  columns: number;
  seats: Array<{
    row: string;
    column: number;
    type: SeatType;
  }>;
}

/**
 * Suất chiếu phim.
 */
export interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePosterUrl: string;
  cinemaId: number;
  cinemaName: string;
  roomId: number;
  roomName: string;
  startTime: string;
  endTime: string;
  date: string;
  format: ShowFormat;
  subtitleType: SubtitleType;
  basePrice: number;
  availableSeats: number;
  totalSeats: number;
}

/**
 * Sơ đồ ghế cho một suất chiếu.
 */
export interface SeatMap {
  showtimeId: number;
  roomName: string;
  rows: number;
  columns: number;
  seats: Seat[];
}

/**
 * Kết quả giữ ghế tạm thời.
 */
export interface SeatHold {
  holdId: number;
  showtimeId: number;
  seatIds: number[];
  expiresAt: string;
}

/**
 * Combo bắp nước.
 */
export interface Combo {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  active: boolean;
}

/**
 * Mã giảm giá / khuyến mãi.
 */
export interface Promotion {
  id: number;
  code: string;
  type: PromotionType;
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

/**
 * Kết quả kiểm tra mã giảm giá.
 */
export interface PromotionValidation {
  valid: boolean;
  discountAmount: number;
  message: string;
  minOrderAmount?: number;
}

/**
 * Đơn đặt vé.
 */
export interface Booking {
  id: number;
  bookingCode: string;
  userId: number;
  movieId?: number;
  showtimeId?: number;
  movieTitle: string;
  moviePosterUrl: string;
  cinemaName: string;
  roomName: string;
  showtime: string;
  showDate: string;
  format: ShowFormat;
  seats: Array<{
    label: string;
    type: SeatType;
    price: number;
    ticketCode?: string;
    checkedInAt?: string | null;
    checkedInBy?: string | null;
  }>;
  combos: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  discount: number;
  promoCode: string | null;
  totalAmount: number;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
  qrCode: string | null;
  expiresAt?: string | null;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
}

/**
 * Đánh giá phim.
 */
export interface Review {
  id: number;
  userId: number;
  userFullName: string;
  userAvatarUrl: string | null;
  movieId: number;
  rating: number;
  comment: string;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Thống kê dashboard (admin).
 */
export interface DashboardSummary {
  totalRevenue: number;
  totalBookings: number;
  totalShowtimes: number;
  newUsers: number;
  revenueChange: number;
  bookingsChange: number;
}

/**
 * Dữ liệu doanh thu theo ngày (biểu đồ).
 */
export interface RevenueByDay {
  date: string;
  revenue: number;
  bookings: number;
}

/**
 * Top phim bán chạy (dashboard).
 */
export interface TopMovie {
  movieId: number;
  movieTitle: string;
  posterUrl: string;
  totalTickets: number;
  totalRevenue: number;
}

/**
 * Tỷ lệ lấp đầy theo rạp (dashboard).
 */
export interface OccupancyByCinema {
  cinemaId: number;
  cinemaName: string;
  occupancyRate: number;
  totalSeats: number;
  occupiedSeats: number;
}

/**
 * Giá vé cấu hình (admin).
 */
export interface TicketPricing {
  id: number;
  seatType: SeatType;
  basePrice: number;
  surcharge3D: number;
  surchargeIMAX: number;
  weekendSurcharge: number;
}

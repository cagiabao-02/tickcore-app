/**
 * Dữ liệu giả cho toàn bộ hệ thống TickCore.
 * Gồm: 12 phim, 4 rạp ở 2 thành phố, phòng chiếu, suất chiếu 7 ngày,
 * 6 combo, 4 mã giảm giá, tài khoản mẫu (USER + ADMIN), đánh giá.
 */
import { format, addDays, subDays } from 'date-fns';
import type {
  User,
  Movie,
  Genre,
  City,
  Cinema,
  Room,
  Showtime,
  Combo,
  Promotion,
  Review,
  Booking,
  Seat,
  SeatMap,
  DashboardSummary,
  RevenueByDay,
  TopMovie,
  OccupancyByCinema,
  TicketPricing,
  SeatType,
  SeatStatus,
  ShowFormat,
  SubtitleType,
} from '@/types';

// ===== HELPER =====
const today = new Date();
const isoDate = (d: Date) => format(d, 'yyyy-MM-dd');
const isoDateTime = (d: Date, h: number, m: number) => {
  const dt = new Date(d);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
};

// ===== TÀI KHOẢN MẪU =====
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'user@tickcore.vn',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    dateOfBirth: '1995-06-15',
    avatarUrl: null,
    role: 'USER',
    locked: false,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 2,
    email: 'admin@tickcore.vn',
    fullName: 'Trần Thị Bình',
    phone: '0912345678',
    dateOfBirth: '1990-03-20',
    avatarUrl: null,
    role: 'ADMIN',
    locked: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 3,
    email: 'user2@tickcore.vn',
    fullName: 'Lê Hoàng Cường',
    phone: '0923456789',
    dateOfBirth: '1998-11-05',
    avatarUrl: null,
    role: 'USER',
    locked: false,
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 4,
    email: 'locked@tickcore.vn',
    fullName: 'Phạm Duy',
    phone: '0934567890',
    dateOfBirth: '2000-01-01',
    avatarUrl: null,
    role: 'USER',
    locked: true,
    createdAt: '2026-03-01T00:00:00Z',
  },
];

// Mật khẩu mock: "password123"
export const mockPasswords: Record<string, string> = {
  'user@tickcore.vn': 'password123',
  'admin@tickcore.vn': 'password123',
  'user2@tickcore.vn': 'password123',
};

// ===== THỂ LOẠI =====
export const mockGenres: Genre[] = [
  { id: 1, name: 'Hành động', slug: 'action' },
  { id: 2, name: 'Hài', slug: 'comedy' },
  { id: 3, name: 'Kinh dị', slug: 'horror' },
  { id: 4, name: 'Lãng mạn', slug: 'romance' },
  { id: 5, name: 'Khoa học viễn tưởng', slug: 'sci-fi' },
  { id: 6, name: 'Hoạt hình', slug: 'animation' },
  { id: 7, name: 'Phiêu lưu', slug: 'adventure' },
  { id: 8, name: 'Tâm lý', slug: 'drama' },
  { id: 9, name: 'Tài liệu', slug: 'documentary' },
  { id: 10, name: 'Gia đình', slug: 'family' },
];

// ===== PHIM (12 phim) =====
export const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Nhiệm Vụ Bất Khả Thi 9',
    originalTitle: 'Mission: Impossible 9',
    posterUrl: 'https://placehold.co/400x600/e65100/ffffff?text=MI9',
    bannerUrl: 'https://placehold.co/1200x500/e65100/ffffff?text=MI9+Banner',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description:
      'Ethan Hunt đối mặt với nhiệm vụ nguy hiểm nhất từ trước tới giờ khi một vũ khí AI mới đe dọa toàn nhân loại. Anh phải chạy đua với thời gian để ngăn chặn thảm họa.',
    duration: 163,
    releaseDate: isoDate(subDays(today, 5)),
    endDate: null,
    language: 'Tiếng Anh',
    ageRating: 'T13',
    director: 'Christopher McQuarrie',
    cast: 'Tom Cruise, Hayley Atwell, Simon Pegg',
    status: 'NOW_SHOWING',
    genres: [mockGenres[0], mockGenres[6]],
    averageRating: 4.5,
    totalReviews: 28,
  },
  {
    id: 2,
    title: 'Lật Mặt 8: Vòng Xoay Tiền',
    originalTitle: 'Lật Mặt 8',
    posterUrl: 'https://placehold.co/400x600/1b5e20/ffffff?text=LM8',
    bannerUrl: 'https://placehold.co/1200x500/1b5e20/ffffff?text=LM8+Banner',
    trailerUrl: null,
    description:
      'Câu chuyện gay cấn về vòng xoay tiền bạc và sự phản bội giữa những người tưởng chừng thân thiết nhất.',
    duration: 135,
    releaseDate: isoDate(subDays(today, 10)),
    endDate: null,
    language: 'Tiếng Việt',
    ageRating: 'T16',
    director: 'Lý Hải',
    cast: 'Trấn Thành, Mạc Văn Khoa, Huy Khánh',
    status: 'NOW_SHOWING',
    genres: [mockGenres[0], mockGenres[7]],
    averageRating: 4.2,
    totalReviews: 45,
  },
  {
    id: 3,
    title: 'Quỷ Ám: Nguồn Cội',
    originalTitle: 'The Exorcism: Origins',
    posterUrl: 'https://placehold.co/400x600/4a148c/ffffff?text=Exorcism',
    bannerUrl: null,
    trailerUrl: null,
    description:
      'Một linh mục trẻ phải đối mặt với thế lực siêu nhiên tàn bạo trong ngôi nhà thờ bị quên lãng, nơi ẩn chứa bí mật kinh hoàng từ hàng thế kỷ trước.',
    duration: 112,
    releaseDate: isoDate(subDays(today, 3)),
    endDate: null,
    language: 'Tiếng Anh',
    ageRating: 'T18',
    director: 'James Wan',
    cast: 'Patrick Wilson, Vera Farmiga',
    status: 'NOW_SHOWING',
    genres: [mockGenres[2]],
    averageRating: 3.8,
    totalReviews: 15,
  },
  {
    id: 4,
    title: 'Yêu Lại Từ Đầu',
    originalTitle: 'Love Again',
    posterUrl: 'https://placehold.co/400x600/c62828/ffffff?text=YeuLai',
    bannerUrl: null,
    trailerUrl: null,
    description:
      'Chuyện tình lãng mạn giữa cô gái trẻ và chàng nhà văn khi họ tình cờ gặp nhau qua những tin nhắn nhầm số.',
    duration: 104,
    releaseDate: isoDate(subDays(today, 7)),
    endDate: null,
    language: 'Tiếng Việt',
    ageRating: 'P',
    director: 'Nguyễn Quang Dũng',
    cast: 'Ninh Dương Lan Ngọc, Chi Pu',
    status: 'NOW_SHOWING',
    genres: [mockGenres[3], mockGenres[1]],
    averageRating: 3.5,
    totalReviews: 32,
  },
  {
    id: 5,
    title: 'Vùng Đất Linh Hồn 2',
    originalTitle: 'Spirited Away 2',
    posterUrl: 'https://placehold.co/400x600/0d47a1/ffffff?text=SA2',
    bannerUrl: 'https://placehold.co/1200x500/0d47a1/ffffff?text=SA2+Banner',
    trailerUrl: null,
    description:
      'Chihiro trở lại thế giới thần linh trong một cuộc phiêu lưu mới đầy màu sắc và cảm xúc.',
    duration: 125,
    releaseDate: isoDate(subDays(today, 1)),
    endDate: null,
    language: 'Tiếng Nhật',
    ageRating: 'P',
    director: 'Hayao Miyazaki',
    cast: 'Rumi Hiiragi, Miyu Irino',
    status: 'NOW_SHOWING',
    genres: [mockGenres[5], mockGenres[6], mockGenres[9]],
    averageRating: 4.9,
    totalReviews: 60,
  },
  {
    id: 6,
    title: 'Chiến Tranh Giữa Các Vì Sao: Hồi Kết',
    originalTitle: 'Star Wars: The Final Chapter',
    posterUrl: 'https://placehold.co/400x600/ff6f00/ffffff?text=StarWars',
    bannerUrl: null,
    trailerUrl: null,
    description:
      'Hồi kết sử thi của saga Star Wars, nơi phe ánh sáng đối đầu lần cuối với phe bóng tối.',
    duration: 155,
    releaseDate: isoDate(subDays(today, 14)),
    endDate: null,
    language: 'Tiếng Anh',
    ageRating: 'T13',
    director: 'J.J. Abrams',
    cast: 'Daisy Ridley, Adam Driver, Oscar Isaac',
    status: 'NOW_SHOWING',
    genres: [mockGenres[4], mockGenres[0], mockGenres[6]],
    averageRating: 4.1,
    totalReviews: 22,
  },
  {
    id: 7,
    title: 'Ký Ức Mùa Đông',
    originalTitle: 'Winter Memories',
    posterUrl: 'https://placehold.co/400x600/01579b/ffffff?text=Winter',
    bannerUrl: null,
    trailerUrl: null,
    description:
      'Bộ phim tâm lý cảm động về tình cảm gia đình và sự tha thứ giữa ba thế hệ trong một mùa đông giá lạnh.',
    duration: 118,
    releaseDate: isoDate(subDays(today, 2)),
    endDate: null,
    language: 'Tiếng Hàn',
    ageRating: 'T13',
    director: 'Bong Joon-ho',
    cast: 'Song Kang-ho, Jeon Do-yeon',
    status: 'NOW_SHOWING',
    genres: [mockGenres[7], mockGenres[3]],
    averageRating: 4.6,
    totalReviews: 18,
  },
  // --- SẮP CHIẾU ---
  {
    id: 8,
    title: 'Biệt Đội Siêu Anh Hùng 6',
    originalTitle: 'Avengers 6',
    posterUrl: 'https://placehold.co/400x600/b71c1c/ffffff?text=AV6',
    bannerUrl: 'https://placehold.co/1200x500/b71c1c/ffffff?text=AV6+Banner',
    trailerUrl: null,
    description: 'Đội Avengers tập hợp lần nữa để đối đầu với mối đe dọa lớn nhất từ đa vũ trụ.',
    duration: 178,
    releaseDate: isoDate(addDays(today, 14)),
    endDate: null,
    language: 'Tiếng Anh',
    ageRating: 'T13',
    director: 'Russo Brothers',
    cast: 'Robert Downey Jr., Chris Evans, Scarlett Johansson',
    status: 'COMING_SOON',
    genres: [mockGenres[0], mockGenres[4], mockGenres[6]],
    averageRating: 0,
    totalReviews: 0,
  },
  {
    id: 9,
    title: 'Đảo Bí Ẩn',
    originalTitle: 'Mystery Island',
    posterUrl: 'https://placehold.co/400x600/004d40/ffffff?text=Island',
    bannerUrl: null,
    trailerUrl: null,
    description:
      'Nhóm sinh viên bị mắc kẹt trên một hòn đảo hoang nơi mọi thứ không như vẻ bề ngoài.',
    duration: 120,
    releaseDate: isoDate(addDays(today, 21)),
    endDate: null,
    language: 'Tiếng Việt',
    ageRating: 'T16',
    director: 'Victor Vũ',
    cast: 'Jun Phạm, Kaity Nguyễn',
    status: 'COMING_SOON',
    genres: [mockGenres[2], mockGenres[6]],
    averageRating: 0,
    totalReviews: 0,
  },
  {
    id: 10,
    title: 'Robot Bạn Thân',
    originalTitle: 'My Robot Friend',
    posterUrl: 'https://placehold.co/400x600/1565c0/ffffff?text=Robot',
    bannerUrl: null,
    trailerUrl: null,
    description:
      'Cậu bé cô đơn kết bạn với một robot thông minh và cùng nhau trải qua những cuộc phiêu lưu kỳ thú.',
    duration: 98,
    releaseDate: isoDate(addDays(today, 10)),
    endDate: null,
    language: 'Tiếng Anh',
    ageRating: 'P',
    director: 'Pete Docter',
    cast: 'Voice cast',
    status: 'COMING_SOON',
    genres: [mockGenres[5], mockGenres[9], mockGenres[4]],
    averageRating: 0,
    totalReviews: 0,
  },
  {
    id: 11,
    title: 'Thám Tử Phố Cổ',
    originalTitle: 'Old Town Detective',
    posterUrl: 'https://placehold.co/400x600/33691e/ffffff?text=ThamTu',
    bannerUrl: null,
    trailerUrl: null,
    description: 'Một thám tử trẻ giải quyết những vụ án bí ẩn trong khu phố cổ Hà Nội đầy ma mị.',
    duration: 130,
    releaseDate: isoDate(addDays(today, 7)),
    endDate: null,
    language: 'Tiếng Việt',
    ageRating: 'T13',
    director: 'Phan Đăng Di',
    cast: 'Sơn Tùng MTP, Hoàng Thùy Linh',
    status: 'COMING_SOON',
    genres: [mockGenres[7], mockGenres[0]],
    averageRating: 0,
    totalReviews: 0,
  },
  {
    id: 12,
    title: 'Vũ Trụ Song Song',
    originalTitle: 'Parallel Universe',
    posterUrl: 'https://placehold.co/400x600/311b92/ffffff?text=Parallel',
    bannerUrl: null,
    trailerUrl: null,
    description:
      'Nhà khoa học phát hiện cánh cổng đến vũ trụ song song và phải lựa chọn giữa hai thế giới.',
    duration: 142,
    releaseDate: isoDate(addDays(today, 30)),
    endDate: null,
    language: 'Tiếng Anh',
    ageRating: 'T13',
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya',
    status: 'COMING_SOON',
    genres: [mockGenres[4], mockGenres[7]],
    averageRating: 0,
    totalReviews: 0,
  },
];

// ===== THÀNH PHỐ & RẠP =====
export const mockCities: City[] = [
  { id: 1, name: 'Hồ Chí Minh', slug: 'ho-chi-minh' },
  { id: 2, name: 'Hà Nội', slug: 'ha-noi' },
];

export const mockCinemas: Cinema[] = [
  {
    id: 1,
    name: 'TickCore Quận 1',
    city: mockCities[0],
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    phone: '028 1234 5678',
    totalRooms: 3,
  },
  {
    id: 2,
    name: 'TickCore Thủ Đức',
    city: mockCities[0],
    address: '456 Võ Văn Ngân, Thủ Đức, TP.HCM',
    phone: '028 2345 6789',
    totalRooms: 3,
  },
  {
    id: 3,
    name: 'TickCore Đống Đa',
    city: mockCities[1],
    address: '789 Tây Sơn, Đống Đa, Hà Nội',
    phone: '024 3456 7890',
    totalRooms: 3,
  },
  {
    id: 4,
    name: 'TickCore Long Biên',
    city: mockCities[1],
    address: '101 Nguyễn Văn Cừ, Long Biên, Hà Nội',
    phone: '024 4567 8901',
    totalRooms: 3,
  },
];

// ===== PHÒNG CHIẾU (3 phòng / rạp) =====
export const mockRooms: Room[] = [];
let roomId = 1;
for (const cinema of mockCinemas) {
  for (let r = 1; r <= 3; r++) {
    const rows = r === 1 ? 8 : r === 2 ? 10 : 6;
    const cols = r === 1 ? 12 : r === 2 ? 14 : 10;
    mockRooms.push({
      id: roomId,
      name: `Phòng ${r}`,
      cinemaId: cinema.id,
      cinemaName: cinema.name,
      totalRows: rows,
      totalColumns: cols,
      totalSeats: rows * cols,
    });
    roomId++;
  }
}

// ===== TẠO SƠ ĐỒ GHẾ =====
export function generateSeatMap(
  room: Room,
  showtimeId: number,
  occupiedSeatIds: number[] = [],
): SeatMap {
  const seats: Seat[] = [];
  let seatId = showtimeId * 1000;
  for (let r = 0; r < room.totalRows; r++) {
    const rowLabel = String.fromCharCode(65 + r);
    for (let c = 1; c <= room.totalColumns; c++) {
      seatId++;
      let seatType: SeatType = 'STANDARD';
      let price = 75000;
      // Hàng cuối cùng là VIP
      if (r >= room.totalRows - 2) {
        seatType = 'VIP';
        price = 95000;
      }
      // Hai cột cuối của hàng cuối là ghế đôi
      if (r === room.totalRows - 1 && c >= room.totalColumns - 1) {
        seatType = 'COUPLE';
        price = 170000;
      }
      const saved = room.seatLayout?.seats.find((s) => s.row === rowLabel && s.column === c);
      if (saved) seatType = saved.type;
      const pricing = mockPricing.find((p) => p.seatType === seatType);
      const showtime = mockShowtimes.find((s) => s.id === showtimeId);
      if (pricing && showtime) {
        const standard = mockPricing.find((p) => p.seatType === 'STANDARD')!;
        const weekend = [0, 6].includes(new Date(showtime.startTime).getDay());
        price =
          showtime.basePrice +
          pricing.basePrice -
          standard.basePrice +
          (showtime.format === '3D'
            ? pricing.surcharge3D
            : showtime.format === 'IMAX'
              ? pricing.surchargeIMAX
              : 0) +
          (weekend ? pricing.weekendSurcharge : 0);
      }
      if (seatType === 'AISLE') price = 0;
      let status: SeatStatus = 'AVAILABLE';
      if (occupiedSeatIds.includes(seatId)) {
        status = 'OCCUPIED';
      }
      seats.push({
        id: seatId,
        row: rowLabel,
        column: c,
        label: `${rowLabel}${c}`,
        type: seatType,
        price,
        status,
      });
    }
  }
  return {
    showtimeId,
    roomName: room.name,
    rows: room.totalRows,
    columns: room.totalColumns,
    seats,
  };
}

// ===== SUẤT CHIẾU (7 ngày tới) =====
export const mockShowtimes: Showtime[] = [];
let showtimeId = 1;
const formats: ShowFormat[] = ['2D', '3D', 'IMAX'];
const subtitleTypes: SubtitleType[] = ['SUBTITLED', 'DUBBED'];
const nowShowingMovies = mockMovies.filter((m) => m.status === 'NOW_SHOWING');

for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
  const date = addDays(today, dayOffset);
  const dateStr = isoDate(date);

  for (const cinema of mockCinemas) {
    const cinemaRooms = mockRooms.filter((r) => r.cinemaId === cinema.id);

    for (let roomIdx = 0; roomIdx < cinemaRooms.length; roomIdx++) {
      const room = cinemaRooms[roomIdx];
      // Mỗi phòng chiếu 2-3 phim mỗi ngày
      const movieCount = roomIdx === 0 ? 3 : 2;
      const startHours = roomIdx === 0 ? [10, 14, 19] : [11, 16];

      for (let i = 0; i < movieCount; i++) {
        const movie = nowShowingMovies[(showtimeId + i) % nowShowingMovies.length];
        const startH = startHours[i];
        const startTime = isoDateTime(date, startH, 0);
        const endTime = new Date(
          new Date(startTime).getTime() + movie.duration * 60000,
        ).toISOString();
        const fmt = formats[roomIdx % formats.length];
        const occupied = Math.floor(Math.random() * 30);

        mockShowtimes.push({
          id: showtimeId,
          movieId: movie.id,
          movieTitle: movie.title,
          moviePosterUrl: movie.posterUrl,
          cinemaId: cinema.id,
          cinemaName: cinema.name,
          roomId: room.id,
          roomName: room.name,
          startTime,
          endTime,
          date: dateStr,
          format: fmt,
          subtitleType: subtitleTypes[i % 2],
          basePrice: 75000,
          availableSeats: room.totalSeats - occupied,
          totalSeats: room.totalSeats,
        });
        showtimeId++;
      }
    }
  }
}

// Giả lập ghế đã đặt cho một số suất chiếu
export const mockOccupiedSeats: Record<number, number[]> = {};
for (const st of mockShowtimes) {
  const count = Math.floor(Math.random() * 15) + 3;
  const ids: number[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(st.id * 1000 + Math.floor(Math.random() * 80) + 1);
  }
  mockOccupiedSeats[st.id] = ids;
}

// ===== COMBO =====
export const mockCombos: Combo[] = [
  {
    id: 1,
    name: 'Combo Đơn',
    description: '1 bắp nhỏ + 1 nước ngọt',
    imageUrl: 'https://placehold.co/300x200/f57c00/ffffff?text=Combo1',
    price: 49000,
    active: true,
  },
  {
    id: 2,
    name: 'Combo Đôi',
    description: '1 bắp lớn + 2 nước ngọt',
    imageUrl: 'https://placehold.co/300x200/e64a19/ffffff?text=Combo2',
    price: 79000,
    active: true,
  },
  {
    id: 3,
    name: 'Combo Gia Đình',
    description: '2 bắp lớn + 4 nước ngọt',
    imageUrl: 'https://placehold.co/300x200/d32f2f/ffffff?text=Combo3',
    price: 139000,
    active: true,
  },
  {
    id: 4,
    name: 'Combo VIP',
    description: '1 bắp caramel + 2 trà sữa',
    imageUrl: 'https://placehold.co/300x200/6a1b9a/ffffff?text=ComboVIP',
    price: 109000,
    active: true,
  },
  {
    id: 5,
    name: 'Nước ngọt lớn',
    description: '1 cốc nước ngọt cỡ lớn',
    imageUrl: 'https://placehold.co/300x200/1565c0/ffffff?text=Drink',
    price: 35000,
    active: true,
  },
  {
    id: 6,
    name: 'Bắp rang bơ lớn',
    description: '1 hộp bắp rang bơ cỡ lớn',
    imageUrl: 'https://placehold.co/300x200/f9a825/ffffff?text=Popcorn',
    price: 45000,
    active: true,
  },
];

// ===== MÃ GIẢM GIÁ =====
export const mockPromotions: Promotion[] = [
  {
    id: 1,
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    minOrderAmount: 100000,
    maxDiscount: 50000,
    startDate: isoDate(subDays(today, 30)),
    endDate: isoDate(addDays(today, 60)),
    usageLimit: 1000,
    usedCount: 234,
    active: true,
  },
  {
    id: 2,
    code: 'GIAM30K',
    type: 'FIXED_AMOUNT',
    value: 30000,
    minOrderAmount: 150000,
    maxDiscount: null,
    startDate: isoDate(subDays(today, 10)),
    endDate: isoDate(addDays(today, 20)),
    usageLimit: 500,
    usedCount: 89,
    active: true,
  },
  {
    id: 3,
    code: 'HETHAN',
    type: 'PERCENTAGE',
    value: 20,
    minOrderAmount: 0,
    maxDiscount: 100000,
    startDate: isoDate(subDays(today, 60)),
    endDate: isoDate(subDays(today, 1)),
    usageLimit: 200,
    usedCount: 200,
    active: false, // Đã hết hạn
  },
  {
    id: 4,
    code: 'VIP500K',
    type: 'FIXED_AMOUNT',
    value: 50000,
    minOrderAmount: 500000,
    maxDiscount: null,
    startDate: isoDate(subDays(today, 5)),
    endDate: isoDate(addDays(today, 30)),
    usageLimit: 100,
    usedCount: 12,
    active: true, // Có điều kiện đơn tối thiểu 500k
  },
];

// ===== ĐÁNH GIÁ =====
export const mockReviews: Review[] = [
  {
    id: 1,
    userId: 1,
    userFullName: 'Nguyễn Văn An',
    userAvatarUrl: null,
    movieId: 1,
    rating: 5,
    comment: 'Phim hành động hay nhất năm! Tom Cruise vẫn quá xuất sắc.',
    hidden: false,
    createdAt: subDays(today, 3).toISOString(),
    updatedAt: subDays(today, 3).toISOString(),
  },
  {
    id: 2,
    userId: 3,
    userFullName: 'Lê Hoàng Cường',
    userAvatarUrl: null,
    movieId: 1,
    rating: 4,
    comment: 'Cốt truyện hấp dẫn, các cảnh hành động mãn nhãn. Hơi dài.',
    hidden: false,
    createdAt: subDays(today, 2).toISOString(),
    updatedAt: subDays(today, 2).toISOString(),
  },
  {
    id: 3,
    userId: 1,
    userFullName: 'Nguyễn Văn An',
    userAvatarUrl: null,
    movieId: 2,
    rating: 4,
    comment: 'Phim Việt ngày càng hay, tình tiết bất ngờ.',
    hidden: false,
    createdAt: subDays(today, 5).toISOString(),
    updatedAt: subDays(today, 5).toISOString(),
  },
  {
    id: 4,
    userId: 3,
    userFullName: 'Lê Hoàng Cường',
    userAvatarUrl: null,
    movieId: 5,
    rating: 5,
    comment: 'Miyazaki là thiên tài. Phim đẹp từng khoảnh khắc!',
    hidden: false,
    createdAt: subDays(today, 1).toISOString(),
    updatedAt: subDays(today, 1).toISOString(),
  },
  {
    id: 5,
    userId: 1,
    userFullName: 'Nguyễn Văn An',
    userAvatarUrl: null,
    movieId: 4,
    rating: 3,
    comment: 'Phim lãng mạn nhẹ nhàng, phù hợp xem cuối tuần.',
    hidden: false,
    createdAt: subDays(today, 4).toISOString(),
    updatedAt: subDays(today, 4).toISOString(),
  },
  {
    id: 6,
    userId: 3,
    userFullName: 'Lê Hoàng Cường',
    userAvatarUrl: null,
    movieId: 7,
    rating: 5,
    comment: 'Bộ phim Hàn hay nhất tôi từng xem. Cảm xúc đến phút cuối.',
    hidden: false,
    createdAt: subDays(today, 1).toISOString(),
    updatedAt: subDays(today, 1).toISOString(),
  },
];

// ===== ĐẶT VÉ MẪU =====
export const mockBookings: Booking[] = [
  {
    id: 1,
    bookingCode: 'TC20261026001',
    userId: 1,
    movieTitle: 'Nhiệm Vụ Bất Khả Thi 9',
    moviePosterUrl: mockMovies[0].posterUrl,
    cinemaName: 'TickCore Quận 1',
    roomName: 'Phòng 1',
    showtime: isoDateTime(addDays(today, 1), 19, 0),
    showDate: isoDate(addDays(today, 1)),
    format: '2D',
    seats: [
      { label: 'F5', type: 'STANDARD', price: 75000 },
      { label: 'F6', type: 'STANDARD', price: 75000 },
    ],
    combos: [{ name: 'Combo Đôi', quantity: 1, price: 79000 }],
    subtotal: 229000,
    discount: 0,
    promoCode: null,
    totalAmount: 229000,
    paymentMethod: 'E_WALLET',
    paymentStatus: 'SUCCESS',
    status: 'CONFIRMED',
    createdAt: subDays(today, 1).toISOString(),
    qrCode: 'TC20261026001',
  },
  {
    id: 2,
    bookingCode: 'TC20261025002',
    userId: 1,
    movieTitle: 'Vùng Đất Linh Hồn 2',
    moviePosterUrl: mockMovies[4].posterUrl,
    cinemaName: 'TickCore Thủ Đức',
    roomName: 'Phòng 2',
    showtime: isoDateTime(subDays(today, 2), 14, 0),
    showDate: isoDate(subDays(today, 2)),
    format: '3D',
    seats: [{ label: 'H7', type: 'VIP', price: 95000 }],
    combos: [],
    subtotal: 95000,
    discount: 0,
    promoCode: null,
    totalAmount: 95000,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'SUCCESS',
    status: 'CONFIRMED',
    createdAt: subDays(today, 3).toISOString(),
    qrCode: 'TC20261025002',
  },
  {
    id: 3,
    bookingCode: 'TC20261020003',
    userId: 1,
    movieTitle: 'Lật Mặt 8: Vòng Xoay Tiền',
    moviePosterUrl: mockMovies[1].posterUrl,
    cinemaName: 'TickCore Quận 1',
    roomName: 'Phòng 3',
    showtime: isoDateTime(subDays(today, 6), 11, 0),
    showDate: isoDate(subDays(today, 6)),
    format: 'IMAX',
    seats: [
      { label: 'D3', type: 'STANDARD', price: 120000 },
      { label: 'D4', type: 'STANDARD', price: 120000 },
    ],
    combos: [{ name: 'Combo Đơn', quantity: 2, price: 49000 }],
    subtotal: 338000,
    discount: 30000,
    promoCode: 'GIAM30K',
    totalAmount: 308000,
    paymentMethod: 'QR_TRANSFER',
    paymentStatus: 'SUCCESS',
    status: 'CONFIRMED',
    createdAt: subDays(today, 7).toISOString(),
    qrCode: 'TC20261020003',
  },
];

// ===== DASHBOARD (Admin) =====
export const mockDashboardSummary: DashboardSummary = {
  totalRevenue: 45680000,
  totalBookings: 342,
  totalShowtimes: 168,
  newUsers: 56,
  revenueChange: 12.5,
  bookingsChange: 8.3,
};

export const mockRevenueByDay: RevenueByDay[] = Array.from({ length: 14 }, (_, i) => ({
  date: isoDate(subDays(today, 13 - i)),
  revenue: Math.floor(Math.random() * 5000000) + 2000000,
  bookings: Math.floor(Math.random() * 40) + 10,
}));

export const mockTopMovies: TopMovie[] = [
  {
    movieId: 5,
    movieTitle: 'Vùng Đất Linh Hồn 2',
    posterUrl: mockMovies[4].posterUrl,
    totalTickets: 856,
    totalRevenue: 89800000,
  },
  {
    movieId: 2,
    movieTitle: 'Lật Mặt 8',
    posterUrl: mockMovies[1].posterUrl,
    totalTickets: 742,
    totalRevenue: 72500000,
  },
  {
    movieId: 1,
    movieTitle: 'Nhiệm Vụ Bất Khả Thi 9',
    posterUrl: mockMovies[0].posterUrl,
    totalTickets: 634,
    totalRevenue: 65200000,
  },
  {
    movieId: 6,
    movieTitle: 'Star Wars: Hồi Kết',
    posterUrl: mockMovies[5].posterUrl,
    totalTickets: 521,
    totalRevenue: 54100000,
  },
  {
    movieId: 7,
    movieTitle: 'Ký Ức Mùa Đông',
    posterUrl: mockMovies[6].posterUrl,
    totalTickets: 398,
    totalRevenue: 38700000,
  },
];

export const mockOccupancy: OccupancyByCinema[] = [
  {
    cinemaId: 1,
    cinemaName: 'TickCore Quận 1',
    occupancyRate: 78,
    totalSeats: 1200,
    occupiedSeats: 936,
  },
  {
    cinemaId: 2,
    cinemaName: 'TickCore Thủ Đức',
    occupancyRate: 65,
    totalSeats: 1200,
    occupiedSeats: 780,
  },
  {
    cinemaId: 3,
    cinemaName: 'TickCore Đống Đa',
    occupancyRate: 72,
    totalSeats: 1200,
    occupiedSeats: 864,
  },
  {
    cinemaId: 4,
    cinemaName: 'TickCore Long Biên',
    occupancyRate: 58,
    totalSeats: 1200,
    occupiedSeats: 696,
  },
];

// ===== GIÁ VÉ =====
export const mockPricing: TicketPricing[] = [
  {
    id: 1,
    seatType: 'STANDARD',
    basePrice: 75000,
    surcharge3D: 20000,
    surchargeIMAX: 45000,
    weekendSurcharge: 10000,
  },
  {
    id: 2,
    seatType: 'VIP',
    basePrice: 95000,
    surcharge3D: 20000,
    surchargeIMAX: 45000,
    weekendSurcharge: 15000,
  },
  {
    id: 3,
    seatType: 'COUPLE',
    basePrice: 170000,
    surcharge3D: 40000,
    surchargeIMAX: 90000,
    weekendSurcharge: 20000,
  },
];

// ===== HOLD STATE (giữ ghế) =====
export interface MockSeatHold {
  holdId: number;
  showtimeId: number;
  userId: number;
  seatIds: number[];
  expiresAt: string;
}

export let mockSeatHolds: MockSeatHold[] = [];
let nextHoldId = 1;

/** Tạo hold mới */
export function createMockHold(
  showtimeId: number,
  userId: number,
  seatIds: number[],
): MockSeatHold {
  const hold: MockSeatHold = {
    holdId: nextHoldId++,
    showtimeId,
    userId,
    seatIds,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 phút
  };
  mockSeatHolds.push(hold);
  return hold;
}

/** Xóa hold đã hết hạn */
export function cleanupExpiredHolds(): void {
  const now = Date.now();
  mockSeatHolds = mockSeatHolds.filter((h) => new Date(h.expiresAt).getTime() > now);
  for (const [id, reservation] of mockBookingReservations) {
    const booking = mockBookings.find((b) => b.id === id);
    if (booking?.status === 'PENDING' && new Date(reservation.expiresAt).getTime() <= now) {
      booking.status = 'EXPIRED';
      releaseBookingSeats(id);
    }
  }
}

/** Theo dõi ghế và thời hạn đơn chờ; trả ghế khi đơn bị hủy hoặc hết hạn. */
export const mockBookingReservations = new Map<number, MockSeatHold>();
export function releaseBookingSeats(bookingId: number): void {
  const reservation = mockBookingReservations.get(bookingId);
  if (!reservation) return;
  mockOccupiedSeats[reservation.showtimeId] = (
    mockOccupiedSeats[reservation.showtimeId] || []
  ).filter((id) => !reservation.seatIds.includes(id));
  mockBookingReservations.delete(bookingId);
}

/** Nhả hold theo holdId */
export function releaseMockHold(holdId: number): boolean {
  const idx = mockSeatHolds.findIndex((h) => h.holdId === holdId);
  if (idx === -1) return false;
  mockSeatHolds.splice(idx, 1);
  return true;
}

/** Kiểm tra ghế có đang bị giữ không */
export function isSeatHeld(showtimeId: number, seatId: number): boolean {
  cleanupExpiredHolds();
  return mockSeatHolds.some(
    (h) =>
      h.showtimeId === showtimeId &&
      h.seatIds.includes(seatId) &&
      new Date(h.expiresAt).getTime() > Date.now(),
  );
}

// ===== BOOKING STATE =====
let nextBookingId = mockBookings.length + 1;

export function createMockBooking(data: {
  userId: number;
  showtimeId: number;
  holdId: number;
  combos: Array<{ comboId: number; quantity: number }>;
  promoCode: string | null;
}): Booking {
  const showtime = mockShowtimes.find((s) => s.id === data.showtimeId);
  const hold = mockSeatHolds.find((h) => h.holdId === data.holdId);
  if (!showtime || !hold) throw new Error('Invalid data');

  const room = mockRooms.find((r) => r.id === showtime.roomId);
  const seatMap = generateSeatMap(room!, showtime.id);
  const seats = hold.seatIds.map((seatId) => {
    const seat = seatMap.seats.find((s) => s.id === seatId);
    return seat
      ? { label: seat.label, type: seat.type, price: seat.price }
      : { label: 'N/A', type: 'STANDARD' as const, price: 0 };
  });

  const combos = data.combos.map((c) => {
    const combo = mockCombos.find((cb) => cb.id === c.comboId);
    return { name: combo?.name || 'N/A', quantity: c.quantity, price: combo?.price || 0 };
  });

  const seatsTotal = seats.reduce((s, seat) => s + seat.price, 0);
  const combosTotal = combos.reduce((s, c) => s + c.price * c.quantity, 0);
  const subtotal = seatsTotal + combosTotal;
  let discount = 0;

  if (data.promoCode) {
    const promo = mockPromotions.find((p) => p.code === data.promoCode && p.active);
    if (promo) {
      if (promo.type === 'PERCENTAGE') {
        discount = Math.floor((subtotal * promo.value) / 100);
        if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
      } else {
        discount = promo.value;
      }
    }
  }

  const bookingCode = `TC${format(new Date(), 'yyyyMMdd')}${String(nextBookingId).padStart(3, '0')}`;
  const booking: Booking = {
    id: nextBookingId++,
    bookingCode,
    userId: data.userId,
    movieTitle: showtime.movieTitle,
    moviePosterUrl: showtime.moviePosterUrl,
    cinemaName: showtime.cinemaName,
    roomName: showtime.roomName,
    showtime: showtime.startTime,
    showDate: showtime.date,
    format: showtime.format,
    seats,
    combos,
    subtotal,
    discount,
    promoCode: data.promoCode,
    totalAmount: Math.max(0, subtotal - discount),
    paymentMethod: null,
    paymentStatus: 'PENDING',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    qrCode: '',
    expiresAt: hold.expiresAt,
  };

  // Ghế đã giữ -> chuyển thành occupied
  if (!mockOccupiedSeats[showtime.id]) {
    mockOccupiedSeats[showtime.id] = [];
  }
  mockOccupiedSeats[showtime.id].push(...hold.seatIds);
  mockBookingReservations.set(booking.id, hold);

  // Xóa hold
  releaseMockHold(data.holdId);
  mockBookings.push(booking);
  return booking;
}

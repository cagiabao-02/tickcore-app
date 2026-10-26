/** CRUD quản trị cập nhật trực tiếp kho mock; kiểm tra quyền và trùng lịch trước khi ghi. */
import { http, HttpResponse } from 'msw';
import {
  mockMovies,
  mockCinemas,
  mockRooms,
  mockShowtimes,
  mockCombos,
  mockPromotions,
  mockGenres,
  mockCities,
  mockPricing,
} from '../data';
import { getUserFromToken } from './auth';
import { mockError } from '../validation';
import type {
  Movie,
  Cinema,
  Room,
  Showtime,
  Combo,
  Promotion,
  SeatLayout,
  TicketPricing,
} from '@/types';

/** Tạo nhóm handler có cùng hợp đồng CRUD và phân trang. */
function crud<T extends { id: number }>(
  resource: string,
  items: T[],
  prepare: (item: T) => T = (item) => item,
) {
  const path = `/api/v1/admin/${resource}`;
  let nextId = Math.max(0, ...items.map((item) => item.id)) + 1;
  const authorize = (request: Request) => {
    const user = getUserFromToken(request.headers.get('Authorization'));
    return !user
      ? mockError(401, 'UNAUTHORIZED', 'Chưa đăng nhập')
      : user.role !== 'ADMIN'
        ? mockError(403, 'FORBIDDEN', 'Không có quyền')
        : null;
  };
  return [
    http.get(path, ({ request }) => {
      const error = authorize(request);
      if (error) return error;
      const params = new URL(request.url).searchParams;
      const keyword = (params.get('keyword') || '').toLocaleLowerCase();
      const status = params.get('status');
      const cinemaId = params.get('cinemaId');
      const filtered = items.filter((item) => {
        const values = item as T & { status?: string; cinemaId?: number };
        return (
          JSON.stringify(item).toLocaleLowerCase().includes(keyword) &&
          (!status || values.status === status) &&
          (!cinemaId || values.cinemaId === Number(cinemaId))
        );
      });
      const page = Math.max(0, Number(params.get('page')) || 0);
      const size = Math.max(1, Math.min(1000, Number(params.get('size')) || 20));
      return HttpResponse.json({
        content: filtered.slice(page * size, (page + 1) * size),
        page,
        size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
      });
    }),
    http.post(path, async ({ request }) => {
      const error = authorize(request);
      if (error) return error;
      const body = (await request.json()) as T;
      try {
        const item = prepare({ ...body, id: nextId++ });
        items.push(item);
        return HttpResponse.json(item, { status: 201 });
      } catch (error) {
        return mockError(
          400,
          'INVALID_RESOURCE',
          error instanceof Error ? error.message : 'Dữ liệu không hợp lệ',
        );
      }
    }),
    http.put(`${path}/:id`, async ({ request, params }) => {
      const error = authorize(request);
      if (error) return error;
      const index = items.findIndex((x) => x.id === Number(params.id));
      if (index < 0) return mockError(404, 'NOT_FOUND', 'Không tìm thấy dữ liệu');
      const body = (await request.json()) as Partial<T>;
      try {
        const item = prepare({ ...items[index], ...body, id: items[index].id });
        items[index] = item;
        return HttpResponse.json(item);
      } catch (error) {
        return mockError(
          400,
          'INVALID_RESOURCE',
          error instanceof Error ? error.message : 'Dữ liệu không hợp lệ',
        );
      }
    }),
    http.delete(`${path}/:id`, ({ request, params }) => {
      const error = authorize(request);
      if (error) return error;
      const index = items.findIndex((x) => x.id === Number(params.id));
      if (index < 0) return mockError(404, 'NOT_FOUND', 'Không tìm thấy dữ liệu');
      items.splice(index, 1);
      return HttpResponse.json({ message: 'Đã xóa' });
    }),
  ];
}

export const adminCrudHandlers = [
  ...crud<Movie>('movies', mockMovies, (item) => ({
    ...item,
    genres: mockGenres.filter((g) => item.genres.some((x) => x.id === g.id)),
  })),
  ...crud<Cinema>('cinemas', mockCinemas, (item) => {
    const city = mockCities.find((c) => c.id === item.city.id);
    if (!city) throw new Error('Thành phố không hợp lệ');
    return { ...item, city };
  }),
  ...crud<Room>('rooms', mockRooms, (item) => {
    const cinema = mockCinemas.find((c) => c.id === item.cinemaId);
    if (
      !cinema ||
      item.totalRows < 1 ||
      item.totalRows > 26 ||
      item.totalColumns < 1 ||
      item.totalColumns > 30
    )
      throw new Error('Phòng không hợp lệ');
    return { ...item, cinemaName: cinema.name, totalSeats: item.totalRows * item.totalColumns };
  }),
  ...crud<Showtime>('showtimes', mockShowtimes, (item) => {
    const movie = mockMovies.find((m) => m.id === item.movieId);
    const room = mockRooms.find((r) => r.id === item.roomId);
    const cinema = mockCinemas.find((c) => c.id === room?.cinemaId);
    if (!movie || !room || !cinema || !Number.isFinite(Date.parse(item.startTime)))
      throw new Error('Suất chiếu không hợp lệ');
    const endTime = new Date(Date.parse(item.startTime) + movie.duration * 60000).toISOString();
    if (
      mockShowtimes.some(
        (s) =>
          s.id !== item.id &&
          s.roomId === room.id &&
          Date.parse(s.startTime) < Date.parse(endTime) &&
          Date.parse(s.endTime) > Date.parse(item.startTime),
      )
    )
      throw new Error('admin.conflictWarning');
    return {
      ...item,
      startTime: new Date(item.startTime).toISOString(),
      endTime,
      date: item.startTime.slice(0, 10),
      movieTitle: movie.title,
      moviePosterUrl: movie.posterUrl,
      cinemaId: cinema.id,
      cinemaName: cinema.name,
      roomName: room.name,
      availableSeats: room.totalSeats,
      totalSeats: room.totalSeats,
    };
  }),
  ...crud<Combo>('combos', mockCombos),
  ...crud<Promotion>('promotions', mockPromotions, (item) => {
    if (mockPromotions.some((p) => p.id !== item.id && p.code === item.code))
      throw new Error('booking.promoInvalid');
    if (
      item.endDate < item.startDate ||
      item.value < 0 ||
      (item.type === 'PERCENTAGE' && item.value > 100)
    )
      throw new Error('booking.promoInvalid');
    return item;
  }),
  http.put('/api/v1/admin/rooms/:id/seat-layout', async ({ request, params }) => {
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user || user.role !== 'ADMIN')
      return mockError(user ? 403 : 401, 'FORBIDDEN', 'Không có quyền');
    const room = mockRooms.find((r) => r.id === Number(params.id));
    if (!room) return mockError(404, 'NOT_FOUND', 'Không tìm thấy phòng');
    const layout = (await request.json()) as SeatLayout;
    if (
      !Number.isInteger(layout.rows) ||
      !Number.isInteger(layout.columns) ||
      layout.rows < 1 ||
      layout.rows > 26 ||
      layout.columns < 1 ||
      layout.columns > 30 ||
      layout.seats.length !== layout.rows * layout.columns
    )
      return mockError(400, 'INVALID_LAYOUT', 'Sơ đồ không hợp lệ');
    room.seatLayout = layout;
    room.totalRows = layout.rows;
    room.totalColumns = layout.columns;
    room.totalSeats = layout.seats.filter((s) => s.type !== 'AISLE').length;
    return HttpResponse.json(layout);
  }),
  http.get('/api/v1/admin/pricing', ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user || user.role !== 'ADMIN')
      return mockError(user ? 403 : 401, 'FORBIDDEN', 'Không có quyền');
    return HttpResponse.json(mockPricing);
  }),
  http.put('/api/v1/admin/pricing', async ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user || user.role !== 'ADMIN')
      return mockError(user ? 403 : 401, 'FORBIDDEN', 'Không có quyền');
    const body = (await request.json()) as TicketPricing[];
    if (
      !Array.isArray(body) ||
      body.length !== 3 ||
      new Set(body.map((p) => p.seatType)).size !== 3 ||
      body.some(
        (p) =>
          !['STANDARD', 'VIP', 'COUPLE'].includes(p.seatType) ||
          [p.basePrice, p.surcharge3D, p.surchargeIMAX, p.weekendSurcharge].some(
            (value) => !Number.isInteger(value) || value < 0,
          ),
      )
    )
      return mockError(400, 'INVALID_PRICING', 'Giá không hợp lệ');
    mockPricing.splice(0, mockPricing.length, ...body);
    return HttpResponse.json(mockPricing);
  }),
];

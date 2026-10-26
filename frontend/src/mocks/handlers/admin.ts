/**
 * MSW handler cho trang admin (dashboard, CRUD).
 */
import { http, HttpResponse, delay } from 'msw';
import {
  mockRevenueByDay,
  mockBookings,
  mockUsers,
  mockReviews,
  mockShowtimes,
  mockMovies,
  mockCinemas,
  mockOccupiedSeats,
  releaseBookingSeats,
} from '../data';
import { getUserFromToken } from './auth';
import { adminCrudHandlers } from './adminCrud';
import { mockError } from '../validation';

/** Lọc bản ghi theo khoảng ngày ISO, dùng chung cho các biểu đồ và thống kê. */
function inRange(request: Request, date: string): boolean {
  const params = new URL(request.url).searchParams;
  const from = params.get('from');
  const to = params.get('to');
  const day = date.slice(0, 10);
  return (!from || day >= from) && (!to || day <= to);
}

/** Dữ liệu doanh thu lấy từ cùng tập vé đã xác nhận, đồng nhất với top phim. */
function revenueFor(request: Request) {
  const dates = new Set([
    ...mockRevenueByDay.map((r) => r.date),
    ...mockBookings.map((b) => b.createdAt.slice(0, 10)),
  ]);
  return [...dates]
    .sort()
    .filter((date) => inRange(request, date))
    .map((date) => {
      const bookings = mockBookings.filter(
        (b) => b.status === 'CONFIRMED' && b.createdAt.slice(0, 10) === date,
      );
      return {
        date,
        revenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
        bookings: bookings.length,
      };
    });
}

/** Kiểm tra quyền admin */
function requireAdmin(authHeader: string | null) {
  const user = getUserFromToken(authHeader);
  if (!user)
    return {
      error: HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      ),
      user: null,
    };
  if (user.role !== 'ADMIN')
    return {
      error: HttpResponse.json(
        { status: 403, code: 'FORBIDDEN', message: 'Không có quyền' },
        { status: 403 },
      ),
      user: null,
    };
  return { error: null, user };
}

export const adminHandlers = [
  // Dashboard
  http.get('/api/v1/admin/dashboard/summary', async ({ request }) => {
    await delay(300);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    const revenue = revenueFor(request);
    return HttpResponse.json({
      totalRevenue: revenue.reduce((sum, r) => sum + r.revenue, 0),
      totalBookings: revenue.reduce((sum, r) => sum + r.bookings, 0),
      totalShowtimes: mockShowtimes.filter((s) => inRange(request, s.date)).length,
      newUsers: mockUsers.filter((u) => inRange(request, u.createdAt)).length,
      revenueChange: 0,
      bookingsChange: 0,
    });
  }),

  http.get('/api/v1/admin/dashboard/revenue', async ({ request }) => {
    await delay(300);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    return HttpResponse.json(revenueFor(request));
  }),

  http.get('/api/v1/admin/dashboard/top-movies', async ({ request }) => {
    await delay(300);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    return HttpResponse.json(
      mockMovies
        .map((movie) => {
          const bookings = mockBookings.filter(
            (b) =>
              b.movieTitle === movie.title &&
              b.status === 'CONFIRMED' &&
              inRange(request, b.createdAt),
          );
          return {
            movieId: movie.id,
            movieTitle: movie.title,
            posterUrl: movie.posterUrl,
            totalTickets: bookings.reduce((sum, b) => sum + b.seats.length, 0),
            totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
          };
        })
        .sort((a, b) => b.totalTickets - a.totalTickets)
        .slice(0, 5),
    );
  }),

  http.get('/api/v1/admin/dashboard/occupancy', async ({ request }) => {
    await delay(300);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    return HttpResponse.json(
      mockCinemas.map((cinema) => {
        const showtimes = mockShowtimes.filter(
          (s) => s.cinemaId === cinema.id && inRange(request, s.date),
        );
        const totalSeats = showtimes.reduce((sum, s) => sum + s.totalSeats, 0);
        const occupiedSeats = showtimes.reduce(
          (sum, s) => sum + new Set(mockOccupiedSeats[s.id] || []).size,
          0,
        );
        return {
          cinemaId: cinema.id,
          cinemaName: cinema.name,
          totalSeats,
          occupiedSeats,
          occupancyRate: totalSeats ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
        };
      }),
    );
  }),

  ...adminCrudHandlers,

  // Admin Bookings
  http.get('/api/v1/admin/bookings', async ({ request }) => {
    await delay(300);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    const start = page * size;
    const status = url.searchParams.get('status');
    const movieId = url.searchParams.get('movieId');
    const filtered = mockBookings.filter(
      (b) =>
        (!status || b.status === status) &&
        inRange(request, b.createdAt) &&
        (!movieId || b.movieTitle === mockMovies.find((m) => m.id === Number(movieId))?.title),
    );
    const content = filtered.slice(start, start + size);
    return HttpResponse.json({
      content,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
    });
  }),

  http.post('/api/v1/admin/bookings/:id/cancel', async ({ request, params }) => {
    await delay(400);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    const booking = mockBookings.find((b) => b.id === Number(params.id));
    if (!booking)
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy đơn' },
        { status: 404 },
      );
    booking.status = 'CANCELLED';
    releaseBookingSeats(booking.id);
    return HttpResponse.json(booking);
  }),

  // Admin Users
  http.get('/api/v1/admin/users', async ({ request }) => {
    await delay(300);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword') || '';
    let filtered = [...mockUsers];
    if (keyword)
      filtered = filtered.filter(
        (u) =>
          u.fullName.toLowerCase().includes(keyword.toLowerCase()) || u.email.includes(keyword),
      );
    return HttpResponse.json({
      content: filtered,
      page: 0,
      size: 20,
      totalElements: filtered.length,
      totalPages: 1,
    });
  }),

  http.put('/api/v1/admin/users/:id/lock', async ({ request, params }) => {
    await delay(400);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    const user = mockUsers.find((u) => u.id === Number(params.id));
    if (user) user.locked = true;
    return HttpResponse.json(user);
  }),

  http.put('/api/v1/admin/users/:id/unlock', async ({ request, params }) => {
    await delay(400);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    const user = mockUsers.find((u) => u.id === Number(params.id));
    if (user) user.locked = false;
    return HttpResponse.json(user);
  }),

  http.put('/api/v1/admin/users/:id/role', async ({ request, params }) => {
    await delay(400);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    const body = (await request.json()) as { role: string };
    const user = mockUsers.find((u) => u.id === Number(params.id));
    if (!user) return mockError(404, 'NOT_FOUND', 'Không tìm thấy người dùng');
    if (body.role !== 'USER' && body.role !== 'ADMIN')
      return mockError(400, 'INVALID_ROLE', 'Vai trò không hợp lệ');
    user.role = body.role;
    return HttpResponse.json(user);
  }),

  // Admin Reviews
  http.get('/api/v1/admin/reviews', async ({ request }) => {
    await delay(300);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    return HttpResponse.json({
      content: mockReviews,
      page: 0,
      size: 20,
      totalElements: mockReviews.length,
      totalPages: 1,
    });
  }),

  http.put('/api/v1/admin/reviews/:id/hide', async ({ request, params }) => {
    await delay(300);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    const review = mockReviews.find((r) => r.id === Number(params.id));
    if (review) review.hidden = !review.hidden;
    return HttpResponse.json(review);
  }),

  http.delete('/api/v1/admin/reviews/:id', async ({ request, params }) => {
    await delay(300);
    const { error } = requireAdmin(request.headers.get('Authorization'));
    if (error) return error;
    const idx = mockReviews.findIndex((r) => r.id === Number(params.id));
    if (idx !== -1) mockReviews.splice(idx, 1);
    return HttpResponse.json({ message: 'Đã xóa' });
  }),
];

/** Kiểm thử hợp đồng HTTP và các quy tắc giữ ghế của mock qua MSW. */
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { setupServer } from 'msw/node';

// MSW dùng origin của trình duyệt để phân giải các đường dẫn tương đối.
globalThis.location = new URL('http://localhost');
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const { handlers } = await vite.ssrLoadModule('/src/mocks/handlers/index.ts');
const data = await vite.ssrLoadModule('/src/mocks/data/index.ts');
const server = setupServer(...handlers);
server.listen({ onUnhandledFrame: 'error' });
let checks = 0;
async function request(path, method = 'GET', body, token) {
  const response = await fetch(`http://localhost/api/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}
function check(actual, expected) {
  assert.deepEqual(actual, expected);
  checks++;
}
try {
  const login = await request('/auth/login', 'POST', {
    email: 'user@tickcore.vn',
    password: 'password123',
  });
  check(login.status, 200);
  const token = login.body.accessToken;
  const second = (
    await request('/auth/login', 'POST', { email: 'user2@tickcore.vn', password: 'password123' })
  ).body.accessToken;
  const email = 'new-mock@example.test';
  check(
    (
      await request('/auth/register', 'POST', {
        email,
        password: 'password123',
        fullName: 'Mock Test',
      })
    ).status,
    201,
  );
  check((await request('/auth/login', 'POST', { email, password: 'password123' })).status, 200);
  check((await request('/admin/movies', 'GET', undefined, token)).status, 403);
  const showtime = data.mockShowtimes.find(
    (s) => new Date(s.startTime).getTime() > Date.now() + 3 * 3600000,
  );
  assert.ok(showtime);
  const map = (await request(`/showtimes/${showtime.id}/seats`)).body;
  const seats = map.seats.filter((s) => s.status === 'AVAILABLE');
  const holdPath = `/showtimes/${showtime.id}/seat-holds`;
  // Hai tài khoản gửi đồng thời: chỉ một bên được giữ ghế, bên còn lại phải nhận 409.
  const contestedSeat = seats.at(-1).id;
  const race = await Promise.all([
    request(holdPath, 'POST', { seatIds: [contestedSeat] }, token),
    request(holdPath, 'POST', { seatIds: [contestedSeat] }, second),
  ]);
  check(race.map((response) => response.status).sort(), [200, 409]);
  const winner = race.findIndex((response) => response.status === 200);
  await request(`/seat-holds/${race[winner].body.holdId}`, 'DELETE', undefined, winner === 0 ? token : second);
  check((await request(holdPath, 'POST', { seatIds: [] }, token)).status, 400);
  check(
    (await request(holdPath, 'POST', { seatIds: [seats[0].id, seats[0].id] }, token)).status,
    400,
  );
  const hold = await request(holdPath, 'POST', { seatIds: [seats[0].id, seats[1].id] }, token);
  check(hold.status, 200);
  check((await request(holdPath, 'POST', { seatIds: [seats[0].id] }, second)).status, 409);
  check(
    (await request(`/seat-holds/${hold.body.holdId}`, 'DELETE', undefined, second)).status,
    403,
  );
  check(
    (await request('/bookings', 'POST', { holdId: hold.body.holdId, combos: [] }, second)).status,
    403,
  );
  check(
    (
      await request(
        '/bookings',
        'POST',
        { holdId: hold.body.holdId, combos: [], promoCode: 'HETHAN' },
        token,
      )
    ).status,
    400,
  );
  const booking = await request(
    '/bookings',
    'POST',
    { holdId: hold.body.holdId, combos: [], promoCode: 'WELCOME10' },
    token,
  );
  check(booking.status, 201);
  check(booking.body.status, 'PENDING');
  check(booking.body.paymentStatus, 'PENDING');
  check(booking.body.qrCode, '');
  check(typeof booking.body.expiresAt, 'string');
  check((await request('/payments/simulate', 'POST', { bookingId: booking.body.id, method: 'QR_TRANSFER' }, token)).status, 400);
  check((await request(`/bookings/${booking.body.id}`, 'GET', undefined, token)).body.status, 'PENDING');
  check(booking.body.totalAmount, booking.body.subtotal - Math.floor(booking.body.subtotal * 0.1));
  check((await request(`/bookings/${booking.body.id}`, 'GET', undefined, second)).status, 404);
  const failed = await request(
    '/payments/simulate',
    'POST',
    { bookingId: booking.body.id, method: 'E_WALLET', outcome: 'FAILED' },
    token,
  );
  check(failed.body.success, false);
  check(failed.body.booking.paymentStatus, 'FAILED');
  const paid = await request(
    '/payments/simulate',
    'POST',
    { bookingId: booking.body.id, method: 'CREDIT_CARD', outcome: 'SUCCESS' },
    token,
  );
  check(paid.body.booking.status, 'CONFIRMED');
  check(paid.body.booking.qrCode, paid.body.booking.bookingCode);
  check((await request(holdPath, 'POST', { seatIds: [seats[0].id] }, token)).status, 409);
  check(
    (await request(`/bookings/${booking.body.id}/cancel`, 'POST', undefined, token)).status,
    200,
  );
  const another = await request(holdPath, 'POST', { seatIds: [seats[0].id] }, token);
  check(another.status, 200);
  data.mockSeatHolds.find((h) => h.holdId === another.body.holdId).expiresAt = new Date(
    Date.now() - 1000,
  ).toISOString();
  check(
    (await request('/bookings', 'POST', { holdId: another.body.holdId, combos: [] }, token)).status,
    410,
  );
  check((await request(holdPath, 'POST', { seatIds: [seats[0].id] }, token)).status, 200);
  check(
    (await request('/movies/1/reviews', 'POST', { rating: 5, comment: 'Test' }, second)).status,
    403,
  );
  const admin = (
    await request('/auth/login', 'POST', { email: 'admin@tickcore.vn', password: 'password123' })
  ).body.accessToken;
  const combo = await request(
    '/admin/combos',
    'POST',
    {
      name: 'Test combo',
      description: 'Test',
      imageUrl: 'https://example.test/combo.png',
      price: 50000,
      active: true,
    },
    admin,
  );
  check(combo.status, 201);
  check(
    (await request('/admin/combos', 'GET', undefined, admin)).body.content.some(
      (c) => c.id === combo.body.id,
    ),
    true,
  );
  check(
    (await request(`/admin/combos/${combo.body.id}`, 'PUT', { active: false, price: 60000 }, admin))
      .body.price,
    60000,
  );
  check(
    (await request('/combos')).body.some((c) => c.id === combo.body.id),
    false,
  );
  check((await request(`/admin/combos/${combo.body.id}`, 'DELETE', undefined, admin)).status, 200);
  check(
    (await request('/admin/combos', 'GET', undefined, admin)).body.content.some(
      (c) => c.id === combo.body.id,
    ),
    false,
  );
  check((await request('/admin/showtimes', 'POST', { ...showtime }, admin)).status, 400);
  const room = data.mockRooms.at(-1);
  const layout = {
    rows: 1,
    columns: 2,
    seats: [
      { row: 'A', column: 1, type: 'AISLE' },
      { row: 'A', column: 2, type: 'VIP' },
    ],
  };
  check((await request(`/admin/rooms/${room.id}/seat-layout`, 'PUT', layout, admin)).status, 200);
  const layoutShowtime = data.mockShowtimes.find(
    (s) => s.roomId === room.id && new Date(s.startTime).getTime() > Date.now(),
  );
  const layoutMap = (await request(`/showtimes/${layoutShowtime.id}/seats`)).body;
  check(
    layoutMap.seats.map((s) => s.type),
    ['AISLE', 'VIP'],
  );
  check(
    (
      await request(
        `/showtimes/${layoutShowtime.id}/seat-holds`,
        'POST',
        { seatIds: [layoutMap.seats[0].id] },
        token,
      )
    ).status,
    400,
  );
  const prices = structuredClone(data.mockPricing);
  prices.find((p) => p.seatType === 'VIP').basePrice += 5000;
  check((await request('/admin/pricing', 'PUT', prices, admin)).status, 200);
  check(
    (await request(`/showtimes/${layoutShowtime.id}/seats`)).body.seats[1].price,
    layoutMap.seats[1].price + 5000,
  );
  const review = await request(
    '/movies/5/reviews',
    'POST',
    { rating: 4, comment: 'Đã xem phim' },
    token,
  );
  check(review.status, 201);
  check(
    (await request(`/reviews/${review.body.id}`, 'PUT', { rating: 3, comment: 'Đã sửa' }, token))
      .body.rating,
    3,
  );
  check((await request(`/reviews/${review.body.id}`, 'DELETE', undefined, token)).status, 200);
  check((await request('/movies/5')).body.totalReviews, 1);
  const pendingHold = await request(holdPath, 'POST', { seatIds: [seats[2].id] }, token);
  const pending = await request(
    '/bookings',
    'POST',
    { holdId: pendingHold.body.holdId, combos: [] },
    token,
  );
  check(pending.status, 201);
  data.mockBookingReservations.get(pending.body.id).expiresAt = new Date(
    Date.now() - 1000,
  ).toISOString();
  check(
    (await request(`/showtimes/${showtime.id}/seats`)).body.seats.find((s) => s.id === seats[2].id)
      .status,
    'AVAILABLE',
  );
  check(
    (await request(`/bookings/${pending.body.id}`, 'GET', undefined, token)).body.status,
    'EXPIRED',
  );
  check(
    (
      await request(
        '/payments/simulate',
        'POST',
        { bookingId: pending.body.id, method: 'CREDIT_CARD', outcome: 'SUCCESS' },
        token,
      )
    ).status,
    409,
  );
  const expiredToken = btoa(JSON.stringify({ userId: 1, exp: Date.now() - 1000 }));
  check((await request('/users/me', 'GET', undefined, expiredToken)).status, 401);
  const summary = (await request('/admin/dashboard/summary', 'GET', undefined, admin)).body;
  const revenue = (await request('/admin/dashboard/revenue', 'GET', undefined, admin)).body;
  check(
    summary.totalRevenue,
    revenue.reduce((sum, day) => sum + day.revenue, 0),
  );
  console.log(`PASS: ${checks} kiểm tra hợp đồng và nghiệp vụ mock.`);
} finally {
  server.close();
  await vite.close();
}

/**
 * MSW handler cho đặt vé, giữ ghế, nhả ghế, thanh toán.
 */
import { http, HttpResponse, delay } from 'msw';
import {
  mockBookings,
  mockSeatHolds,
  createMockHold,
  releaseMockHold,
  createMockBooking,
  mockOccupiedSeats,
  isSeatHeld,
  mockShowtimes,
  mockRooms,
  generateSeatMap,
  cleanupExpiredHolds,
  releaseBookingSeats,
  mockCombos,
  mockPromotions,
} from '../data';
import { mockError, validatePromotion } from '../validation';
import { getUserFromToken } from './auth';
import type { Page } from '@/types';

export const bookingHandlers = [
  // Xác nhận check-in bằng mã đọc từ QR vé (máy quét thường nhập như bàn phím).
  http.post('/api/v1/admin/bookings/check-in', async ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user) return mockError(401, 'UNAUTHORIZED', 'common.sessionExpired');
    if (user.role !== 'ADMIN') return mockError(403, 'FORBIDDEN', 'FORBIDDEN');
    const body = (await request.json()) as { ticketCode?: string; bookingCode?: string };
    const scannedCode = body.ticketCode?.trim() || body.bookingCode?.trim();
    const booking = mockBookings.find(
      (item) =>
        item.bookingCode === scannedCode || item.qrCode === scannedCode ||
        item.seats.some((seat) => seat.ticketCode === scannedCode),
    );
    if (!booking) return mockError(404, 'TICKET_NOT_FOUND', 'tickets.scanInvalid');
    const scannedSeat = booking.seats.find((seat) => seat.ticketCode === scannedCode);
    if ((scannedSeat && scannedSeat.checkedInAt) || (!scannedSeat && booking.checkedInAt))
      return HttpResponse.json(
        {
          status: 409,
          code: 'TICKET_ALREADY_CHECKED_IN',
          message: 'tickets.alreadyCheckedIn',
          details: {
            checkedInAt: scannedSeat?.checkedInAt || booking.checkedInAt,
            checkedInBy: scannedSeat?.checkedInBy || booking.checkedInBy || '',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 },
      );
    if (booking.status !== 'CONFIRMED' || booking.paymentStatus !== 'SUCCESS')
      return mockError(409, 'TICKET_NOT_VALID', 'tickets.scanNotValid');
    const scannedAt = new Date().toISOString();
    if (scannedSeat) {
      scannedSeat.checkedInAt = scannedAt;
      scannedSeat.checkedInBy = user.fullName;
    }
    booking.checkedInAt ||= scannedAt;
    booking.checkedInBy ||= user.fullName;
    return HttpResponse.json(booking);
  }),

  // Giữ ghế
  http.post('/api/v1/showtimes/:id/seat-holds', async ({ request, params }) => {
    await delay(500);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const showtimeId = Number(params.id);
    const body = (await request.json()) as { seatIds: number[] };
    const showtime = mockShowtimes.find((s) => s.id === showtimeId);
    const room = mockRooms.find((r) => r.id === showtime?.roomId);
    if (!showtime || !room) return mockError(404, 'NOT_FOUND', 'Không tìm thấy suất chiếu');
    if (new Date(showtime.startTime).getTime() <= Date.now())
      return mockError(400, 'SHOWTIME_PASSED', 'Suất chiếu đã bắt đầu');
    if (
      !Array.isArray(body.seatIds) ||
      body.seatIds.length < 1 ||
      body.seatIds.length > 8 ||
      new Set(body.seatIds).size !== body.seatIds.length
    ) {
      return mockError(400, 'INVALID_SEATS', 'Chọn từ 1 đến 8 ghế khác nhau');
    }
    const seats = generateSeatMap(room, showtimeId).seats;
    if (body.seatIds.some((id) => !seats.some((s) => s.id === id && s.type !== 'AISLE')))
      return mockError(400, 'INVALID_SEATS', 'Ghế không thuộc suất chiếu');

    // Kiểm tra ghế đã bị chiếm hoặc giữ
    const occupied = mockOccupiedSeats[showtimeId] || [];
    for (const seatId of body.seatIds) {
      if (occupied.includes(seatId)) {
        return HttpResponse.json(
          {
            status: 409,
            code: 'SEAT_OCCUPIED',
            message: 'Một số ghế đã được đặt',
            timestamp: new Date().toISOString(),
          },
          { status: 409 },
        );
      }
      if (isSeatHeld(showtimeId, seatId)) {
        return HttpResponse.json(
          {
            status: 409,
            code: 'SEAT_HELD',
            message: 'Một số ghế đang được người khác giữ',
            timestamp: new Date().toISOString(),
          },
          { status: 409 },
        );
      }
    }

    const hold = createMockHold(showtimeId, user.id, body.seatIds);
    return HttpResponse.json({
      holdId: hold.holdId,
      showtimeId: hold.showtimeId,
      seatIds: hold.seatIds,
      expiresAt: hold.expiresAt,
    });
  }),

  // Nhả ghế
  http.delete('/api/v1/seat-holds/:holdId', async ({ request, params }) => {
    await delay(300);
    const holdId = Number(params.holdId);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user) return mockError(401, 'UNAUTHORIZED', 'Chưa đăng nhập');
    const hold = mockSeatHolds.find((h) => h.holdId === holdId);
    if (hold && hold.userId !== user.id) return mockError(403, 'FORBIDDEN', 'Không có quyền');
    releaseMockHold(holdId);
    return HttpResponse.json({ message: 'Đã nhả ghế' });
  }),

  // Tạo đơn đặt vé
  http.post('/api/v1/bookings', async ({ request }) => {
    await delay(800);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const body = (await request.json()) as {
      holdId: number;
      showtimeId: number;
      combos: Array<{ comboId: number; quantity: number }>;
      promoCode: string | null;
    };

    // Kiểm tra hold còn tồn tại không
    cleanupExpiredHolds();
    const hold = mockSeatHolds.find((h) => h.holdId === body.holdId);
    if (!hold) {
      return HttpResponse.json(
        {
          status: 410,
          code: 'HOLD_EXPIRED',
          message: 'Thời gian giữ ghế đã hết',
          timestamp: new Date().toISOString(),
        },
        { status: 410 },
      );
    }

    if (hold.userId !== user.id) return mockError(403, 'FORBIDDEN', 'Không có quyền');
    if (body.showtimeId !== undefined && body.showtimeId !== hold.showtimeId)
      return mockError(400, 'INVALID_SHOWTIME', 'Suất chiếu không khớp');
    const combos = body.combos || [];
    if (
      !Array.isArray(combos) ||
      combos.some(
        (c) =>
          !Number.isInteger(c.quantity) ||
          c.quantity < 1 ||
          !mockCombos.some((x) => x.id === c.comboId && x.active),
      )
    )
      return mockError(400, 'INVALID_COMBOS', 'Combo không hợp lệ');
    const showtime = mockShowtimes.find((s) => s.id === hold.showtimeId)!;
    const room = mockRooms.find((r) => r.id === showtime.roomId)!;
    const seatMap = generateSeatMap(room, showtime.id);
    const subtotal =
      seatMap.seats
        .filter((s) => hold.seatIds.includes(s.id))
        .reduce((sum, s) => sum + s.price, 0) +
      combos.reduce(
        (sum, c) => sum + mockCombos.find((x) => x.id === c.comboId)!.price * c.quantity,
        0,
      );
    const promotion = body.promoCode ? validatePromotion(body.promoCode, subtotal) : null;
    if (promotion && !promotion.valid)
      return mockError(400, 'INVALID_PROMOTION', promotion.message);
    try {
      const booking = createMockBooking({
        userId: user.id,
        showtimeId: hold.showtimeId,
        holdId: body.holdId,
        combos: body.combos || [],
        promoCode: body.promoCode?.trim().toUpperCase() || null,
      });
      booking.discount = promotion?.discountAmount || 0;
      booking.totalAmount = booking.subtotal - booking.discount;
      return HttpResponse.json(booking, { status: 201 });
    } catch {
      return HttpResponse.json(
        {
          status: 500,
          code: 'BOOKING_FAILED',
          message: 'Không thể tạo đơn',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  // Vé của tôi
  http.get('/api/v1/bookings/me', async ({ request }) => {
    await delay(400);
    cleanupExpiredHolds();
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');

    let filtered = mockBookings.filter((b) => b.userId === user.id);

    if (status === 'UPCOMING') {
      filtered = filtered.filter(
        (b) => b.status === 'CONFIRMED' && new Date(b.showtime) > new Date(),
      );
    } else if (status === 'WATCHED') {
      filtered = filtered.filter(
        (b) => b.status === 'CONFIRMED' && new Date(b.showtime) <= new Date(),
      );
    } else if (status === 'CANCELLED') {
      filtered = filtered.filter((b) => b.status === 'CANCELLED');
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const start = page * size;
    const content = filtered.slice(start, start + size);
    const result: Page<(typeof mockBookings)[0]> = {
      content,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
    };
    return HttpResponse.json(result);
  }),

  // Chi tiết đặt vé
  http.get('/api/v1/bookings/:id', async ({ request, params }) => {
    await delay(300);
    cleanupExpiredHolds();
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const booking = mockBookings.find((b) => b.id === Number(params.id) && b.userId === user.id);
    if (!booking)
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy đơn' },
        { status: 404 },
      );
    return HttpResponse.json(booking);
  }),

  // Hủy vé
  http.post('/api/v1/bookings/:id/cancel', async ({ request, params }) => {
    await delay(500);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const booking = mockBookings.find((b) => b.id === Number(params.id) && b.userId === user.id);
    if (!booking)
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy đơn' },
        { status: 404 },
      );

    if (booking.checkedInAt || booking.seats?.some((seat) => seat.checkedInAt))
      return mockError(409, 'BOOKING_ALREADY_CHECKED_IN', 'Không thể hủy đơn đã có vé được check-in.');

    // Kiểm tra còn trên 2 giờ trước giờ chiếu
    const showTime = new Date(booking.showtime).getTime();
    const twoHoursBefore = showTime - 2 * 60 * 60 * 1000;
    if (
      booking.status !== 'PENDING' &&
      (Date.now() >= twoHoursBefore || booking.status !== 'CONFIRMED')
    ) {
      return HttpResponse.json(
        {
          status: 400,
          code: 'CANCEL_TOO_LATE',
          message: 'Không thể hủy vé khi còn dưới 2 giờ trước giờ chiếu',
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    booking.status = 'CANCELLED';
    releaseBookingSeats(booking.id);
    return HttpResponse.json(booking);
  }),

  // Thanh toán mô phỏng
  http.post('/api/v1/payments/simulate', async ({ request }) => {
    await delay(1500);
    const user = getUserFromToken(request.headers.get('Authorization'));
    if (!user)
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
        { status: 401 },
      );

    const body = (await request.json()) as { bookingId: number; method: string; outcome?: string };
    cleanupExpiredHolds();
    const booking = mockBookings.find((b) => b.id === body.bookingId && b.userId === user.id);
    if (!booking)
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy đơn' },
        { status: 404 },
      );

    if (booking.status !== 'PENDING')
      return mockError(409, 'INVALID_BOOKING_STATUS', 'Đơn không còn chờ thanh toán');
    if (!['CREDIT_CARD', 'E_WALLET', 'QR_TRANSFER'].includes(body.method))
      return mockError(400, 'INVALID_METHOD', 'Phương thức không hợp lệ');
    if (!['SUCCESS', 'FAILED'].includes(body.outcome || ''))
      return mockError(400, 'INVALID_PAYMENT_OUTCOME', 'booking.chooseSimulationOutcome');
    // Chỉ phát kết quả khi người thử chủ động kích hoạt bộ mô phỏng.
    const success = body.outcome === 'SUCCESS';
    if (success) {
      booking.paymentMethod = body.method as typeof booking.paymentMethod;
      booking.paymentStatus = 'SUCCESS';
      booking.status = 'CONFIRMED';
      booking.qrCode = booking.bookingCode;
      const promotion = mockPromotions.find((p) => p.code === booking.promoCode);
      if (promotion) promotion.usedCount++;
      return HttpResponse.json({ success: true, booking });
    } else {
      booking.paymentStatus = 'FAILED';
      booking.paymentMethod = body.method as typeof booking.paymentMethod;
      return HttpResponse.json({ success: false, booking });
    }
  }),
];

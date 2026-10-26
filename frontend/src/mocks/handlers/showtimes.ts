/**
 * MSW handler cho suất chiếu và sơ đồ ghế.
 */
import { http, HttpResponse, delay } from 'msw';
import {
  mockShowtimes,
  mockRooms,
  mockOccupiedSeats,
  generateSeatMap,
  isSeatHeld,
  cleanupExpiredHolds,
} from '../data';

export const showtimeHandlers = [
  // Danh sách suất chiếu
  http.get('/api/v1/showtimes', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const movieId = url.searchParams.get('movieId');
    const cinemaId = url.searchParams.get('cinemaId');
    const date = url.searchParams.get('date');

    let filtered = [...mockShowtimes];
    if (movieId) filtered = filtered.filter((s) => s.movieId === Number(movieId));
    if (cinemaId) filtered = filtered.filter((s) => s.cinemaId === Number(cinemaId));
    if (date) filtered = filtered.filter((s) => s.date === date);

    cleanupExpiredHolds();
    return HttpResponse.json(
      filtered.map((showtime) => {
        const room = mockRooms.find((r) => r.id === showtime.roomId);
        if (!room) return showtime;
        const seats = generateSeatMap(
          room,
          showtime.id,
          mockOccupiedSeats[showtime.id] || [],
        ).seats;
        return {
          ...showtime,
          totalSeats: seats.filter((s) => s.type !== 'AISLE').length,
          availableSeats: seats.filter(
            (s) => s.type !== 'AISLE' && s.status === 'AVAILABLE' && !isSeatHeld(showtime.id, s.id),
          ).length,
        };
      }),
    );
  }),

  // Chi tiết suất chiếu
  http.get('/api/v1/showtimes/:id', async ({ params }) => {
    await delay(200);
    const showtime = mockShowtimes.find((s) => s.id === Number(params.id));
    if (!showtime)
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy suất chiếu' },
        { status: 404 },
      );
    return HttpResponse.json(showtime);
  }),

  // Sơ đồ ghế
  http.get('/api/v1/showtimes/:id/seats', async ({ params }) => {
    await delay(300);
    cleanupExpiredHolds();
    const showtimeId = Number(params.id);
    const showtime = mockShowtimes.find((s) => s.id === showtimeId);
    if (!showtime)
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy suất chiếu' },
        { status: 404 },
      );

    const room = mockRooms.find((r) => r.id === showtime.roomId);
    if (!room)
      return HttpResponse.json(
        { status: 500, code: 'INTERNAL', message: 'Lỗi hệ thống' },
        { status: 500 },
      );

    const occupied = mockOccupiedSeats[showtimeId] || [];
    const seatMap = generateSeatMap(room, showtimeId, occupied);

    // Cập nhật trạng thái ghế đang bị giữ bởi người khác
    seatMap.seats = seatMap.seats.map((seat) => {
      if (seat.status === 'AVAILABLE' && isSeatHeld(showtimeId, seat.id)) {
        return { ...seat, status: 'HELD' as const };
      }
      return seat;
    });

    return HttpResponse.json(seatMap);
  }),
];

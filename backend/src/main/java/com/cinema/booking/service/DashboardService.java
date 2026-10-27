package com.cinema.booking.service;

import com.cinema.booking.dto.request.DateRangeRequest;
import com.cinema.booking.dto.response.DashboardSummaryResponse;
import com.cinema.booking.dto.response.OccupancyByCinemaResponse;
import com.cinema.booking.dto.response.RevenueByDayResponse;
import com.cinema.booking.dto.response.TopMovieResponse;
import com.cinema.booking.entity.Booking;
import com.cinema.booking.entity.BookingSeat;
import com.cinema.booking.entity.BookingStatus;
import com.cinema.booking.entity.Cinema;
import com.cinema.booking.entity.Movie;
import com.cinema.booking.entity.Room;
import com.cinema.booking.entity.SeatType;
import com.cinema.booking.entity.Showtime;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.repository.BookingRepository;
import com.cinema.booking.repository.BookingSeatRepository;
import com.cinema.booking.repository.CinemaRepository;
import com.cinema.booking.repository.MovieRepository;
import com.cinema.booking.repository.RoomRepository;
import com.cinema.booking.repository.SeatRepository;
import com.cinema.booking.repository.ShowtimeRepository;
import com.cinema.booking.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Báo cáo dùng booking đã thanh toán (CONFIRMED), không tính đơn pending/cancelled. */
@Service
public class DashboardService {
    private final BookingRepository bookings;
    private final BookingSeatRepository bookingSeats;
    private final ShowtimeRepository showtimes;
    private final MovieRepository movies;
    private final RoomRepository rooms;
    private final CinemaRepository cinemas;
    private final SeatRepository seats;
    private final UserRepository users;
    private final ZoneId businessZone;

    public DashboardService(BookingRepository bookings, BookingSeatRepository bookingSeats, ShowtimeRepository showtimes,
        MovieRepository movies, RoomRepository rooms, CinemaRepository cinemas, SeatRepository seats, UserRepository users,
        @Value("${booking.time-zone:Asia/Ho_Chi_Minh}") String timeZone) {
        this.bookings = bookings;
        this.bookingSeats = bookingSeats;
        this.showtimes = showtimes;
        this.movies = movies;
        this.rooms = rooms;
        this.cinemas = cinemas;
        this.seats = seats;
        this.users = users;
        this.businessZone = ZoneId.of(timeZone);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(DateRangeRequest query) {
        DateRange range = range(query);
        List<Booking> current = bookings.findByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            BookingStatus.CONFIRMED, range.from(), range.to());
        List<Booking> previous = bookings.findByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            BookingStatus.CONFIRMED, range.previousFrom(), range.from());
        long revenue = current.stream().mapToLong(Booking::getTotalAmount).sum();
        long previousRevenue = previous.stream().mapToLong(Booking::getTotalAmount).sum();
        long showtimeCount = showtimes.countByActiveTrueAndStartTimeGreaterThanEqualAndStartTimeLessThan(range.from(), range.to());
        long newUsers = users.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(range.from(), range.to());
        return new DashboardSummaryResponse(revenue, current.size(), Math.toIntExact(showtimeCount), Math.toIntExact(newUsers),
            percentChange(revenue, previousRevenue), percentChange(current.size(), previous.size()));
    }

    @Transactional(readOnly = true)
    public List<RevenueByDayResponse> getRevenueByDay(DateRangeRequest query) {
        DateRange range = range(query);
        Map<LocalDate, long[]> daily = new TreeMap<>();
        for (LocalDate day = range.fromDate(); day.isBefore(range.toDate()); day = day.plusDays(1)) daily.put(day, new long[2]);
        List<Booking> confirmed = bookings.findByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(BookingStatus.CONFIRMED, range.from(), range.to());
        for (Booking booking : confirmed) {
            LocalDate day = booking.getCreatedAt().atZone(businessZone).toLocalDate();
            long[] values = daily.get(day);
            if (values != null) { values[0] += booking.getTotalAmount(); values[1]++; }
        }
        return daily.entrySet().stream().map(entry -> new RevenueByDayResponse(entry.getKey().toString(),
            entry.getValue()[0], Math.toIntExact(entry.getValue()[1]))).toList();
    }

    @Transactional(readOnly = true)
    public List<TopMovieResponse> getTopMovies(DateRangeRequest query) {
        DateRange range = range(query);
        List<Booking> orders = bookings.findByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            BookingStatus.CONFIRMED, range.from(), range.to());
        if (orders.isEmpty()) return List.of();
        Map<Long, Booking> ordersById = new HashMap<>();
        orders.forEach(order -> ordersById.put(order.getId(), order));
        Map<Long, Showtime> showsById = new HashMap<>();
        showtimes.findAllById(orders.stream().map(Booking::getShowtimeId).distinct().toList())
            .forEach(showtime -> showsById.put(showtime.getId(), showtime));
        Map<Long, Movie> moviesById = new HashMap<>();
        movies.findAllById(showsById.values().stream().map(Showtime::getMovieId).distinct().toList())
            .forEach(movie -> moviesById.put(movie.getId(), movie));
        Map<Long, long[]> totals = new HashMap<>();
        for (BookingSeat ticket : bookingSeats.findByBookingIdIn(ordersById.keySet())) {
            Booking booking = ordersById.get(ticket.getBookingId());
            Showtime showtime = showsById.get(booking.getShowtimeId());
            if (showtime == null) continue;
            long[] sum = totals.computeIfAbsent(showtime.getMovieId(), ignored -> new long[2]);
            sum[0]++;
            sum[1] += ticket.getPrice();
        }
        List<TopMovieResponse> result = new ArrayList<>();
        totals.forEach((movieId, sum) -> {
            Movie movie = moviesById.get(movieId);
            String title = movie == null ? "Phim đã lưu trong lịch sử" : movie.getTitle();
            String poster = movie == null ? null : movie.getPosterUrl();
            result.add(new TopMovieResponse(movieId, title, poster, Math.toIntExact(sum[0]), sum[1]));
        });
        return result.stream().sorted((left, right) -> Long.compare(right.totalRevenue(), left.totalRevenue())).limit(10).toList();
    }

    @Transactional(readOnly = true)
    public List<OccupancyByCinemaResponse> getOccupancyByCinema(DateRangeRequest query) {
        DateRange range = range(query);
        List<Showtime> shows = showtimes.findByActiveTrueAndStartTimeGreaterThanEqualAndStartTimeLessThanOrderByStartTimeAsc(range.from(), range.to());
        if (shows.isEmpty()) return List.of();
        Map<Long, Showtime> showById = new HashMap<>();
        shows.forEach(show -> showById.put(show.getId(), show));
        Map<Long, Room> roomById = new HashMap<>();
        rooms.findAllById(shows.stream().map(Showtime::getRoomId).distinct().toList()).forEach(room -> roomById.put(room.getId(), room));
        Map<Long, Cinema> cinemaById = new HashMap<>();
        cinemas.findAllById(roomById.values().stream().map(Room::getCinemaId).distinct().toList()).forEach(cinema -> cinemaById.put(cinema.getId(), cinema));
        Map<Long, long[]> totalsByCinema = new HashMap<>();
        Map<Long, Integer> capacityByRoom = new HashMap<>();
        for (Showtime show : shows) {
            Room room = roomById.get(show.getRoomId());
            if (room == null) continue;
            long capacity = capacityByRoom.computeIfAbsent(room.getId(), ignored -> Math.toIntExact(
                seats.countByRoomIdAndActiveTrueAndSeatTypeNot(room.getId(), SeatType.AISLE)));
            totalsByCinema.computeIfAbsent(room.getCinemaId(), ignored -> new long[2])[0] += capacity;
        }
        List<Booking> soldOrders = bookings.findByStatusAndShowtimeRange(BookingStatus.CONFIRMED, range.from(), range.to());
        if (!soldOrders.isEmpty()) {
            Map<Long, Long> soldByShowtime = new HashMap<>();
            Map<Long, Long> bookingToShowtime = new HashMap<>();
            soldOrders.forEach(order -> bookingToShowtime.put(order.getId(), order.getShowtimeId()));
            for (BookingSeat ticket : bookingSeats.findByBookingIdIn(bookingToShowtime.keySet()))
                soldByShowtime.merge(bookingToShowtime.get(ticket.getBookingId()), 1L, Long::sum);
            soldByShowtime.forEach((showtimeId, count) -> {
                Showtime show = showById.get(showtimeId);
                Room room = show == null ? null : roomById.get(show.getRoomId());
                if (room != null) totalsByCinema.computeIfAbsent(room.getCinemaId(), ignored -> new long[2])[1] += count;
            });
        }
        Map<Long, Cinema> cinemaMap = cinemaById;
        return totalsByCinema.entrySet().stream().map(entry -> {
            long capacity = entry.getValue()[0];
            long occupied = Math.min(capacity, entry.getValue()[1]);
            Cinema cinema = cinemaMap.get(entry.getKey());
            return new OccupancyByCinemaResponse(entry.getKey(), cinema == null ? "" : cinema.getName(),
                capacity == 0 ? 0d : Math.round(occupied * 1000d / capacity) / 10d,
                Math.toIntExact(capacity), Math.toIntExact(occupied));
        }).toList();
    }

    private DateRange range(DateRangeRequest query) {
        LocalDate today = LocalDate.now(businessZone);
        LocalDate fromDate = parseDate(query.from(), today.minusDays(29));
        LocalDate toDate = parseDate(query.to(), today);
        if (toDate.isBefore(fromDate)) throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE", "Ngày kết thúc không được trước ngày bắt đầu.");
        long days = java.time.temporal.ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        if (days > 366) throw new BusinessException(HttpStatus.BAD_REQUEST, "DATE_RANGE_TOO_LARGE", "Khoảng thống kê tối đa 366 ngày.");
        Instant from = fromDate.atStartOfDay(businessZone).toInstant();
        Instant to = toDate.plusDays(1).atStartOfDay(businessZone).toInstant();
        Instant previousFrom = fromDate.minusDays(days).atStartOfDay(businessZone).toInstant();
        return new DateRange(fromDate, toDate.plusDays(1), from, to, previousFrom);
    }
    private LocalDate parseDate(String value, LocalDate fallback) {
        if (value == null || value.isBlank()) return fallback;
        try { return LocalDate.parse(value); }
        catch (DateTimeParseException ex) { throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_DATE", "Ngày phải theo định dạng YYYY-MM-DD."); }
    }
    private double percentChange(long current, long previous) {
        if (previous == 0) return current == 0 ? 0d : 100d;
        return Math.round((current - previous) * 1000d / previous) / 10d;
    }
    private record DateRange(LocalDate fromDate, LocalDate toDate, Instant from, Instant to, Instant previousFrom) {}
}

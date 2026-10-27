package com.cinema.booking.service;

import com.cinema.booking.dto.request.SearchRequest;
import com.cinema.booking.dto.request.ShowtimeRequest;
import com.cinema.booking.dto.request.ShowtimeSearchRequest;
import com.cinema.booking.dto.response.MessageResponse;
import com.cinema.booking.dto.response.PageResponse;
import com.cinema.booking.dto.response.SeatMapResponse;
import com.cinema.booking.dto.response.SeatResponse;
import com.cinema.booking.dto.response.ShowtimeResponse;
import com.cinema.booking.dto.response.TicketPricingResponse;
import com.cinema.booking.entity.Booking;
import com.cinema.booking.entity.BookingStatus;
import com.cinema.booking.entity.Cinema;
import com.cinema.booking.entity.Movie;
import com.cinema.booking.entity.MovieStatus;
import com.cinema.booking.entity.Room;
import com.cinema.booking.entity.Seat;
import com.cinema.booking.entity.SeatAllocation;
import com.cinema.booking.entity.SeatType;
import com.cinema.booking.entity.ShowFormat;
import com.cinema.booking.entity.Showtime;
import com.cinema.booking.entity.SubtitleType;
import com.cinema.booking.entity.TicketPricing;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.CinemaRepository;
import com.cinema.booking.repository.BookingRepository;
import com.cinema.booking.repository.MovieRepository;
import com.cinema.booking.repository.RoomRepository;
import com.cinema.booking.repository.SeatAllocationRepository;
import com.cinema.booking.repository.SeatRepository;
import com.cinema.booking.repository.ShowtimeRepository;
import com.cinema.booking.repository.TicketPricingRepository;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Nghiệp vụ lịch chiếu, sơ đồ ghế và cấu hình giá vé. */
@Service
public class ShowtimeService {
    private final ShowtimeRepository showtimes;
    private final MovieRepository movies;
    private final RoomRepository rooms;
    private final CinemaRepository cinemas;
    private final BookingRepository bookings;
    private final SeatRepository seats;
    private final SeatAllocationRepository allocations;
    private final TicketPricingRepository pricing;
    private final ZoneId businessZone;

    public ShowtimeService(ShowtimeRepository showtimes, MovieRepository movies, RoomRepository rooms,
        CinemaRepository cinemas, BookingRepository bookings, SeatRepository seats, SeatAllocationRepository allocations,
        TicketPricingRepository pricing, @Value("${booking.time-zone:Asia/Ho_Chi_Minh}") String timeZone) {
        this.showtimes = showtimes;
        this.movies = movies;
        this.rooms = rooms;
        this.cinemas = cinemas;
        this.bookings = bookings;
        this.seats = seats;
        this.allocations = allocations;
        this.pricing = pricing;
        this.businessZone = ZoneId.of(timeZone);
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> searchShowtimes(ShowtimeSearchRequest query) {
        LocalDate day = parseOptionalDate(query.date());
        Instant from = day == null ? Instant.now() : day.atStartOfDay(businessZone).toInstant();
        Instant to = day == null ? null : day.plusDays(1).atStartOfDay(businessZone).toInstant();
        return showtimes.searchPublic(query.movieId(), query.cinemaId(), from, to,
            PageRequest.of(0, 1000, Sort.by(Sort.Direction.ASC, "startTime")))
            .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ShowtimeResponse> searchShowtimes(SearchRequest query) {
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(100, Math.max(1, query.size() == null ? 20 : query.size()));
        Instant from = query.from() == null || query.from().isBlank() ? null : parseOptionalDate(query.from()).atStartOfDay(businessZone).toInstant();
        Instant to = query.to() == null || query.to().isBlank() ? null : parseOptionalDate(query.to()).plusDays(1).atStartOfDay(businessZone).toInstant();
        Page<Showtime> found = showtimes.searchAdmin(query.movieId(), query.cinemaId(), from, to,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startTime")));
        return new PageResponse<>(found.getContent().stream().map(this::toResponse).toList(), found.getNumber(),
            found.getSize(), found.getTotalElements(), found.getTotalPages());
    }

    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtime(Long id) { return toResponse(findActiveShowtime(id)); }

    @Transactional(readOnly = true)
    public SeatMapResponse getSeatMap(Long id) {
        Showtime showtime = findActiveShowtime(id);
        if (!showtime.getStartTime().isAfter(Instant.now())) throw new BusinessException(HttpStatus.GONE, "SHOWTIME_STARTED", "Suất chiếu đã bắt đầu.");
        Room room = findRoom(showtime.getRoomId());
        List<Seat> roomSeats = seats.findByRoomIdAndActiveTrueOrderByRowLabelAscSeatNumberAsc(room.getId());
        List<SeatAllocation> currentAllocations = liveAllocations(showtime);
        Map<Long, SeatAllocation> allocationBySeat = new HashMap<>();
        currentAllocations.forEach(allocation -> allocationBySeat.put(allocation.getSeatId(), allocation));
        Map<Long, Booking> bookingsById = new HashMap<>();
        bookings.findAllById(currentAllocations.stream().map(SeatAllocation::getBookingId)
            .filter(java.util.Objects::nonNull).distinct().toList()).forEach(booking -> bookingsById.put(booking.getId(), booking));
        Map<SeatType, TicketPricing> priceByType = pricingMap();
        List<SeatResponse> result = new ArrayList<>();
        int available = 0;
        Instant now = Instant.now();
        for (Seat seat : roomSeats) {
            SeatAllocation allocation = allocationBySeat.get(seat.getId());
            String status = "AVAILABLE";
            if (allocation != null && allocation.getBookingId() != null) {
                Booking booking = bookingsById.get(allocation.getBookingId());
                status = booking != null && booking.getStatus() == BookingStatus.CONFIRMED ? "OCCUPIED" : "HELD";
            }
            else if (allocation != null && allocation.getExpiresAt() != null && allocation.getExpiresAt().isAfter(now)) status = "HELD";
            if (status.equals("AVAILABLE") && seat.getSeatType() != SeatType.AISLE) available++;
            String row = seat.getRowLabel();
            String label = row + seat.getSeatNumber();
            result.add(new SeatResponse(seat.getId(), row, seat.getSeatNumber(), label, seat.getSeatType().name(),
                calculatePrice(showtime, seat.getSeatType(), priceByType), status));
        }
        return new SeatMapResponse(showtime.getId(), room.getName(), room.getTotalRows(), room.getTotalColumns(), result);
    }

    @Transactional
    public ShowtimeResponse createShowtime(ShowtimeRequest request) {
        Showtime showtime = Showtime.create();
        apply(showtime, request, null);
        return toResponse(showtimes.saveAndFlush(showtime));
    }

    @Transactional
    public ShowtimeResponse updateShowtime(Long id, ShowtimeRequest request) {
        Showtime showtime = showtimes.findByIdForUpdate(id).orElseThrow(() ->
            new NotFoundException("SHOWTIME_NOT_FOUND", "Không tìm thấy suất chiếu."));
        if (allocations.existsByShowtimeId(id)) throw new BusinessException(HttpStatus.CONFLICT, "SHOWTIME_HAS_BOOKINGS",
            "Không thể sửa suất chiếu đã có ghế đang giữ hoặc vé đã đặt.");
        apply(showtime, request, id);
        return toResponse(showtimes.saveAndFlush(showtime));
    }

    @Transactional
    public MessageResponse deleteShowtime(Long id) {
        Showtime showtime = showtimes.findByIdForUpdate(id).orElseThrow(() ->
            new NotFoundException("SHOWTIME_NOT_FOUND", "Không tìm thấy suất chiếu."));
        if (allocations.existsByShowtimeId(id)) throw new BusinessException(HttpStatus.CONFLICT, "SHOWTIME_HAS_BOOKINGS",
            "Không thể hủy suất chiếu đang có ghế giữ hoặc vé đã bán.");
        showtime.setActive(false);
        showtimes.save(showtime);
        return new MessageResponse("Đã hủy suất chiếu.");
    }

    @Transactional(readOnly = true)
    public List<TicketPricingResponse> getPricing() {
        return pricing.findAll(Sort.by(Sort.Direction.ASC, "seatType")).stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<TicketPricingResponse> savePricing(List<TicketPricingResponse> request) {
        Set<SeatType> seen = new HashSet<>();
        Map<SeatType, TicketPricing> existing = pricingMap();
        List<TicketPricing> saved = new ArrayList<>();
        for (TicketPricingResponse item : request) {
            SeatType type = parseSeatType(item.seatType());
            if (type == SeatType.AISLE || !seen.add(type)) invalid("pricing", "Loại ghế không hợp lệ hoặc bị lặp.");
            validateAmount(item.basePrice());
            validateAmount(item.surcharge3D());
            validateAmount(item.surchargeIMAX());
            validateAmount(item.weekendSurcharge());
            TicketPricing row = existing.getOrDefault(type, TicketPricing.create(type));
            row.setBasePrice(item.basePrice());
            row.setSurcharge3D(item.surcharge3D());
            row.setSurchargeIMAX(item.surchargeIMAX());
            row.setWeekendSurcharge(item.weekendSurcharge());
            saved.add(row);
        }
        if (!seen.equals(Set.of(SeatType.STANDARD, SeatType.VIP, SeatType.COUPLE))) invalid("pricing", "Cần cấu hình đủ giá cho STANDARD, VIP và COUPLE.");
        return pricing.saveAllAndFlush(saved).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Long calculatePrice(Long showtimeId, String seatType) {
        Showtime showtime = findActiveShowtime(showtimeId);
        return calculatePrice(showtime, parseSeatType(seatType), pricingMap());
    }

    @Transactional(readOnly = true)
    public Boolean checkRoomConflict(ShowtimeRequest request) {
        Room room = findRoom(request.roomId());
        Movie movie = findMovie(request.movieId());
        Instant start = parseDateTime(request.startTime());
        Instant end = start.plusSeconds(movie.getDuration().longValue() * 60);
        return showtimes.countOverlaps(room.getId(), start, end, request.id()) > 0;
    }

    private void apply(Showtime target, ShowtimeRequest request, Long excludeId) {
        Movie movie = findMovie(request.movieId());
        if (movie.getStatus() == MovieStatus.STOPPED) invalid("movieId", "Không thể tạo suất cho phim đã ngừng chiếu.");
        Room room = rooms.findByIdForUpdate(request.roomId()).orElseThrow(() ->
            new NotFoundException("ROOM_NOT_FOUND", "Không tìm thấy phòng."));
        if (!room.isActive()) invalid("roomId", "Phòng chiếu đang ngừng hoạt động.");
        if (request.cinemaId() != null && !request.cinemaId().equals(room.getCinemaId())) invalid("cinemaId", "Phòng không thuộc rạp đã chọn.");
        Cinema cinema = cinemas.findById(room.getCinemaId()).orElseThrow(() -> new NotFoundException("CINEMA_NOT_FOUND", "Không tìm thấy rạp."));
        Instant start = parseDateTime(request.startTime());
        Instant end = start.plusSeconds(movie.getDuration().longValue() * 60);
        if (!start.isAfter(Instant.now())) invalid("startTime", "Suất chiếu phải ở thời điểm tương lai.");
        if (showtimes.countOverlaps(room.getId(), start, end, excludeId) > 0) {
            throw new BusinessException(HttpStatus.CONFLICT, "SHOWTIME_CONFLICT", "Thời gian suất chiếu bị trùng với lịch khác trong phòng.");
        }
        ShowFormat format;
        try { format = ShowFormat.fromCode(request.format()); }
        catch (RuntimeException ex) { invalid("format", "Định dạng chiếu không hợp lệ."); return; }
        SubtitleType subtitle;
        try { subtitle = SubtitleType.valueOf(request.subtitleType()); }
        catch (RuntimeException ex) { invalid("subtitleType", "Loại phụ đề không hợp lệ."); return; }
        validateAmount(request.basePrice());
        target.setMovieId(movie.getId());
        target.setRoomId(room.getId());
        target.setStartTime(start);
        target.setEndTime(end);
        target.setFormat(format);
        target.setSubtitleType(subtitle);
        target.setBasePrice(request.basePrice());
        target.setActive(true);
    }

    private long calculatePrice(Showtime showtime, SeatType seatType, Map<SeatType, TicketPricing> priceByType) {
        if (seatType == SeatType.AISLE) return 0L;
        TicketPricing standard = priceByType.get(SeatType.STANDARD);
        TicketPricing seat = priceByType.get(seatType);
        if (standard == null || seat == null) throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE,
            "PRICING_NOT_CONFIGURED", "Chưa cấu hình đủ giá vé.");
        long value = Math.addExact(showtime.getBasePrice(), seat.getBasePrice() - standard.getBasePrice());
        if (showtime.getFormat() == ShowFormat.THREE_D) value = Math.addExact(value, seat.getSurcharge3D());
        if (showtime.getFormat() == ShowFormat.IMAX) value = Math.addExact(value, seat.getSurchargeIMAX());
        DayOfWeek day = showtime.getStartTime().atZone(businessZone).getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) value = Math.addExact(value, seat.getWeekendSurcharge());
        if (value < 0) throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "INVALID_PRICING", "Cấu hình tạo giá vé âm.");
        return value;
    }

    private Map<SeatType, TicketPricing> pricingMap() {
        Map<SeatType, TicketPricing> result = new EnumMap<>(SeatType.class);
        pricing.findAll().forEach(item -> result.put(item.getSeatType(), item));
        return result;
    }
    private List<SeatAllocation> liveAllocations(Showtime showtime) {
        Instant now = Instant.now();
        List<SeatAllocation> found = allocations.findByShowtimeId(showtime.getId());
        List<Long> bookingIds = found.stream().map(SeatAllocation::getBookingId)
            .filter(java.util.Objects::nonNull).distinct().toList();
        Map<Long, Booking> bookingsById = new HashMap<>();
        bookings.findAllById(bookingIds).forEach(booking -> bookingsById.put(booking.getId(), booking));
        return found.stream().filter(allocation -> {
            if (allocation.getBookingId() == null) return allocation.getExpiresAt() != null && allocation.getExpiresAt().isAfter(now);
            Booking booking = bookingsById.get(allocation.getBookingId());
            return booking != null && (booking.getStatus() == BookingStatus.CONFIRMED
                || (booking.getStatus() == BookingStatus.PENDING && booking.getExpiresAt() != null && booking.getExpiresAt().isAfter(now)));
        }).toList();
    }
    private ShowtimeResponse toResponse(Showtime showtime) {
        Movie movie = findMovie(showtime.getMovieId());
        Room room = findRoom(showtime.getRoomId());
        Cinema cinema = cinemas.findById(room.getCinemaId()).orElseThrow(() -> new NotFoundException("CINEMA_NOT_FOUND", "Không tìm thấy rạp."));
        int total = Math.toIntExact(seats.countByRoomIdAndActiveTrueAndSeatTypeNot(room.getId(), SeatType.AISLE));
        long occupied = liveAllocations(showtime).size();
        int available = (int) Math.max(0, total - occupied);
        return new ShowtimeResponse(showtime.getId(), movie.getId(), movie.getTitle(), movie.getPosterUrl(), cinema.getId(),
            cinema.getName(), room.getId(), room.getName(), showtime.getStartTime().toString(), showtime.getEndTime().toString(),
            showtime.getStartTime().atZone(businessZone).toLocalDate().toString(), showtime.getFormat().getCode(),
            showtime.getSubtitleType().name(), showtime.getBasePrice(), available, total);
    }
    private TicketPricingResponse toResponse(TicketPricing item) {
        return new TicketPricingResponse(item.getId(), item.getSeatType().name(), item.getBasePrice(), item.getSurcharge3D(), item.getSurchargeIMAX(), item.getWeekendSurcharge());
    }
    private Showtime findShowtime(Long id) { return showtimes.findById(id).orElseThrow(() -> new NotFoundException("SHOWTIME_NOT_FOUND", "Không tìm thấy suất chiếu.")); }
    private Showtime findActiveShowtime(Long id) {
        Showtime found = findShowtime(id);
        if (!found.isActive()) throw new NotFoundException("SHOWTIME_NOT_FOUND", "Không tìm thấy suất chiếu.");
        return found;
    }
    private Movie findMovie(Long id) {
        if (id == null) invalid("movieId", "Cần chọn phim.");
        return movies.findById(id).orElseThrow(() -> new NotFoundException("MOVIE_NOT_FOUND", "Không tìm thấy phim."));
    }
    private Room findRoom(Long id) {
        if (id == null) invalid("roomId", "Cần chọn phòng.");
        return rooms.findById(id).orElseThrow(() -> new NotFoundException("ROOM_NOT_FOUND", "Không tìm thấy phòng."));
    }
    private Instant parseDateTime(String raw) {
        if (raw == null || raw.isBlank()) { invalid("startTime", "Cần chọn thời gian bắt đầu."); return null; }
        try { return Instant.parse(raw); }
        catch (DateTimeParseException ignored) { }
        try { return OffsetDateTime.parse(raw).toInstant(); }
        catch (DateTimeParseException ignored) { }
        try { return LocalDateTime.parse(raw).atZone(businessZone).toInstant(); }
        catch (DateTimeParseException ex) { invalid("startTime", "Thời gian phải theo ISO-8601 hoặc YYYY-MM-DDTHH:mm."); return null; }
    }
    private LocalDate parseOptionalDate(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try { return LocalDate.parse(raw); }
        catch (DateTimeParseException ex) { invalid("date", "Ngày phải theo định dạng YYYY-MM-DD."); return null; }
    }
    private SeatType parseSeatType(String raw) {
        try { return SeatType.valueOf(raw.toUpperCase(Locale.ROOT)); }
        catch (RuntimeException ex) { invalid("seatType", "Loại ghế không hợp lệ."); return null; }
    }
    private void validateAmount(Long amount) { if (amount == null || amount < 0) invalid("amount", "Số tiền phải là số nguyên không âm."); }
    private void invalid(String field, String message) { throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_SHOWTIME_" + field.toUpperCase(Locale.ROOT), message); }
}

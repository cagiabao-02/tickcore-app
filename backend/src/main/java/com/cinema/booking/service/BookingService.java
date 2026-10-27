package com.cinema.booking.service;

import com.cinema.booking.dto.request.BookingComboRequest;
import com.cinema.booking.dto.request.CreateBookingRequest;
import com.cinema.booking.dto.request.SearchRequest;
import com.cinema.booking.dto.response.BookingResponse;
import com.cinema.booking.dto.response.BookingResponseCombosItem;
import com.cinema.booking.dto.response.BookingResponseSeatsItem;
import com.cinema.booking.dto.response.PageResponse;
import com.cinema.booking.entity.Booking;
import com.cinema.booking.entity.BookingCombo;
import com.cinema.booking.entity.BookingSeat;
import com.cinema.booking.entity.BookingStatus;
import com.cinema.booking.entity.Combo;
import com.cinema.booking.entity.HoldStatus;
import com.cinema.booking.entity.Movie;
import com.cinema.booking.entity.Payment;
import com.cinema.booking.entity.PaymentStatus;
import com.cinema.booking.entity.Promotion;
import com.cinema.booking.entity.PromotionType;
import com.cinema.booking.entity.Room;
import com.cinema.booking.entity.Seat;
import com.cinema.booking.entity.SeatAllocation;
import com.cinema.booking.entity.SeatHold;
import com.cinema.booking.entity.SeatType;
import com.cinema.booking.entity.ShowFormat;
import com.cinema.booking.entity.Showtime;
import com.cinema.booking.entity.TicketPricing;
import com.cinema.booking.entity.User;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.BookingComboRepository;
import com.cinema.booking.repository.BookingRepository;
import com.cinema.booking.repository.BookingSeatRepository;
import com.cinema.booking.repository.CinemaRepository;
import com.cinema.booking.repository.ComboRepository;
import com.cinema.booking.repository.MovieRepository;
import com.cinema.booking.repository.PaymentRepository;
import com.cinema.booking.repository.PromotionRepository;
import com.cinema.booking.repository.RoomRepository;
import com.cinema.booking.repository.SeatAllocationRepository;
import com.cinema.booking.repository.SeatHoldRepository;
import com.cinema.booking.repository.SeatRepository;
import com.cinema.booking.repository.ShowtimeRepository;
import com.cinema.booking.repository.TicketPricingRepository;
import com.cinema.booking.repository.UserRepository;
import com.cinema.booking.util.CodeGenerator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Tạo đơn từ hold đã xác minh và xử lý check-in từng mã vé. */
@Service
public class BookingService {
    private final BookingRepository bookings;
    private final BookingSeatRepository bookingSeats;
    private final BookingComboRepository bookingCombos;
    private final SeatHoldRepository holds;
    private final SeatAllocationRepository allocations;
    private final SeatRepository seats;
    private final ShowtimeRepository showtimes;
    private final MovieRepository movies;
    private final RoomRepository rooms;
    private final CinemaRepository cinemas;
    private final ComboRepository combos;
    private final TicketPricingRepository ticketPricing;
    private final PromotionRepository promotions;
    private final PaymentRepository payments;
    private final UserRepository users;
    private final CodeGenerator codeGenerator;
    private final ZoneId businessZone;

    public BookingService(BookingRepository bookings, BookingSeatRepository bookingSeats,
        BookingComboRepository bookingCombos, SeatHoldRepository holds,
        SeatAllocationRepository allocations, SeatRepository seats, ShowtimeRepository showtimes,
        MovieRepository movies, RoomRepository rooms, CinemaRepository cinemas,
        ComboRepository combos, TicketPricingRepository ticketPricing,
        PromotionRepository promotions, PaymentRepository payments, UserRepository users,
        CodeGenerator codeGenerator, @Value("${booking.time-zone:Asia/Ho_Chi_Minh}") String businessTimeZone) {
        this.bookings = bookings;
        this.bookingSeats = bookingSeats;
        this.bookingCombos = bookingCombos;
        this.holds = holds;
        this.allocations = allocations;
        this.seats = seats;
        this.showtimes = showtimes;
        this.movies = movies;
        this.rooms = rooms;
        this.cinemas = cinemas;
        this.combos = combos;
        this.ticketPricing = ticketPricing;
        this.promotions = promotions;
        this.payments = payments;
        this.users = users;
        this.codeGenerator = codeGenerator;
        this.businessZone = ZoneId.of(businessTimeZone);
    }

    /** Kiểm tra quyền sở hữu hold, chốt giá ở server rồi chuyển allocation sang đơn chờ. */
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        User user = currentUser();
        Instant now = Instant.now();
        SeatHold hold = holds.findByIdForUpdate(request.holdId())
            .orElseThrow(() -> new BusinessException(HttpStatus.GONE, "HOLD_EXPIRED", "Thời gian giữ ghế đã hết."));
        if (!hold.getUserId().equals(user.getId())) {
            throw new NotFoundException("HOLD_NOT_FOUND", "Không tìm thấy lượt giữ ghế.");
        }
        if (!hold.getShowtimeId().equals(request.showtimeId())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_SHOWTIME", "Suất chiếu không khớp với hold.");
        }
        if (hold.getStatus() != HoldStatus.ACTIVE || !hold.getExpiresAt().isAfter(now)) {
            throw new BusinessException(HttpStatus.GONE, "HOLD_EXPIRED", "Thời gian giữ ghế đã hết.");
        }
        if (bookings.findByHoldId(hold.getId()).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "HOLD_ALREADY_BOOKED", "Hold này đã được dùng tạo đơn.");
        }

        Showtime showtime = showtimes.findById(hold.getShowtimeId())
            .orElseThrow(() -> new NotFoundException("SHOWTIME_NOT_FOUND", "Không tìm thấy suất chiếu."));
        if (!showtime.isActive() || !showtime.getStartTime().isAfter(now)) {
            throw new BusinessException(HttpStatus.CONFLICT, "SHOWTIME_UNAVAILABLE", "Suất chiếu không còn nhận đặt vé.");
        }
        List<SeatAllocation> heldAllocations = allocations.findByHoldIdOrderBySeatId(hold.getId());
        if (heldAllocations.isEmpty() || heldAllocations.size() > 8
            || heldAllocations.stream().anyMatch(allocation -> !allocation.getShowtimeId().equals(showtime.getId())
                || !allocation.getExpiresAt().isAfter(now))) {
            throw new BusinessException(HttpStatus.GONE, "HOLD_EXPIRED", "Ghế trong hold không còn khả dụng.");
        }

        List<Long> seatIds = heldAllocations.stream().map(SeatAllocation::getSeatId).toList();
        Map<Long, Seat> seatsById = new HashMap<>();
        seats.findAllById(seatIds).forEach(seat -> seatsById.put(seat.getId(), seat));
        if (seatsById.size() != seatIds.size() || seatsById.values().stream().anyMatch(seat ->
            !seat.isActive() || !seat.getRoomId().equals(showtime.getRoomId()) || seat.getSeatType() == SeatType.AISLE)) {
            throw new BusinessException(HttpStatus.CONFLICT, "SEAT_UNAVAILABLE", "Ghế trong hold không còn hợp lệ.");
        }

        Map<SeatType, TicketPricing> pricingByType = new HashMap<>();
        ticketPricing.findAll().forEach(price -> pricingByType.put(price.getSeatType(), price));
        TicketPricing standardPricing = pricingByType.get(SeatType.STANDARD);
        if (standardPricing == null) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "PRICING_NOT_CONFIGURED",
                "Chưa cấu hình giá vé ghế thường.");
        }
        Instant showtimeStart = showtime.getStartTime();
        DayOfWeek showDay = showtimeStart.atZone(businessZone).getDayOfWeek();
        boolean weekend = showDay == DayOfWeek.SATURDAY || showDay == DayOfWeek.SUNDAY;
        Map<Long, Long> pricesBySeatId = new HashMap<>();
        long seatTotal = 0L;
        for (Seat seat : seatsById.values()) {
            TicketPricing pricing = pricingByType.get(seat.getSeatType());
            if (pricing == null) {
                throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "PRICING_NOT_CONFIGURED",
                    "Chưa cấu hình đủ giá cho loại ghế " + seat.getSeatType() + ".");
            }
            long price = Math.addExact(showtime.getBasePrice(),
                pricing.getBasePrice() - standardPricing.getBasePrice());
            if (showtime.getFormat() == ShowFormat.THREE_D) price = Math.addExact(price, pricing.getSurcharge3D());
            if (showtime.getFormat() == ShowFormat.IMAX) price = Math.addExact(price, pricing.getSurchargeIMAX());
            if (weekend) price = Math.addExact(price, pricing.getWeekendSurcharge());
            if (price < 0) {
                throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "INVALID_PRICING",
                    "Cấu hình giá vé tạo ra giá âm.");
            }
            pricesBySeatId.put(seat.getId(), price);
            seatTotal = Math.addExact(seatTotal, price);
        }

        List<BookingComboRequest> requestedCombos = request.combos() == null ? List.of() : request.combos();
        if (requestedCombos.stream().map(BookingComboRequest::comboId).distinct().count() != requestedCombos.size()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_COMBOS", "Không gửi lặp cùng một combo.");
        }
        Map<Long, Combo> activeCombos = new HashMap<>();
        if (!requestedCombos.isEmpty()) {
            combos.findActiveByIdsForUpdate(requestedCombos.stream().map(BookingComboRequest::comboId).toList())
                .forEach(combo -> activeCombos.put(combo.getId(), combo));
        }
        List<BookingCombo> comboSnapshots = new ArrayList<>();
        long comboTotal = 0L;
        for (BookingComboRequest item : requestedCombos) {
            Combo combo = activeCombos.get(item.comboId());
            if (combo == null || item.quantity() == null || item.quantity() < 1 || item.quantity() > 20) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_COMBOS", "Combo hoặc số lượng không hợp lệ.");
            }
            comboTotal = Math.addExact(comboTotal, Math.multiplyExact(combo.getPrice(), item.quantity().longValue()));
        }
        long subtotal = Math.addExact(seatTotal, comboTotal);
        String promoCode = request.promoCode() == null || request.promoCode().isBlank()
            ? null : request.promoCode().trim().toUpperCase(Locale.ROOT);
        Promotion promotion = promoCode == null ? null : lockAndValidatePromotion(promoCode, subtotal);
        long discount = promotion == null ? 0L : calculateDiscount(promotion, subtotal);
        long total = subtotal - discount;

        Movie movie = movies.findById(showtime.getMovieId())
            .orElseThrow(() -> new NotFoundException("MOVIE_NOT_FOUND", "Không tìm thấy phim."));
        Room room = rooms.findById(showtime.getRoomId())
            .orElseThrow(() -> new NotFoundException("ROOM_NOT_FOUND", "Không tìm thấy phòng chiếu."));
        var cinema = cinemas.findById(room.getCinemaId())
            .orElseThrow(() -> new NotFoundException("CINEMA_NOT_FOUND", "Không tìm thấy rạp."));
        if (showtime.getEndTime() == null || !showtime.getEndTime().isAfter(showtimeStart)) {
            throw new BusinessException(HttpStatus.CONFLICT, "INVALID_SHOWTIME", "Thời gian suất chiếu không hợp lệ.");
        }

        Booking booking = bookings.saveAndFlush(new Booking(codeGenerator.generateBookingCode(), user.getId(),
            showtime.getId(), hold.getId(), movie.getTitle(), movie.getPosterUrl(), cinema.getName(), room.getName(),
            showtimeStart, showtime.getEndTime(), showtime.getFormat().getCode(),
            promotion == null ? null : promotion.getId(), subtotal, discount, total,
            promoCode, hold.getExpiresAt()));

        List<BookingSeat> ticketRows = new ArrayList<>();
        for (SeatAllocation allocation : heldAllocations) {
            Seat seat = seatsById.get(allocation.getSeatId());
            String label = seat.getRowLabel() + seat.getSeatNumber();
            ticketRows.add(new BookingSeat(booking.getId(), seat.getId(), label,
                seat.getSeatType().name(), pricesBySeatId.get(seat.getId()), codeGenerator.generateTicketCode()));
            allocation.setHoldId(null);
            allocation.setBookingId(booking.getId());
            allocation.setExpiresAt(null);
        }
        bookingSeats.saveAllAndFlush(ticketRows);
        allocations.saveAllAndFlush(heldAllocations);
        hold.setStatus(HoldStatus.CONVERTED);
        holds.save(hold);
        for (BookingComboRequest item : requestedCombos) {
            Combo combo = activeCombos.get(item.comboId());
            comboSnapshots.add(new BookingCombo(booking.getId(), combo.getId(), combo.getName(), item.quantity(), combo.getPrice()));
        }
        bookingCombos.saveAll(comboSnapshots);
        if (promotion != null) promotion.setUsedCount(promotion.getUsedCount() + 1);
        return toResponse(booking, null);
    }

    /** USER: lấy một đơn nếu thuộc tài khoản hiện tại. */
    @Transactional(readOnly = true)
    public BookingResponse getBookingDetail(Long id) {
        User user = currentUser();
        Booking booking = bookings.findById(id)
            .orElseThrow(() -> new NotFoundException("BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt vé."));
        if (!booking.getUserId().equals(user.getId())) {
            throw new NotFoundException("BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt vé.");
        }
        return toResponse(booking, null);
    }

    /** ADMIN: khóa vé, chỉ check-in vé thuộc đơn đã thanh toán và từ chối quét lặp. */
    @Transactional
    public BookingResponse checkInTicket(String ticketCode) {
        String normalizedCode = ticketCode == null ? "" : ticketCode.trim();
        BookingSeat ticketSnapshot = bookingSeats.findByTicketCode(normalizedCode)
            .orElseThrow(() -> new NotFoundException("TICKET_NOT_FOUND", "Không tìm thấy vé."));
        // Lock the aggregate first, matching cancellation; then lock the ticket row.
        Booking booking = bookings.findByIdForUpdate(ticketSnapshot.getBookingId())
            .orElseThrow(() -> new NotFoundException("BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt vé."));
        BookingSeat ticket = bookingSeats.findByTicketCodeForUpdate(normalizedCode)
            .orElseThrow(() -> new NotFoundException("TICKET_NOT_FOUND", "Không tìm thấy vé."));
        if (ticket.getCheckedInAt() != null) {
            User scanner = ticket.getCheckedInByUserId() == null ? null : users.findById(ticket.getCheckedInByUserId()).orElse(null);
            String scannerName = scanner == null ? "không rõ" : scanner.getFullName();
            throw new BusinessException(HttpStatus.CONFLICT, "TICKET_ALREADY_CHECKED_IN",
                "Vé đã được quét lúc " + ticket.getCheckedInAt() + " bởi " + scannerName + ".",
                Map.of("checkedInAt", ticket.getCheckedInAt().toString(), "checkedInBy", scannerName));
        }
        if (booking.getStatus() != BookingStatus.CONFIRMED
            || !payments.existsByBookingIdAndStatus(booking.getId(), PaymentStatus.SUCCESS)) {
            throw new BusinessException(HttpStatus.CONFLICT, "TICKET_NOT_VALID",
                "Vé chưa được thanh toán hoặc đơn không còn hiệu lực.");
        }
        User scanner = currentUser();
        ticket.setCheckedInAt(Instant.now());
        ticket.setCheckedInByUserId(scanner.getId());
        bookingSeats.save(ticket);
        return toResponse(booking, ticket);
    }

    private Promotion lockAndValidatePromotion(String code, long subtotal) {
        Promotion promotion = promotions.findByCodeForUpdate(code)
            .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_PROMOTION", "Mã giảm giá không hợp lệ."));
        Instant now = Instant.now();
        if (!promotion.isActive() || now.isBefore(promotion.getStartsAt()) || now.isAfter(promotion.getEndsAt())
            || subtotal < promotion.getMinOrderAmount()
            || (promotion.getUsageLimit() != null && promotion.getUsedCount() >= promotion.getUsageLimit())
            || (promotion.getType() == PromotionType.PERCENTAGE && promotion.getValue() > 100)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_PROMOTION",
                "Mã giảm giá đã hết hạn, hết lượt hoặc đơn chưa đạt điều kiện.");
        }
        return promotion;
    }

    private long calculateDiscount(Promotion promotion, long subtotal) {
        long discount = promotion.getType() == PromotionType.PERCENTAGE
            ? BigDecimal.valueOf(subtotal).multiply(BigDecimal.valueOf(promotion.getValue()))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN).longValueExact()
            : promotion.getValue().longValue();
        if (promotion.getMaxDiscount() != null) discount = Math.min(discount, promotion.getMaxDiscount());
        return Math.min(discount, subtotal);
    }

    private BookingResponse toResponse(Booking booking, BookingSeat scannedTicket) {
        Showtime showtime = showtimes.findById(booking.getShowtimeId())
            .orElseThrow(() -> new NotFoundException("SHOWTIME_NOT_FOUND", "Không tìm thấy suất chiếu."));
        List<BookingSeat> tickets = bookingSeats.findByBookingIdOrderById(booking.getId());
        List<BookingCombo> bookingComboRows = bookingCombos.findByBookingIdOrderById(booking.getId());
        List<Payment> paymentRows = payments.findByBookingIdOrderByCreatedAtDescIdDesc(booking.getId());
        Payment latestPayment = paymentRows.isEmpty() ? null : paymentRows.getFirst();
        boolean ticketsIssued = booking.getStatus() == BookingStatus.CONFIRMED
            && paymentRows.stream().anyMatch(payment -> payment.getStatus() == PaymentStatus.SUCCESS);
        BookingSeat checkin = scannedTicket != null ? scannedTicket
            : tickets.stream().filter(ticket -> ticket.getCheckedInAt() != null).findFirst().orElse(null);
        String checkedInBy = null;
        if (checkin != null && checkin.getCheckedInByUserId() != null) {
            checkedInBy = users.findById(checkin.getCheckedInByUserId()).map(User::getFullName).orElse(null);
        }
        return new BookingResponse(booking.getId(), booking.getBookingCode(), booking.getUserId(), showtime.getMovieId(), booking.getShowtimeId(),
            booking.getMovieTitle(), booking.getMoviePosterUrl(), booking.getCinemaName(), booking.getRoomName(),
            booking.getShowtimeStart().toString(), booking.getShowtimeStart().atZone(businessZone).toLocalDate().toString(),
            booking.getFormat(), tickets.stream().map(ticket -> new BookingResponseSeatsItem(ticket.getSeatLabel(),
                ticket.getSeatType(), ticket.getPrice(), ticketsIssued ? ticket.getTicketCode() : null,
                ticket.getCheckedInAt() == null ? null : ticket.getCheckedInAt().toString(),
                ticket.getCheckedInByUserId() == null ? null : users.findById(ticket.getCheckedInByUserId())
                    .map(User::getFullName).orElse(null))).toList(),
            bookingComboRows.stream().map(combo -> new BookingResponseCombosItem(combo.getComboName(),
                combo.getQuantity(), combo.getUnitPrice())).toList(),
            booking.getSubtotal(), booking.getDiscount(), booking.getPromoCode(), booking.getTotalAmount(),
            latestPayment == null ? null : latestPayment.getMethod().name(),
            latestPayment == null ? PaymentStatus.PENDING.name() : latestPayment.getStatus().name(),
            booking.getStatus().name(), booking.getCreatedAt().toString(),
            ticketsIssued && !tickets.isEmpty() ? tickets.getFirst().getTicketCode() : null,
            booking.getExpiresAt() == null ? null : booking.getExpiresAt().toString(),
            checkin == null ? null : checkin.getCheckedInAt().toString(), checkedInBy);
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Cần đăng nhập để tiếp tục.");
        }
        return users.findByEmailIgnoreCase(authentication.getName())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED",
                "Phiên đăng nhập không hợp lệ."));
    }

    /** USER: phân trang đơn của mình và hỗ trợ các tab vé hiện có ở frontend. */
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getMyBookings(SearchRequest query) {
        User user = currentUser();
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(100, Math.max(1, query.size() == null ? 10 : query.size()));
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Instant now = Instant.now();
        Page<Booking> result = switch (query.status() == null ? "" : query.status().toUpperCase(Locale.ROOT)) {
            case "UPCOMING" -> bookings.findByUserIdAndStatusAndShowtimeStartAfter(
                user.getId(), BookingStatus.CONFIRMED, now, pageable);
            case "WATCHED" -> bookings.findByUserIdAndStatusAndShowtimeStartLessThanEqual(
                user.getId(), BookingStatus.CONFIRMED, now, pageable);
            case "CANCELLED" -> bookings.findByUserIdAndStatus(user.getId(), BookingStatus.CANCELLED, pageable);
            default -> bookings.findByUserId(user.getId(), pageable);
        };
        return new PageResponse<>(result.getContent().stream().map(booking -> toResponse(booking, null)).toList(),
            result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    /** USER: hủy đơn của mình; vé đã xác nhận cần còn hơn hai giờ trước suất chiếu. */
    @Transactional
    public BookingResponse cancelBooking(Long id) {
        User user = currentUser();
        Booking booking = findBookingForUpdate(id);
        if (!booking.getUserId().equals(user.getId())) {
            throw new NotFoundException("BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt vé.");
        }
        return cancel(booking, false);
    }

    /** ADMIN: tìm kiếm đơn theo trạng thái và phân trang. */
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> searchBookings(SearchRequest query) {
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(100, Math.max(1, query.size() == null ? 20 : query.size()));
        BookingStatus status = parseBookingStatus(query.status());
        Instant from = parseStartDate(query.from());
        Instant to = parseEndDateExclusive(query.to());
        if (from != null && to != null && !to.isAfter(from)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE", "Ngày kết thúc không được trước ngày bắt đầu.");
        }
        String keyword = query.keyword() == null || query.keyword().isBlank() ? null : query.keyword().trim();
        Page<Booking> result = bookings.searchAdmin(status, query.movieId(), query.cinemaId(), from, to, keyword,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return new PageResponse<>(result.getContent().stream().map(booking -> toResponse(booking, null)).toList(),
            result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    /** ADMIN: hủy đơn và giải phóng ghế; lịch sử đơn vẫn được lưu. */
    @Transactional
    public BookingResponse cancelBookingAsAdmin(Long id) {
        return cancel(findBookingForUpdate(id), true);
    }

    /** Đánh dấu hết hạn và giải phóng ghế/khuyến mãi đã được giữ cho đơn chờ. */
    @Transactional
    public void expirePendingBookings() {
        Instant now = Instant.now();
        List<Booking> expired = bookings.findPendingExpiredForUpdate(BookingStatus.PENDING, now,
            PageRequest.of(0, 200));
        for (Booking booking : expired) {
            if (booking.getStatus() != BookingStatus.PENDING || booking.getExpiresAt() == null
                || booking.getExpiresAt().isAfter(now)) continue;
            booking.setStatus(BookingStatus.EXPIRED);
            allocations.deleteByBookingId(booking.getId());
            releasePromotionReservation(booking);
        }
        bookings.saveAll(expired);
    }

    private BookingResponse cancel(Booking booking, boolean administrator) {
        if (booking.getStatus() == BookingStatus.CANCELLED) return toResponse(booking, null);
        if (booking.getStatus() == BookingStatus.EXPIRED) {
            throw new BusinessException(HttpStatus.CONFLICT, "BOOKING_EXPIRED", "Đơn đã hết hạn.");
        }
        if (bookingSeats.existsByBookingIdAndCheckedInAtIsNotNull(booking.getId())) {
            throw new BusinessException(HttpStatus.CONFLICT, "BOOKING_ALREADY_CHECKED_IN",
                "Không thể hủy đơn đã có vé được check-in.");
        }
        if (booking.getStatus() == BookingStatus.CONFIRMED && !administrator
            && !Instant.now().isBefore(booking.getShowtimeStart().minus(Duration.ofHours(2)))) {
            throw new BusinessException(HttpStatus.CONFLICT, "CANCEL_TOO_LATE",
                "Chỉ có thể hủy vé trước giờ chiếu hơn hai tiếng.");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setExpiresAt(null);
        allocations.deleteByBookingId(booking.getId());
        releasePromotionReservation(booking);
        return toResponse(bookings.saveAndFlush(booking), null);
    }

    private void releasePromotionReservation(Booking booking) {
        if (booking.getPromotionId() == null) return;
        promotions.findByIdForUpdate(booking.getPromotionId()).ifPresent(promotion -> {
            if (promotion.getUsedCount() > 0) promotion.setUsedCount(promotion.getUsedCount() - 1);
        });
    }

    private Booking findBookingForUpdate(Long id) {
        return bookings.findByIdForUpdate(id)
            .orElseThrow(() -> new NotFoundException("BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt vé."));
    }

    private BookingStatus parseBookingStatus(String value) {
        if (value == null || value.isBlank() || "ALL".equalsIgnoreCase(value)) return null;
        try { return BookingStatus.valueOf(value.trim().toUpperCase(Locale.ROOT)); }
        catch (IllegalArgumentException ex) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_BOOKING_STATUS", "Trạng thái booking không hợp lệ.");
        }
    }

    private Instant parseStartDate(String value) {
        if (value == null || value.isBlank()) return null;
        try { return LocalDate.parse(value).atStartOfDay(businessZone).toInstant(); }
        catch (DateTimeParseException ex) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_DATE", "Ngày phải theo định dạng YYYY-MM-DD.");
        }
    }

    private Instant parseEndDateExclusive(String value) {
        if (value == null || value.isBlank()) return null;
        try { return LocalDate.parse(value).plusDays(1).atStartOfDay(businessZone).toInstant(); }
        catch (DateTimeParseException ex) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_DATE", "Ngày phải theo định dạng YYYY-MM-DD.");
        }
    }
}

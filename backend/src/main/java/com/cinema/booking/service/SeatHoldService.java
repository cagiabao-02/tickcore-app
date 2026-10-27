package com.cinema.booking.service;

import com.cinema.booking.dto.request.SeatHoldRequest;
import com.cinema.booking.dto.response.MessageResponse;
import com.cinema.booking.dto.response.SeatHoldResponse;
import com.cinema.booking.entity.HoldStatus;
import com.cinema.booking.entity.Room;
import com.cinema.booking.entity.Seat;
import com.cinema.booking.entity.SeatAllocation;
import com.cinema.booking.entity.SeatHold;
import com.cinema.booking.entity.SeatType;
import com.cinema.booking.entity.Showtime;
import com.cinema.booking.entity.User;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.SeatAllocationRepository;
import com.cinema.booking.repository.SeatHoldRepository;
import com.cinema.booking.repository.SeatRepository;
import com.cinema.booking.repository.RoomRepository;
import com.cinema.booking.repository.ShowtimeRepository;
import com.cinema.booking.repository.UserRepository;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Quản lý hold ghế bằng khóa hàng và unique allocation dùng chung với booking. */
@Service
public class SeatHoldService {

    private final SeatHoldRepository holds;
    private final SeatAllocationRepository allocations;
    private final SeatRepository seats;
    private final RoomRepository rooms;
    private final ShowtimeRepository showtimes;
    private final UserRepository users;
    private final long holdDurationSeconds;

    public SeatHoldService(SeatHoldRepository holds, SeatAllocationRepository allocations,
        SeatRepository seats, RoomRepository rooms, ShowtimeRepository showtimes, UserRepository users,
        @Value("${booking.hold-duration-seconds:600}") long holdDurationSeconds) {
        this.holds = holds;
        this.allocations = allocations;
        this.seats = seats;
        this.rooms = rooms;
        this.showtimes = showtimes;
        this.users = users;
        if (holdDurationSeconds < 1) {
            throw new IllegalArgumentException("BOOKING_HOLD_DURATION_SECONDS phải lớn hơn 0.");
        }
        this.holdDurationSeconds = holdDurationSeconds;
    }

    /** Giữ tối đa tám ghế trong thời hạn cấu hình và trả thời điểm hết hạn ISO-8601. */
    @Transactional
    public SeatHoldResponse holdSeats(Long showtimeId, SeatHoldRequest request) {
        List<Long> seatIds = request.seatIds();
        if (seatIds == null || seatIds.isEmpty() || seatIds.size() > 8
            || new HashSet<>(seatIds).size() != seatIds.size()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_SEAT_SELECTION",
                "Chọn từ 1 đến 8 ghế khác nhau.");
        }

        Instant now = Instant.now();
        User user = currentUser();
        Showtime showtime = showtimes.findByIdForUpdate(showtimeId)
            .orElseThrow(() -> new NotFoundException("SHOWTIME_NOT_FOUND", "Không tìm thấy suất chiếu."));
        if (!showtime.isActive() || !showtime.getStartTime().isAfter(now)) {
            throw new BusinessException(HttpStatus.CONFLICT, "SHOWTIME_UNAVAILABLE",
                "Suất chiếu không còn nhận đặt vé.");
        }

        // Khóa theo thứ tự suất -> phòng -> ghế để đồng bộ với thao tác sửa sơ đồ.
        Room room = rooms.findByIdForUpdate(showtime.getRoomId())
            .orElseThrow(() -> new NotFoundException("ROOM_NOT_FOUND", "Không tìm thấy phòng chiếu."));
        if (!room.isActive()) {
            throw new BusinessException(HttpStatus.CONFLICT, "SHOWTIME_UNAVAILABLE",
                "Phòng chiếu đang ngừng hoạt động.");
        }
        List<Seat> selectedSeats = seats.findAllByIdForUpdate(seatIds);
        if (selectedSeats.size() != seatIds.size()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "SEAT_NOT_FOUND",
                "Một hoặc nhiều ghế không tồn tại.");
        }
        boolean invalidSeat = selectedSeats.stream().anyMatch(seat ->
            !seat.isActive() || !seat.getRoomId().equals(showtime.getRoomId())
                || seat.getSeatType() == SeatType.AISLE);
        if (invalidSeat) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "SEAT_NOT_BOOKABLE",
                "Ghế không thuộc phòng chiếu hoặc không thể đặt.");
        }

        allocations.deleteExpiredForSeats(showtimeId, seatIds, now);
        if (seatIds.stream().anyMatch(seatId ->
            allocations.existsByShowtimeIdAndSeatId(showtimeId, seatId))) {
            throw new BusinessException(HttpStatus.CONFLICT, "SEAT_UNAVAILABLE",
                "Một hoặc nhiều ghế vừa được người khác giữ hoặc đặt.");
        }

        Instant holdExpiresAt = now.plusSeconds(holdDurationSeconds);
        if (showtime.getStartTime().isBefore(holdExpiresAt)) holdExpiresAt = showtime.getStartTime();
        final Instant expiresAt = holdExpiresAt;
        SeatHold hold = new SeatHold(user.getId(), showtimeId, expiresAt);
        hold = holds.saveAndFlush(hold);
        Long holdId = hold.getId();
        List<SeatAllocation> newAllocations = seatIds.stream().map(seatId -> {
            return new SeatAllocation(showtimeId, seatId, holdId, expiresAt);
        }).toList();
        try {
            allocations.saveAllAndFlush(newAllocations);
        } catch (DataIntegrityViolationException exception) {
            // Unique(showtime_id, seat_id) is the final guard if a concurrent request wins the race.
            throw new BusinessException(HttpStatus.CONFLICT, "SEAT_UNAVAILABLE",
                "Một hoặc nhiều ghế vừa được người khác giữ hoặc đặt.");
        }
        return new SeatHoldResponse(holdId, showtimeId, seatIds, expiresAt.toString());
    }

    /** Chỉ chủ hold được nhả ghế; gọi lặp vẫn trả kết quả thành công. */
    @Transactional
    public MessageResponse releaseHold(Long holdId) {
        User user = currentUser();
        SeatHold hold = holds.findByIdForUpdate(holdId)
            .orElseThrow(() -> new NotFoundException("HOLD_NOT_FOUND", "Không tìm thấy lượt giữ ghế."));
        if (!hold.getUserId().equals(user.getId())) {
            throw new NotFoundException("HOLD_NOT_FOUND", "Không tìm thấy lượt giữ ghế.");
        }
        if (hold.getStatus() == HoldStatus.ACTIVE) {
            hold.setStatus(hold.getExpiresAt().isAfter(Instant.now())
                ? HoldStatus.RELEASED : HoldStatus.EXPIRED);
            allocations.deleteByHoldId(holdId);
        } else if (hold.getStatus() == HoldStatus.CONVERTED) {
            throw new BusinessException(HttpStatus.CONFLICT, "HOLD_ALREADY_BOOKED",
                "Ghế đã được chuyển thành đơn đặt vé.");
        }
        return new MessageResponse("Đã giải phóng ghế.");
    }

    /** Dọn các allocation hết hạn và đánh dấu lịch sử hold tương ứng. */
    @Transactional
    public void releaseExpiredHolds() {
        Instant now = Instant.now();
        List<SeatHold> expiredHolds = holds.findExpiredForUpdate(HoldStatus.ACTIVE, now, PageRequest.of(0, 200));
        for (SeatHold hold : expiredHolds) {
            // Booking/release cũng khóa hold trước khi chuyển hoặc xóa allocation.
            if (hold.getStatus() == HoldStatus.ACTIVE && !hold.getExpiresAt().isAfter(now)) {
                allocations.deleteByHoldId(hold.getId());
                hold.setStatus(HoldStatus.EXPIRED);
            }
        }
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
}

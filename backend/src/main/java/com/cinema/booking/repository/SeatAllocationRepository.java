package com.cinema.booking.repository;

import com.cinema.booking.entity.SeatAllocation;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Bảo đảm một phân bổ ghế duy nhất trên mỗi suất và giải phóng hold đã hết hạn. */
public interface SeatAllocationRepository extends JpaRepository<SeatAllocation, Long> {
    boolean existsBySeatId(Long seatId);
    boolean existsByShowtimeId(Long showtimeId);
    boolean existsByShowtimeIdAndSeatId(Long showtimeId, Long seatId);

    List<SeatAllocation> findByHoldId(Long holdId);

    List<SeatAllocation> findByHoldIdOrderBySeatId(Long holdId);

    List<SeatAllocation> findByShowtimeId(Long showtimeId);

    @Modifying
    @Query("delete from SeatAllocation allocation where allocation.holdId = :holdId")
    int deleteByHoldId(@Param("holdId") Long holdId);

    @Modifying
    @Query("delete from SeatAllocation allocation where allocation.bookingId = :bookingId")
    int deleteByBookingId(@Param("bookingId") Long bookingId);

    @Modifying
    @Query("delete from SeatAllocation allocation where allocation.showtimeId = :showtimeId " +
        "and allocation.seatId in :seatIds and allocation.holdId is not null " +
        "and allocation.expiresAt <= :now")
    int deleteExpiredForSeats(@Param("showtimeId") Long showtimeId,
        @Param("seatIds") Collection<Long> seatIds, @Param("now") Instant now);
}

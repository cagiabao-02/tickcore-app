package com.cinema.booking.repository;

import com.cinema.booking.entity.Booking;
import com.cinema.booking.entity.BookingStatus;
import java.time.Instant;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Tìm đơn theo chủ sở hữu và khóa đơn trong thao tác thanh toán/hủy/check-in. */
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByHoldId(Long holdId);
    boolean existsByPromotionId(Long promotionId);
    @Query("select count(booking) from Booking booking, Showtime showtime where showtime.id = booking.showtimeId " +
        "and booking.userId = :userId and showtime.movieId = :movieId and booking.status = :status and showtime.startTime < :now")
    long countWatchedConfirmedByUserAndMovie(@Param("userId") Long userId, @Param("movieId") Long movieId,
        @Param("status") BookingStatus status, @Param("now") Instant now);
    Page<Booking> findByUserId(Long userId, Pageable pageable);
    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);
    Page<Booking> findByUserIdAndStatusAndShowtimeStartAfter(
        Long userId, BookingStatus status, Instant after, Pageable pageable
    );
    Page<Booking> findByUserIdAndStatusAndShowtimeStartLessThanEqual(
        Long userId, BookingStatus status, Instant before, Pageable pageable
    );
    List<Booking> findByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
        BookingStatus status, Instant from, Instant to
    );
    @Query("select booking from Booking booking, Showtime showtime where showtime.id = booking.showtimeId " +
        "and booking.status = :status and showtime.startTime >= :from and showtime.startTime < :to")
    List<Booking> findByStatusAndShowtimeRange(@Param("status") BookingStatus status,
        @Param("from") Instant from, @Param("to") Instant to);
    @Query("select booking from Booking booking, Showtime showtime, Room room, User user " +
        "where showtime.id = booking.showtimeId and room.id = showtime.roomId and user.id = booking.userId " +
        "and (:status is null or booking.status = :status) " +
        "and (:movieId is null or showtime.movieId = :movieId) " +
        "and (:cinemaId is null or room.cinemaId = :cinemaId) " +
        "and (:from is null or booking.createdAt >= :from) and (:to is null or booking.createdAt < :to) " +
        "and (:keyword is null or lower(booking.bookingCode) like lower(concat('%', :keyword, '%')) " +
        "or lower(booking.movieTitle) like lower(concat('%', :keyword, '%')) " +
        "or lower(user.fullName) like lower(concat('%', :keyword, '%')) " +
        "or lower(user.email) like lower(concat('%', :keyword, '%')))")
    Page<Booking> searchAdmin(@Param("status") BookingStatus status, @Param("movieId") Long movieId,
        @Param("cinemaId") Long cinemaId, @Param("from") Instant from, @Param("to") Instant to,
        @Param("keyword") String keyword, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select booking from Booking booking where booking.status = :status " +
        "and booking.expiresAt is not null and booking.expiresAt <= :now order by booking.expiresAt")
    List<Booking> findPendingExpiredForUpdate(@Param("status") BookingStatus status,
        @Param("now") Instant now, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select booking from Booking booking where booking.id = :id")
    Optional<Booking> findByIdForUpdate(@Param("id") Long id);
}

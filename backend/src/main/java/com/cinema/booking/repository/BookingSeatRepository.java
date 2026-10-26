package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.BookingSeat;
/** TODO: findByBookingId: ghế của đơn; findOccupiedByShowtimeId: ghế đã đặt của suất. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {}

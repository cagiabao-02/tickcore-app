package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.BookingCombo;
/** TODO: findByBookingId: combo và số lượng trong đơn. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface BookingComboRepository extends JpaRepository<BookingCombo, Long> {}

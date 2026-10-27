package com.cinema.booking.repository;

import com.cinema.booking.entity.BookingCombo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Combo snapshot được lưu trong đơn. */
public interface BookingComboRepository extends JpaRepository<BookingCombo, Long> {
    boolean existsByComboId(Long comboId);
    List<BookingCombo> findByBookingIdOrderById(Long bookingId);
}

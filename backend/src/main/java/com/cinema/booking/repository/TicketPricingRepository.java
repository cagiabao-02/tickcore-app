package com.cinema.booking.repository;

import com.cinema.booking.entity.SeatType;
import com.cinema.booking.entity.TicketPricing;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Đọc giá nền và phụ thu do admin quản lý. */
public interface TicketPricingRepository extends JpaRepository<TicketPricing, Long> {
    Optional<TicketPricing> findBySeatType(SeatType seatType);
}

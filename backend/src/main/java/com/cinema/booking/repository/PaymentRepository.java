package com.cinema.booking.repository;

import com.cinema.booking.entity.Payment;
import com.cinema.booking.entity.PaymentStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Các lần thử thanh toán của đơn; dùng SUCCESS để cấp quyền phát hành/check-in vé. */
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingIdOrderByCreatedAtDescIdDesc(Long bookingId);
    boolean existsByBookingIdAndStatus(Long bookingId, PaymentStatus status);
}

package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Payment;
/** TODO: findByBookingId: trạng thái thanh toán của đơn. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface PaymentRepository extends JpaRepository<Payment, Long> {}

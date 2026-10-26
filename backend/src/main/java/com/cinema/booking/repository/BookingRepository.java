package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Booking;
/** TODO: findByUserIdAndStatus: phân trang vé của người dùng; findPendingExpired: lấy đơn chờ hết hạn; searchBookings: bộ lọc admin. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface BookingRepository extends JpaRepository<Booking, Long> {}

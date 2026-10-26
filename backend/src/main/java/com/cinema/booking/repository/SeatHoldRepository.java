package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.SeatHold;
/** TODO: findByExpiresAtBefore: lấy hold hết hạn; findActiveByShowtimeAndSeats: kiểm tra giữ ghế cạnh tranh; findByUserId: kiểm tra chủ sở hữu. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface SeatHoldRepository extends JpaRepository<SeatHold, Long> {}

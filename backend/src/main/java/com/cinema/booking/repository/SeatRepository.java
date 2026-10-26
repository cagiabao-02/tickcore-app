package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Seat;
/** TODO: findByRoomId: lấy sơ đồ ghế; findByIdIn: xác minh nhóm ghế được chọn. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface SeatRepository extends JpaRepository<Seat, Long> {}

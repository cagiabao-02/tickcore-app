package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Room;
/** TODO: findByCinemaId: lấy phòng của rạp; existsByCinemaIdAndName: kiểm tra tên phòng trùng. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface RoomRepository extends JpaRepository<Room, Long> {}

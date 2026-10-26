package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Showtime;
/** TODO: searchShowtimes: lọc lịch theo ngày/rạp/phim; existsOverlappingSchedule: kiểm tra trùng giờ cùng phòng. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {}

package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Cinema;
/** TODO: findByCity: danh sách rạp theo thành phố. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface CinemaRepository extends JpaRepository<Cinema, Long> {}

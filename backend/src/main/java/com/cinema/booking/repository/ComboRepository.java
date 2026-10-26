package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Combo;
/** TODO: findByActiveTrue: combo đang bán. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface ComboRepository extends JpaRepository<Combo, Long> {}

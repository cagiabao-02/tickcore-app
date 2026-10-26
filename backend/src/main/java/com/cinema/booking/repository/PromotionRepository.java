package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Promotion;
/** TODO: findByCode: tìm mã giảm giá; findActiveWithinDateRange: lọc hiệu lực. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface PromotionRepository extends JpaRepository<Promotion, Long> {}

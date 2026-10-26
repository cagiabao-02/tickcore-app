package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Review;
/** TODO: findByMovieIdAndHiddenFalse: đánh giá công khai có phân trang; existsByUserIdAndMovieId: chặn đánh giá trùng. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface ReviewRepository extends JpaRepository<Review, Long> {}

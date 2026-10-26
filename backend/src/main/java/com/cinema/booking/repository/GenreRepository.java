package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Genre;
/** TODO: findBySlug: lấy thể loại theo slug; findAll: danh sách thể loại. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface GenreRepository extends JpaRepository<Genre, Long> {}

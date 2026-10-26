package com.cinema.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Movie;
/** TODO: searchMovies: lọc phim và phân trang; findByStatus: phim đang/sắp chiếu; findByGenresSlug: lọc thể loại. Chỉ ghi yêu cầu truy vấn, chưa khai báo phương thức hoặc @Query. */
public interface MovieRepository extends JpaRepository<Movie, Long> {}

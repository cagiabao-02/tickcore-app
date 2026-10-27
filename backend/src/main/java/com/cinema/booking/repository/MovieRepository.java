package com.cinema.booking.repository;

import com.cinema.booking.entity.Movie;
import com.cinema.booking.entity.MovieStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Truy vấn phim theo bộ lọc phía người dùng và quản trị. */
public interface MovieRepository extends JpaRepository<Movie, Long> {
    @Query("select distinct m from Movie m left join m.genres g where " +
        "(:status is null or m.status = :status) and " +
        "(:genre is null or g.slug = :genre) and " +
        "(:language is null or lower(m.language) = lower(:language)) and " +
        "(:ageRating is null or m.ageRating = :ageRating) and " +
        "(:keyword is null or lower(m.title) like lower(concat('%', :keyword, '%')) " +
        "or lower(coalesce(m.originalTitle, '')) like lower(concat('%', :keyword, '%')))")
    Page<Movie> search(@Param("status") MovieStatus status, @Param("genre") String genre,
        @Param("language") String language, @Param("ageRating") String ageRating,
        @Param("keyword") String keyword, Pageable pageable);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.movieId = :movieId and r.hidden = false")
    Double averageRating(@Param("movieId") Long movieId);

    @Query("select count(r) from Review r where r.movieId = :movieId and r.hidden = false")
    Integer reviewCount(@Param("movieId") Long movieId);
}

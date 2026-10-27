package com.cinema.booking.repository;

import com.cinema.booking.entity.Review;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByUserIdAndMovieId(Long userId, Long movieId);
    Page<Review> findByMovieIdAndHiddenFalse(Long movieId, Pageable pageable);
    @Query("select review from Review review where (:keyword is null or lower(coalesce(review.comment, '')) like lower(concat('%', :keyword, '%'))) " +
        "and (:movieId is null or review.movieId = :movieId) and (:hidden is null or review.hidden = :hidden)")
    Page<Review> searchAdmin(@Param("keyword") String keyword, @Param("movieId") Long movieId,
        @Param("hidden") Boolean hidden, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select review from Review review where review.id = :id")
    Optional<Review> findByIdForUpdate(@Param("id") Long id);
}

package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Đánh giá phim; quyền tạo đánh giá được xác minh qua vé đã chiếu ở service. */
@Entity @Table(name = "reviews") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "movie_id", nullable = false) private Long movieId;
    @Column(nullable = false) private Integer rating;
    @Column(length = 2000) private String comment;
    @Column(nullable = false) private boolean hidden;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    public static Review create(Long userId, Long movieId, Integer rating, String comment) {
        Review review = new Review();
        review.userId = userId;
        review.movieId = movieId;
        review.rating = rating;
        review.comment = comment;
        review.hidden = false;
        return review;
    }

    @PrePersist
    void onCreate() { Instant now = Instant.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    void onUpdate() { updatedAt = Instant.now(); }
}

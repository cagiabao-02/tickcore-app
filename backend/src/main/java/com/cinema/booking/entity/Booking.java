package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

/** Đơn hàng snapshot thông tin suất chiếu; chỉ chuyển CONFIRMED sau thanh toán hợp lệ. */
@Entity @Table(name = "bookings") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "booking_code", nullable = false, unique = true, length = 40) private String bookingCode;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "showtime_id", nullable = false) private Long showtimeId;
    @Column(name = "hold_id", unique = true) private Long holdId;
    @Column(name = "movie_title", nullable = false, length = 240) private String movieTitle;
    @Column(name = "movie_poster_url", length = 2048) private String moviePosterUrl;
    @Column(name = "cinema_name", nullable = false, length = 160) private String cinemaName;
    @Column(name = "room_name", nullable = false, length = 120) private String roomName;
    @Column(name = "showtime_start", nullable = false) private Instant showtimeStart;
    @Column(name = "showtime_end", nullable = false) private Instant showtimeEnd;
    @Column(nullable = false, length = 24) private String format;
    @Column(name = "promotion_id") private Long promotionId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private BookingStatus status = BookingStatus.PENDING;
    @Column(nullable = false) private Long subtotal;
    @Column(nullable = false) private Long discount = 0L;
    @Column(name = "total_amount", nullable = false) private Long totalAmount;
    @Column(name = "promo_code", length = 64) private String promoCode;
    @Column(name = "expires_at") private Instant expiresAt;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    public Booking(String bookingCode, Long userId, Long showtimeId, Long holdId, String movieTitle,
        String moviePosterUrl, String cinemaName, String roomName, Instant showtimeStart,
        Instant showtimeEnd, String format, Long promotionId, Long subtotal, Long discount,
        Long totalAmount, String promoCode, Instant expiresAt) {
        this.bookingCode = bookingCode;
        this.userId = userId;
        this.showtimeId = showtimeId;
        this.holdId = holdId;
        this.movieTitle = movieTitle;
        this.moviePosterUrl = moviePosterUrl;
        this.cinemaName = cinemaName;
        this.roomName = roomName;
        this.showtimeStart = showtimeStart;
        this.showtimeEnd = showtimeEnd;
        this.format = format;
        this.promotionId = promotionId;
        this.status = BookingStatus.PENDING;
        this.subtotal = subtotal;
        this.discount = discount;
        this.totalAmount = totalAmount;
        this.promoCode = promoCode;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void onCreate() { Instant now = Instant.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    void onUpdate() { updatedAt = Instant.now(); }
}

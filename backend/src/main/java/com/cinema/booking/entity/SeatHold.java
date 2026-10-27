package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Lịch sử một lần giữ ghế; ghế đang bị chiếm được khóa ở seat_allocations. */
@Entity @Table(name = "seat_holds") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SeatHold {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "showtime_id", nullable = false) private Long showtimeId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private HoldStatus status = HoldStatus.ACTIVE;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;

    public SeatHold(Long userId, Long showtimeId, Instant expiresAt) {
        this.userId = userId;
        this.showtimeId = showtimeId;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void setCreatedAt() { createdAt = Instant.now(); }
}

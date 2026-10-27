package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/** Khóa độc quyền ghế/suất; row được chuyển từ hold sang booking khi tạo đơn. */
@Entity @Table(name = "seat_allocations") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SeatAllocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "showtime_id", nullable = false) private Long showtimeId;
    @Column(name = "seat_id", nullable = false) private Long seatId;
    @Column(name = "hold_id") private Long holdId;
    @Column(name = "booking_id") private Long bookingId;
    @Column(name = "expires_at") private Instant expiresAt;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;

    public SeatAllocation(Long showtimeId, Long seatId, Long holdId, Instant expiresAt) {
        this.showtimeId = showtimeId;
        this.seatId = seatId;
        this.holdId = holdId;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void onCreate() { createdAt = Instant.now(); }
}

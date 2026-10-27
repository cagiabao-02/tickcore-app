package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Vé theo từng ghế: QR riêng và trạng thái check-in không làm thay đổi booking tổng. */
@Entity @Table(name = "booking_seats") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BookingSeat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "booking_id", nullable = false) private Long bookingId;
    @Column(name = "seat_id", nullable = false) private Long seatId;
    @Column(name = "seat_label", nullable = false, length = 20) private String seatLabel;
    @Column(name = "seat_type", nullable = false, length = 24) private String seatType;
    @Column(nullable = false) private Long price;
    @Column(name = "ticket_code", nullable = false, unique = true, length = 96) private String ticketCode;
    @Column(name = "checked_in_at") private Instant checkedInAt;
    @Column(name = "checked_in_by_user_id") private Long checkedInByUserId;

    public BookingSeat(Long bookingId, Long seatId, String seatLabel, String seatType,
        Long price, String ticketCode) {
        this.bookingId = bookingId;
        this.seatId = seatId;
        this.seatLabel = seatLabel;
        this.seatType = seatType;
        this.price = price;
        this.ticketCode = ticketCode;
    }
}

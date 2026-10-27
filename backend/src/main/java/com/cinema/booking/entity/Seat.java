package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Ghế vật lý trong phòng; loại AISLE không được phép giữ hoặc bán. */
@Entity @Table(name = "seats") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Seat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "room_id", nullable = false) private Long roomId;
    @Column(name = "row_label", nullable = false, length = 8) private String rowLabel;
    @Column(name = "seat_number", nullable = false) private Integer seatNumber;
    @Enumerated(EnumType.STRING) @Column(name = "seat_type", nullable = false, length = 24) private SeatType seatType;
    @Column(nullable = false) private boolean active = true;

    public static Seat create(Long roomId, String rowLabel, Integer seatNumber, SeatType seatType) {
        Seat seat = new Seat();
        seat.roomId = roomId;
        seat.rowLabel = rowLabel;
        seat.seatNumber = seatNumber;
        seat.seatType = seatType;
        seat.active = true;
        return seat;
    }
}

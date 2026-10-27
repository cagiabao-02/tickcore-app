package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Phòng chiếu; ghế và suất chiếu tham chiếu roomId. */
@Entity @Table(name = "rooms") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "cinema_id", nullable = false) private Long cinemaId;
    @Column(nullable = false, length = 120) private String name;
    @Column(name = "total_rows", nullable = false) private Integer totalRows;
    @Column(name = "total_columns", nullable = false) private Integer totalColumns;
    @Column(nullable = false) private boolean active = true;

    public static Room create() { return new Room(); }
}

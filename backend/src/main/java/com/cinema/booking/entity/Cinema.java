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

/** Rạp thuộc một thành phố; số phòng được tổng hợp từ danh sách phòng. */
@Entity @Table(name = "cinemas") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cinema {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "city_id", nullable = false) private Long cityId;
    @Column(nullable = false, length = 160) private String name;
    @Column(nullable = false, length = 500) private String address;
    @Column(length = 32) private String phone;

    public static Cinema create() { return new Cinema(); }
}

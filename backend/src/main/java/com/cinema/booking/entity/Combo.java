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

/** Combo đồ ăn; booking lưu snapshot tên và giá tại thời điểm đặt. */
@Entity @Table(name = "combos") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Combo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 160) private String name;
    @Column(length = 1000) private String description;
    @Column(name = "image_url", length = 2048) private String imageUrl;
    @Column(nullable = false) private Long price;
    @Column(nullable = false) private boolean active = true;

    public static Combo create() { return new Combo(); }
}

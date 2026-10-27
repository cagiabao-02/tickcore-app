package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Mã giảm giá; lượt dùng được cập nhật có khóa khi xác nhận thanh toán. */
@Entity @Table(name = "promotions") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Promotion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 64) private String code;
    @Enumerated(EnumType.STRING) @Column(name = "promotion_type", nullable = false, length = 24) private PromotionType type;
    @Column(nullable = false) private Integer value;
    @Column(name = "min_order_amount", nullable = false) private Long minOrderAmount;
    @Column(name = "max_discount") private Long maxDiscount;
    @Column(name = "starts_at", nullable = false) private Instant startsAt;
    @Column(name = "ends_at", nullable = false) private Instant endsAt;
    @Column(name = "usage_limit") private Integer usageLimit;
    @Column(name = "used_count", nullable = false) private Integer usedCount = 0;
    @Column(nullable = false) private boolean active = true;

    public static Promotion create() { return new Promotion(); }
}

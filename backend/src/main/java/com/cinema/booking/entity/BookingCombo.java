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

/** Combo trong đơn với snapshot tên và đơn giá tại thời điểm mua. */
@Entity @Table(name = "booking_combos") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BookingCombo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "booking_id", nullable = false) private Long bookingId;
    @Column(name = "combo_id", nullable = false) private Long comboId;
    @Column(name = "combo_name", nullable = false, length = 160) private String comboName;
    @Column(nullable = false) private Integer quantity;
    @Column(name = "unit_price", nullable = false) private Long unitPrice;

    public BookingCombo(Long bookingId, Long comboId, String comboName, Integer quantity, Long unitPrice) {
        this.bookingId = bookingId;
        this.comboId = comboId;
        this.comboName = comboName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}

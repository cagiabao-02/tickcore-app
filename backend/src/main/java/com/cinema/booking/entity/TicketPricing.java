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

/** Cấu hình giá nền và phụ thu từng loại ghế. */
@Entity @Table(name = "ticket_pricing") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TicketPricing {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Enumerated(EnumType.STRING) @Column(name = "seat_type", nullable = false, unique = true, length = 24) private SeatType seatType;
    @Column(name = "base_price", nullable = false) private Long basePrice;
    @Column(name = "surcharge_3d", nullable = false) private Long surcharge3D;
    @Column(name = "surcharge_imax", nullable = false) private Long surchargeIMAX;
    @Column(name = "weekend_surcharge", nullable = false) private Long weekendSurcharge;

    public static TicketPricing create(SeatType seatType) {
        TicketPricing pricing = new TicketPricing();
        pricing.seatType = seatType;
        return pricing;
    }
}

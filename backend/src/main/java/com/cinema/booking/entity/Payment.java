package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Một lần thử thanh toán; callback nhà cung cấp sẽ được xác thực trước khi xác nhận đơn. */
@Entity @Table(name = "payments") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "booking_id", nullable = false) private Long bookingId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private PaymentMethod method;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private PaymentStatus status = PaymentStatus.PENDING;
    @Column(nullable = false) private Long amount;
    @Column(name = "provider_reference", length = 160) private String providerReference;
    @Column(name = "idempotency_key", nullable = false, unique = true, length = 96) private String idempotencyKey;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    public Payment(Long bookingId, PaymentMethod method, PaymentStatus status, Long amount, String idempotencyKey) {
        this.bookingId = bookingId;
        this.method = method;
        this.status = status;
        this.amount = amount;
        this.idempotencyKey = idempotencyKey;
    }

    @PrePersist
    void onCreate() { Instant now = Instant.now(); createdAt = now; updatedAt = now; }

    @PreUpdate
    void onUpdate() { updatedAt = Instant.now(); }
}

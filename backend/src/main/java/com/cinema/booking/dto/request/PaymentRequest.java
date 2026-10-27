package com.cinema.booking.dto.request;

import com.cinema.booking.entity.PaymentMethod;
import com.cinema.booking.entity.PaymentOutcome;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Yêu cầu cho bộ mô phỏng local; outcome không phải bằng chứng thanh toán thật. */
public record PaymentRequest(
    @NotNull @Positive
    Long bookingId,
    @NotNull PaymentMethod method,
    @NotNull PaymentOutcome outcome
) {}

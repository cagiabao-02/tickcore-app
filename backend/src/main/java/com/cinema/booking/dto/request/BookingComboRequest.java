package com.cinema.booking.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Max;

/** Combo và số lượng; server tự đọc giá từ database. */
public record BookingComboRequest(
    @NotNull @Positive
    Long comboId,
    @NotNull @Positive @Max(20)
    Integer quantity
) {}

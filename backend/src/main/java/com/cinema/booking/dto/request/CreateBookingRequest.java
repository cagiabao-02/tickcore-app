package com.cinema.booking.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Tạo đơn từ hold; giá, ghế và giảm giá đều được xác minh lại phía server. */
public record CreateBookingRequest(
    @NotNull @Positive
    Long holdId,
    @NotNull @Positive
    Long showtimeId,
    @Size(max = 20) List<@NotNull @Valid BookingComboRequest> combos,
    @Size(max = 64)
    String promoCode
) {}

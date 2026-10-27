package com.cinema.booking.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Danh sách ghế người dùng muốn giữ cho một suất chiếu. */
public record SeatHoldRequest(
    @NotEmpty @Size(max = 8)
    List<@NotNull @Positive Long> seatIds
) {}

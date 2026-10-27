package com.cinema.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Combo; trường do máy chủ tạo có thể để null. */
public record ComboRequest(
    Long id,
    @NotBlank @Size(max = 160) String name,
    @Size(max = 1000) String description,
    @Size(max = 2048) String imageUrl,
    @NotNull @PositiveOrZero Long price,
    Boolean active
) {}

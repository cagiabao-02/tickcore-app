package com.cinema.booking.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Nội dung đánh giá; giới hạn khớp với cột rating và comment trong database. */
public record ReviewRequest(
    @NotNull @Min(1) @Max(5) Integer rating,
    @Size(max = 2000) String comment
) {}

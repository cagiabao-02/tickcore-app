package com.cinema.booking.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Promotion; trường do máy chủ tạo có thể để null. */
public record PromotionRequest(
    Long id,
    @NotBlank @Size(max = 64) String code,
    @NotBlank @Pattern(regexp = "PERCENTAGE|FIXED_AMOUNT") String type,
    @NotNull @Positive Integer value,
    @NotNull @PositiveOrZero Long minOrderAmount,
    @PositiveOrZero Long maxDiscount,
    @NotBlank @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$") String startDate,
    @NotBlank @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$") String endDate,
    @Min(0) Integer usageLimit,
    Integer usedCount,
    Boolean active
) {}

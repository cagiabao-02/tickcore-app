package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu PromotionValidationResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record PromotionValidationResponse(
    Boolean valid,
    Long discountAmount,
    String message,
    Long minOrderAmount
) {}

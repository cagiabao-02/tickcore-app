package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu PromotionResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record PromotionResponse(
    Long id,
    String code,
    String type,
    Integer value,
    Long minOrderAmount,
    Long maxDiscount,
    String startDate,
    String endDate,
    Integer usageLimit,
    Integer usedCount,
    Boolean active
) {}

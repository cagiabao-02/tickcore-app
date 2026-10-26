package com.cinema.booking.dto.request;

import java.util.List;
import java.util.Map;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Promotion; trường do máy chủ tạo có thể để null. */
public record PromotionRequest(
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

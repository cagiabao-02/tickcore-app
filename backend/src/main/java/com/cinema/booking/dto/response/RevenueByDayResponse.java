package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu RevenueByDayResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record RevenueByDayResponse(
    String date,
    Long revenue,
    Integer bookings
) {}

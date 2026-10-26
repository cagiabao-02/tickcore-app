package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu DashboardSummaryResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record DashboardSummaryResponse(
    Long totalRevenue,
    Integer totalBookings,
    Integer totalShowtimes,
    Integer newUsers,
    Double revenueChange,
    Double bookingsChange
) {}

package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu SeatHoldResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record SeatHoldResponse(
    Long holdId,
    Long showtimeId,
    List<Long> seatIds,
    String expiresAt
) {}

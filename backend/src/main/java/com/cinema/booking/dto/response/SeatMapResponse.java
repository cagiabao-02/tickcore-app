package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu SeatMapResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record SeatMapResponse(
    Long showtimeId,
    String roomName,
    Integer rows,
    Integer columns,
    List<SeatResponse> seats
) {}

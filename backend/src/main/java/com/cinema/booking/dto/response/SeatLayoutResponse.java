package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu SeatLayoutResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record SeatLayoutResponse(
    Integer rows,
    Integer columns,
    List<SeatLayoutResponseSeatsItem> seats
) {}

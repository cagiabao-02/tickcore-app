package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu SeatResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record SeatResponse(
    Long id,
    String row,
    Integer column,
    String label,
    String type,
    Long price,
    String status
) {}

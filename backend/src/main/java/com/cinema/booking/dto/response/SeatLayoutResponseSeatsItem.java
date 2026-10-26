package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu SeatLayoutResponseSeatsItem; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record SeatLayoutResponseSeatsItem(
    String row,
    Integer column,
    String type
) {}

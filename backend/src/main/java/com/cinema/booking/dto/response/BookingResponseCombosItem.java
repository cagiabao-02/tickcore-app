package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu BookingResponseCombosItem; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record BookingResponseCombosItem(
    String name,
    Integer quantity,
    Long price
) {}

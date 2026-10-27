package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu BookingResponseSeatsItem; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record BookingResponseSeatsItem(
    String label,
    String type,
    Long price,
    String ticketCode,
    String checkedInAt,
    String checkedInBy
) {}

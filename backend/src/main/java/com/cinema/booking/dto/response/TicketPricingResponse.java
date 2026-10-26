package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu TicketPricingResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record TicketPricingResponse(
    Long id,
    String seatType,
    Long basePrice,
    Long surcharge3D,
    Long surchargeIMAX,
    Long weekendSurcharge
) {}

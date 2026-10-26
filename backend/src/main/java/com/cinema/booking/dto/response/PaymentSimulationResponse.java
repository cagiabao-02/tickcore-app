package com.cinema.booking.dto.response;


/** Kết quả thanh toán mô phỏng. */
public record PaymentSimulationResponse(
    Boolean success,
    BookingResponse booking
) {}

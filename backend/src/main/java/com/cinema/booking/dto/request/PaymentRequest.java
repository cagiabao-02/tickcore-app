package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số PaymentRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record PaymentRequest(
    Long bookingId,
    String method,
    String outcome
) {}

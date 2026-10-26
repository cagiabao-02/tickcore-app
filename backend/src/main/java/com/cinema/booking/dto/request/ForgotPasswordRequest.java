package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số ForgotPasswordRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record ForgotPasswordRequest(
    String email
) {}

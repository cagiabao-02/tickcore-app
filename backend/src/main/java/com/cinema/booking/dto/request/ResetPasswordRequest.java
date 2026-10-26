package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số ResetPasswordRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record ResetPasswordRequest(
    String token,
    String password
) {}

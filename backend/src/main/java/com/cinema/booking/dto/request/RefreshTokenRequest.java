package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số RefreshTokenRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record RefreshTokenRequest(
    String refreshToken
) {}

package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số LoginRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record LoginRequest(
    String email,
    String password
) {}

package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số RegisterRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record RegisterRequest(
    String email,
    String fullName,
    String password
) {}

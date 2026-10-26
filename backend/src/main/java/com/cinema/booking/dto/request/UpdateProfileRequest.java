package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số UpdateProfileRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record UpdateProfileRequest(
    String fullName,
    String phone,
    String dateOfBirth,
    String avatarUrl
) {}

package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu UserResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record UserResponse(
    Long id,
    String email,
    String fullName,
    String phone,
    String dateOfBirth,
    String avatarUrl,
    String role,
    Boolean locked,
    String createdAt
) {}

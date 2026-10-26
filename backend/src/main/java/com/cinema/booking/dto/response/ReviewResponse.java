package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu ReviewResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record ReviewResponse(
    Long id,
    Long userId,
    String userFullName,
    String userAvatarUrl,
    Long movieId,
    Integer rating,
    String comment,
    Boolean hidden,
    String createdAt,
    String updatedAt
) {}

package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu ApiError; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record ApiError(
    Integer status,
    String code,
    String message,
    Map<String, String> details,
    String timestamp
) {}

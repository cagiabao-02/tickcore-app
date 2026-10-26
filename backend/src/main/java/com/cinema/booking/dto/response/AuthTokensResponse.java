package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu AuthTokensResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record AuthTokensResponse(
    String accessToken,
    String refreshToken,
    Integer expiresIn
) {}

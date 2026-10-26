package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu GenreResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record GenreResponse(
    Long id,
    String name,
    String slug
) {}

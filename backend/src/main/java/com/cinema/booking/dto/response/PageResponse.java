package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu PageResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record PageResponse<T>(
    List<T> content,
    Integer page,
    Integer size,
    Long totalElements,
    Integer totalPages
) {}

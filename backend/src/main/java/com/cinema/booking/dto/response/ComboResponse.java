package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu ComboResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record ComboResponse(
    Long id,
    String name,
    String description,
    String imageUrl,
    Long price,
    Boolean active
) {}

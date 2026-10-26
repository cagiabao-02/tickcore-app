package com.cinema.booking.dto.request;

import java.util.List;
import java.util.Map;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Combo; trường do máy chủ tạo có thể để null. */
public record ComboRequest(
    Long id,
    String name,
    String description,
    String imageUrl,
    Long price,
    Boolean active
) {}

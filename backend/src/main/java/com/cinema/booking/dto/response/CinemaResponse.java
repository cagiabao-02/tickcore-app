package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu CinemaResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record CinemaResponse(
    Long id,
    String name,
    CityResponse city,
    String address,
    String phone,
    Integer totalRooms
) {}

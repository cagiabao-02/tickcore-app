package com.cinema.booking.dto.request;

import java.util.List;
import java.util.Map;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Cinema; trường do máy chủ tạo có thể để null. */
public record CinemaRequest(
    Long id,
    String name,
    CityResponse city,
    String address,
    String phone,
    Integer totalRooms
) {}

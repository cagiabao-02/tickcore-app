package com.cinema.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Cinema; trường do máy chủ tạo có thể để null. */
public record CinemaRequest(
    Long id,
    @NotBlank @Size(max = 160) String name,
    @NotNull CityResponse city,
    @NotBlank @Size(max = 500) String address,
    @Size(max = 32) String phone,
    Integer totalRooms
) {}

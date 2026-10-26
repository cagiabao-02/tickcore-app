package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu OccupancyByCinemaResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record OccupancyByCinemaResponse(
    Long cinemaId,
    String cinemaName,
    Double occupancyRate,
    Integer totalSeats,
    Integer occupiedSeats
) {}

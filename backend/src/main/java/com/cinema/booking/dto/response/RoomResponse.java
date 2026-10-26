package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu RoomResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record RoomResponse(
    Long id,
    String name,
    Long cinemaId,
    String cinemaName,
    Integer totalRows,
    Integer totalColumns,
    Integer totalSeats,
    SeatLayoutResponse seatLayout
) {}

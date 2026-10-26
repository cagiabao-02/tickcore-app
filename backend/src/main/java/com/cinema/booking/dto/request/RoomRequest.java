package com.cinema.booking.dto.request;

import java.util.List;
import java.util.Map;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Room; trường do máy chủ tạo có thể để null. */
public record RoomRequest(
    Long id,
    String name,
    Long cinemaId,
    String cinemaName,
    Integer totalRows,
    Integer totalColumns,
    Integer totalSeats,
    SeatLayoutResponse seatLayout
) {}

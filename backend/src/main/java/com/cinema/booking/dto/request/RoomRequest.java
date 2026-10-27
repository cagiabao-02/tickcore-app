package com.cinema.booking.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Room; trường do máy chủ tạo có thể để null. */
public record RoomRequest(
    Long id,
    @NotBlank @Size(max = 120) String name,
    @NotNull @Positive Long cinemaId,
    String cinemaName,
    @NotNull @Min(1) @Max(26) Integer totalRows,
    @NotNull @Min(1) @Max(30) Integer totalColumns,
    Integer totalSeats,
    SeatLayoutResponse seatLayout
) {}

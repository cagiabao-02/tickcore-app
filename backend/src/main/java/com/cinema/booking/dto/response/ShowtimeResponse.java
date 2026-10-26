package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu ShowtimeResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record ShowtimeResponse(
    Long id,
    Long movieId,
    String movieTitle,
    String moviePosterUrl,
    Long cinemaId,
    String cinemaName,
    Long roomId,
    String roomName,
    String startTime,
    String endTime,
    String date,
    String format,
    String subtitleType,
    Long basePrice,
    Integer availableSeats,
    Integer totalSeats
) {}

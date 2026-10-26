package com.cinema.booking.dto.request;

import java.util.List;
import java.util.Map;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Showtime; trường do máy chủ tạo có thể để null. */
public record ShowtimeRequest(
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

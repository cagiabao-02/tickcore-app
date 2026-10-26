package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu TopMovieResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record TopMovieResponse(
    Long movieId,
    String movieTitle,
    String posterUrl,
    Integer totalTickets,
    Long totalRevenue
) {}

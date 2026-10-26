package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số ShowtimeSearchRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record ShowtimeSearchRequest(
    Long movieId,
    Long cinemaId,
    String date
) {}

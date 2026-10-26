package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số SearchRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record SearchRequest(
    String keyword,
    String status,
    String from,
    String to,
    Long movieId,
    Long cinemaId,
    Integer page,
    Integer size
) {}

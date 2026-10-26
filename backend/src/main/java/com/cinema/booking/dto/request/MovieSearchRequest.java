package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số MovieSearchRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record MovieSearchRequest(
    String status,
    String genre,
    String language,
    String ageRating,
    String keyword,
    String sort,
    Integer page,
    Integer size
) {}

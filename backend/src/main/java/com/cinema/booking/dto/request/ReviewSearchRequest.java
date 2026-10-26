package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số ReviewSearchRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record ReviewSearchRequest(
    String sort,
    Integer page,
    Integer size
) {}

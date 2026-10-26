package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số ReviewRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record ReviewRequest(
    Integer rating,
    String comment
) {}

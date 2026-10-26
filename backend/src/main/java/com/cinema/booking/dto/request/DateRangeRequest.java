package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số DateRangeRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record DateRangeRequest(
    String from,
    String to
) {}

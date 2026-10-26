package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số BookingComboRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record BookingComboRequest(
    Long comboId,
    Integer quantity
) {}

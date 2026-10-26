package com.cinema.booking.dto.request;

import java.util.List;
/** Tham số CreateBookingRequest từ frontend; việc kiểm tra dữ liệu sẽ được cài đặt sau. */
public record CreateBookingRequest(
    Long holdId,
    Long showtimeId,
    List<BookingComboRequest> combos,
    String promoCode
) {}

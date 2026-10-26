package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu BookingResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record BookingResponse(
    Long id,
    String bookingCode,
    Long userId,
    String movieTitle,
    String moviePosterUrl,
    String cinemaName,
    String roomName,
    String showtime,
    String showDate,
    String format,
    List<BookingResponseSeatsItem> seats,
    List<BookingResponseCombosItem> combos,
    Long subtotal,
    Long discount,
    String promoCode,
    Long totalAmount,
    String paymentMethod,
    String paymentStatus,
    String status,
    String createdAt,
    String qrCode,
    String expiresAt
) {}

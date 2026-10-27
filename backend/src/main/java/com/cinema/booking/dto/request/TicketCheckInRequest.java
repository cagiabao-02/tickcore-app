package com.cinema.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Mã QR riêng của từng vé do máy quét tại rạp gửi lên. */
public record TicketCheckInRequest(@NotBlank @Size(max = 96) String ticketCode) {}

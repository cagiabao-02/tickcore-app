package com.cinema.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Refresh token dạng opaque do server phát hành. */
public record RefreshTokenRequest(
    @NotBlank @Size(max = 128)
    String refreshToken
) {}

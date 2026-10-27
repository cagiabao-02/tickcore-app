package com.cinema.booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Thông tin đăng nhập. */
public record LoginRequest(
    @NotBlank @Email @Size(max = 254)
    String email,
    @NotBlank @Size(max = 72)
    String password
) {}

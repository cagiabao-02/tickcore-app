package com.cinema.booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Thông tin đăng ký công khai; vai trò luôn được gán USER từ server. */
public record RegisterRequest(
    @NotBlank @Email @Size(max = 254)
    String email,
    @NotBlank @Size(max = 120)
    String fullName,
    @NotBlank @Size(min = 6, max = 72)
    String password
) {}

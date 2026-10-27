package com.cinema.booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Email xin hướng dẫn đặt lại mật khẩu. */
public record ForgotPasswordRequest(
    @NotBlank @Email @Size(max = 254)
    String email
) {}

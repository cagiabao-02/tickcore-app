package com.cinema.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Token dùng một lần cùng mật khẩu mới. */
public record ResetPasswordRequest(
    @NotBlank @Size(max = 128)
    String token,
    @NotBlank @Size(min = 6, max = 72)
    String password
) {}

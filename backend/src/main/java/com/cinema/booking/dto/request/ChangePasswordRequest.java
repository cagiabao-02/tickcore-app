package com.cinema.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Yêu cầu đổi mật khẩu yêu cầu xác minh mật khẩu hiện tại. */
public record ChangePasswordRequest(
    @NotBlank @Size(max = 72)
    String currentPassword,
    @NotBlank @Size(min = 6, max = 72)
    String newPassword
) {}

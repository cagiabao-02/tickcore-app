package com.cinema.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Các trường hồ sơ người dùng được phép tự cập nhật. */
public record UpdateProfileRequest(
    @NotBlank @Size(max = 120)
    String fullName,
    @Size(max = 32)
    String phone,
    @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "Ngày sinh phải theo định dạng yyyy-MM-dd.")
    String dateOfBirth,
    @Size(max = 2048)
    String avatarUrl
) {}

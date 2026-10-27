package com.cinema.booking.dto.request;

import com.cinema.booking.entity.Role;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Vai trò đích; tài khoản tự đăng ký không thể truyền trường này. */
public record RoleRequest(
    @NotNull Role role,
    @Size(max = 500) String reason
) {}

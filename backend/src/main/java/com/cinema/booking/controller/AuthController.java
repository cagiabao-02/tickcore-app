package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service) { this.service = service; }

    /** Công khai: xử lý xác thực tương ứng. */
    @PostMapping("/auth/register")
    public MessageResponse register(@Valid @RequestBody RegisterRequest request) {
        return service.register(request);
    }

    /** Công khai: xử lý xác thực tương ứng. */
    @PostMapping("/auth/login")
    public AuthTokensResponse login(@Valid @RequestBody LoginRequest request) {
        return service.login(request);
    }

    /** Công khai: xử lý xác thực tương ứng. */
    @PostMapping("/auth/refresh")
    public AuthTokensResponse refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return service.refreshToken(request);
    }

    /** USER: đăng xuất và thu hồi phiên. */
    @PostMapping("/auth/logout")
    public MessageResponse logout() {
        return service.logout();
    }

    /** Công khai: xử lý xác thực tương ứng. */
    @PostMapping("/auth/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return service.forgotPassword(request);
    }

    /** Công khai: xử lý xác thực tương ứng. */
    @PostMapping("/auth/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return service.resetPassword(request);
    }
}

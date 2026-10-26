package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ AuthService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class AuthService {
    /** Công khai: xử lý xác thực tương ứng. */
    public MessageResponse register(RegisterRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Công khai: xử lý xác thực tương ứng. */
    public AuthTokensResponse login(LoginRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Công khai: xử lý xác thực tương ứng. */
    public AuthTokensResponse refreshToken(RefreshTokenRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** USER: đăng xuất và thu hồi phiên. */
    public MessageResponse logout() {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Công khai: xử lý xác thực tương ứng. */
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Công khai: xử lý xác thực tương ứng. */
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}

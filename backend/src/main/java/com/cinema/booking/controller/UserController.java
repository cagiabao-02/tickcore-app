package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }

    /** USER: lấy hồ sơ tài khoản hiện tại. */
    @GetMapping("/users/me")
    public UserResponse getMyProfile() {
        return service.getMyProfile();
    }

    /** USER: chỉ sửa các trường hồ sơ được phép. */
    @PutMapping("/users/me")
    public UserResponse updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return service.updateMyProfile(request);
    }

    /** USER: kiểm tra mật khẩu cũ và đổi mật khẩu. */
    @PutMapping("/users/me/password")
    public MessageResponse changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return service.changePassword(request);
    }
}

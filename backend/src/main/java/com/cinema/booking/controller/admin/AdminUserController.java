package com.cinema.booking.controller.admin;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class AdminUserController {
    private final UserService service;
    public AdminUserController(UserService service) { this.service = service; }

    /** ADMIN: tìm người dùng, phân trang. */
    @GetMapping("/admin/users")
    public PageResponse<UserResponse> searchUsers(@ModelAttribute SearchRequest query) {
        return service.searchUsers(query);
    }

    /** ADMIN: khóa tài khoản. */
    @PutMapping("/admin/users/{id}/lock")
    public UserResponse lockUser(@PathVariable("id") Long id) {
        return service.lockUser(id);
    }

    /** ADMIN: mở khóa; bổ sung đường dẫn đối xứng với frontend hiện tại. */
    @PutMapping("/admin/users/{id}/unlock")
    public UserResponse unlockUser(@PathVariable("id") Long id) {
        return service.unlockUser(id);
    }

    /** ADMIN: đổi vai trò USER hoặc ADMIN. */
    @PutMapping("/admin/users/{id}/role")
    public UserResponse changeRole(@PathVariable("id") Long id, @Valid @RequestBody RoleRequest request) {
        return service.changeRole(id, request);
    }
}

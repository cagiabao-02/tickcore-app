package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ UserService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class UserService {
    /** USER: lấy hồ sơ tài khoản hiện tại. */
    public UserResponse getMyProfile() {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** USER: chỉ sửa các trường hồ sơ được phép. */
    public UserResponse updateMyProfile(UpdateProfileRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** USER: kiểm tra mật khẩu cũ và đổi mật khẩu. */
    public MessageResponse changePassword(ChangePasswordRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: tìm người dùng, phân trang. */
    public PageResponse<UserResponse> searchUsers(SearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: khóa tài khoản. */
    public UserResponse lockUser(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: mở khóa; bổ sung đường dẫn đối xứng với frontend hiện tại. */
    public UserResponse unlockUser(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: đổi vai trò USER hoặc ADMIN. */
    public UserResponse changeRole(Long id, RoleRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}

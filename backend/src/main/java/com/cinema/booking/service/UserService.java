package com.cinema.booking.service;

import com.cinema.booking.dto.request.RoleRequest;
import com.cinema.booking.dto.request.SearchRequest;
import com.cinema.booking.dto.request.UpdateProfileRequest;
import com.cinema.booking.dto.request.ChangePasswordRequest;
import com.cinema.booking.dto.response.MessageResponse;
import com.cinema.booking.dto.response.PageResponse;
import com.cinema.booking.dto.response.UserResponse;
import com.cinema.booking.dto.response.UserRoleHistoryResponse;
import com.cinema.booking.entity.Role;
import com.cinema.booking.entity.User;
import com.cinema.booking.entity.UserRoleHistory;
import com.cinema.booking.entity.UserRoleHistory;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.RefreshSessionRepository;
import com.cinema.booking.repository.UserRepository;
import com.cinema.booking.repository.UserRoleHistoryRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.DateTimeException;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Hồ sơ USER và các thao tác quản trị tài khoản/audit vai trò. */
@Service
public class UserService {

    private final UserRepository users;
    private final UserRoleHistoryRepository roleHistory;
    private final RefreshSessionRepository sessions;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository users, UserRoleHistoryRepository roleHistory,
        RefreshSessionRepository sessions, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.roleHistory = roleHistory;
        this.sessions = sessions;
        this.passwordEncoder = passwordEncoder;
    }
    /** USER: lấy hồ sơ tài khoản hiện tại. */
    public UserResponse getMyProfile() {
        return toResponse(currentUser());
    }

    /** USER: chỉ sửa các trường hồ sơ được phép. */
    public UserResponse updateMyProfile(UpdateProfileRequest request) {
        User user = currentUser();
        user.setFullName(request.fullName().trim());
        user.setPhone(blankToNull(request.phone()));
        user.setAvatarUrl(blankToNull(request.avatarUrl()));
        try {
            user.setDateOfBirth(request.dateOfBirth() == null || request.dateOfBirth().isBlank()
                ? null : LocalDate.parse(request.dateOfBirth()));
        } catch (DateTimeException exception) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_DATE_OF_BIRTH",
                "Ngày sinh không hợp lệ.");
        }
        if (user.getDateOfBirth() != null && user.getDateOfBirth().isAfter(LocalDate.now())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_DATE_OF_BIRTH",
                "Ngày sinh không thể ở tương lai.");
        }
        return toResponse(users.save(user));
    }

    /** USER: kiểm tra mật khẩu cũ và đổi mật khẩu. */
    @Transactional
    public MessageResponse changePassword(ChangePasswordRequest request) {
        User authenticatedUser = currentUser();
        User user = users.findByIdForUpdate(authenticatedUser.getId())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED",
                "Phiên đăng nhập không hợp lệ."));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "CURRENT_PASSWORD_INVALID",
                "Mật khẩu hiện tại không đúng.");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "PASSWORD_UNCHANGED",
                "Mật khẩu mới phải khác mật khẩu hiện tại.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.invalidateAccessTokens();
        users.save(user);
        sessions.revokeAllForUser(user.getId(), Instant.now());
        return new MessageResponse("Đổi mật khẩu thành công. Vui lòng đăng nhập lại trên các thiết bị khác.");
    }

    /** ADMIN: tìm người dùng, phân trang. */
    public PageResponse<UserResponse> searchUsers(SearchRequest query) {
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(1000, Math.max(1, query.size() == null ? 20 : query.size()));
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String keyword = query.keyword() == null ? "" : query.keyword().trim();
        Page<User> result = keyword.isEmpty()
            ? users.findAll(pageable)
            : users.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                keyword, keyword, pageable
            );
        return new PageResponse<>(result.getContent().stream().map(this::toResponse).toList(),
            result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    /** ADMIN: khóa tài khoản. */
    @Transactional
    public UserResponse lockUser(Long id) {
        User actor = currentUser();
        List<User> activeAdmins = users.findActiveByRoleForUpdate(Role.ADMIN);
        User target = users.findByIdForUpdate(id)
            .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Không tìm thấy tài khoản."));
        ensureNotSelf(actor, target);
        if (target.getRole() == Role.ADMIN && !target.isLocked()) {
            ensureAnotherActiveAdmin(target, activeAdmins);
        }
        if (!target.isLocked()) target.invalidateAccessTokens();
        target.setLocked(true);
        sessions.revokeAllForUser(target.getId(), Instant.now());
        return toResponse(users.save(target));
    }

    /** ADMIN: mở khóa; bổ sung đường dẫn đối xứng với frontend hiện tại. */
    @Transactional
    public UserResponse unlockUser(Long id) {
        User actor = currentUser();
        User target = users.findByIdForUpdate(id)
            .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Không tìm thấy tài khoản."));
        ensureNotSelf(actor, target);
        if (target.isLocked()) target.invalidateAccessTokens();
        target.setLocked(false);
        return toResponse(users.save(target));
    }

    /** ADMIN: đổi vai trò có audit; chặn tự đổi quyền và giữ lại ít nhất một admin hoạt động. */
    @Transactional
    public UserResponse changeRole(Long id, RoleRequest request) {
        User actor = currentUser();
        List<User> activeAdmins = users.findActiveByRoleForUpdate(Role.ADMIN);
        User target = users.findByIdForUpdate(id)
            .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Không tìm thấy tài khoản."));
        ensureNotSelf(actor, target);
        Role oldRole = target.getRole();
        Role newRole = request.role();
        if (oldRole == newRole) return toResponse(target);
        if (oldRole == Role.ADMIN && !target.isLocked() && newRole != Role.ADMIN) {
            ensureAnotherActiveAdmin(target, activeAdmins);
        }
        target.setRole(newRole);
        target.invalidateAccessTokens();
        users.saveAndFlush(target);
        String reason = request.reason() == null || request.reason().isBlank() ? null : request.reason().trim();
        roleHistory.save(new UserRoleHistory(target, actor, oldRole, newRole, reason));
        sessions.revokeAllForUser(target.getId(), Instant.now());
        return toResponse(target);
    }

    /** ADMIN: xem lịch sử đổi vai trò của một user, mới nhất trước. */
    @Transactional(readOnly = true)
    public PageResponse<UserRoleHistoryResponse> getRoleHistory(Long userId, SearchRequest query) {
        users.findById(userId)
            .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Không tìm thấy tài khoản."));
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(100, Math.max(1, query.size() == null ? 20 : query.size()));
        Page<UserRoleHistory> result = roleHistory
            .findByTargetUser_IdOrderByChangedAtDescIdDesc(userId,
                PageRequest.of(page, size));
        return new PageResponse<>(result.getContent().stream().map(history -> {
            User actor = history.getChangedBy();
            return new UserRoleHistoryResponse(history.getId(), history.getTargetUser().getId(), actor.getId(),
                history.getChangedByName(), history.getChangedByEmail(), history.getOldRole().name(), history.getNewRole().name(),
                history.getReason(), history.getChangedAt().toString());
        }).toList(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Cần đăng nhập để tiếp tục.");
        }
        return users.findByEmailIgnoreCase(authentication.getName())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Phiên đăng nhập không hợp lệ."));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void ensureNotSelf(User actor, User target) {
        if (actor.getId().equals(target.getId())) {
            throw new BusinessException(HttpStatus.CONFLICT, "CANNOT_CHANGE_SELF", "Không thể thay đổi trạng thái hoặc vai trò của chính mình.");
        }
    }

    private void ensureAnotherActiveAdmin(User target, List<User> activeAdmins) {
        long otherAdmins = activeAdmins.stream().filter(admin -> !admin.getId().equals(target.getId())).count();
        if (otherAdmins == 0) {
            throw new BusinessException(HttpStatus.CONFLICT, "LAST_ADMIN", "Không thể thu hồi hoặc khóa admin hoạt động cuối cùng.");
        }
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getPhone(),
            user.getDateOfBirth() == null ? null : user.getDateOfBirth().toString(), user.getAvatarUrl(),
            user.getRole().name(), user.isLocked(), user.getCreatedAt().toString());
    }
}

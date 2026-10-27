package com.cinema.booking.repository;

import com.cinema.booking.entity.UserRoleHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/** Đọc lịch sử cấp và thu hồi vai trò theo tài khoản được tác động. */
public interface UserRoleHistoryRepository extends JpaRepository<UserRoleHistory, Long> {
    Page<UserRoleHistory> findByTargetUser_IdOrderByChangedAtDescIdDesc(Long targetUserId, Pageable pageable);
}

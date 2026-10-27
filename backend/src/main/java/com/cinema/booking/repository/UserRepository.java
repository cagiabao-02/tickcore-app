package com.cinema.booking.repository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cinema.booking.entity.Role;
import com.cinema.booking.entity.User;
/** Truy vấn tài khoản theo email dùng khi đăng nhập và đăng ký. */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Page<User> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
        String email, String fullName, Pageable pageable
    );

    long countByRoleAndLockedFalse(Role role);
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(java.time.Instant from, java.time.Instant to);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select user from User user where user.role = :role and user.locked = false order by user.id")
    List<User> findActiveByRoleForUpdate(@Param("role") Role role);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select user from User user where user.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") Long id);
}

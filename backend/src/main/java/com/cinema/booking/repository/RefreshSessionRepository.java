package com.cinema.booking.repository;

import com.cinema.booking.entity.RefreshSession;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Truy vấn refresh session còn hiệu lực và thu hồi khi đăng xuất. */
public interface RefreshSessionRepository extends JpaRepository<RefreshSession, Long> {
    Optional<RefreshSession> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select session from RefreshSession session where session.tokenHash = :tokenHash")
    Optional<RefreshSession> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    @Modifying
    @Transactional
    @Query("update RefreshSession session set session.revokedAt = :revokedAt " +
        "where session.user.id = :userId and session.revokedAt is null")
    int revokeAllForUser(@Param("userId") Long userId, @Param("revokedAt") java.time.Instant revokedAt);

    @Modifying
    @Query(value = "delete from refresh_sessions where expires_at <= :cutoff limit 5000", nativeQuery = true)
    int deleteExpiredBatch(@Param("cutoff") Instant cutoff);
}

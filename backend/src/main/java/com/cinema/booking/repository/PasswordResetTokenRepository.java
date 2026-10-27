package com.cinema.booking.repository;

import com.cinema.booking.entity.PasswordResetToken;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Tra cứu token reset và khóa dùng một lần để chặn hai request reset đồng thời. */
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from PasswordResetToken token where token.tokenHash = :tokenHash")
    Optional<PasswordResetToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    @Modifying
    @Query("update PasswordResetToken token set token.usedAt = :usedAt "
        + "where token.userId = :userId and token.usedAt is null")
    int invalidateUnusedByUserId(@Param("userId") Long userId, @Param("usedAt") Instant usedAt);

    @Modifying
    @Query(value = "delete from password_reset_tokens where expires_at <= :cutoff limit 5000", nativeQuery = true)
    int deleteExpiredBatch(@Param("cutoff") Instant cutoff);
}

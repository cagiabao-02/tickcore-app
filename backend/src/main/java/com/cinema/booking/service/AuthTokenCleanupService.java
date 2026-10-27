package com.cinema.booking.service;

import com.cinema.booking.repository.PasswordResetTokenRepository;
import com.cinema.booking.repository.RefreshSessionRepository;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Dọn theo lô các refresh session và password reset token đã hết hạn. */
@Service
public class AuthTokenCleanupService {

    private final RefreshSessionRepository refreshSessions;
    private final PasswordResetTokenRepository passwordResetTokens;

    public AuthTokenCleanupService(RefreshSessionRepository refreshSessions,
        PasswordResetTokenRepository passwordResetTokens) {
        this.refreshSessions = refreshSessions;
        this.passwordResetTokens = passwordResetTokens;
    }

    @Transactional
    public int deleteExpiredTokens() {
        Instant cutoff = Instant.now();
        return refreshSessions.deleteExpiredBatch(cutoff)
            + passwordResetTokens.deleteExpiredBatch(cutoff);
    }
}

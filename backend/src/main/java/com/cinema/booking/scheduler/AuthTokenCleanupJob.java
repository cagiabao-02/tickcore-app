package com.cinema.booking.scheduler;

import com.cinema.booking.service.AuthTokenCleanupService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Dọn tối đa 5.000 token/session hết hạn mỗi bảng theo chu kỳ cấu hình. */
@Component
public class AuthTokenCleanupJob {

    private final AuthTokenCleanupService cleanupService;

    public AuthTokenCleanupJob(AuthTokenCleanupService cleanupService) {
        this.cleanupService = cleanupService;
    }

    @Scheduled(fixedDelayString = "${auth.token-cleanup-delay-ms:3600000}")
    public void run() {
        cleanupService.deleteExpiredTokens();
    }
}

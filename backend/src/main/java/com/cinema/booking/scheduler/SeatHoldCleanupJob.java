package com.cinema.booking.scheduler;

import com.cinema.booking.service.SeatHoldService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Định kỳ thu hồi allocation ghế có hold đã hết hạn. */
@Component
public class SeatHoldCleanupJob {
    private final SeatHoldService seatHolds;

    public SeatHoldCleanupJob(SeatHoldService seatHolds) {
        this.seatHolds = seatHolds;
    }

    @Scheduled(fixedDelayString = "${booking.cleanup-delay-ms:30000}")
    public void run() {
        seatHolds.releaseExpiredHolds();
    }
}

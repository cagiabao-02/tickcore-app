package com.cinema.booking.scheduler;

import com.cinema.booking.service.BookingService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Định kỳ hết hạn đơn chờ, giải phóng ghế và lượt promotion đã giữ. */
@Component
public class PendingBookingExpireJob {
    private final BookingService bookings;

    public PendingBookingExpireJob(BookingService bookings) {
        this.bookings = bookings;
    }

    @Scheduled(fixedDelayString = "${booking.pending-cleanup-delay-ms:30000}")
    public void run() {
        bookings.expirePendingBookings();
    }
}

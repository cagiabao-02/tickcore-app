package com.cinema.booking.service;

import com.cinema.booking.dto.request.PaymentRequest;
import com.cinema.booking.dto.response.BookingResponse;
import com.cinema.booking.dto.response.PaymentSimulationResponse;
import com.cinema.booking.entity.Booking;
import com.cinema.booking.entity.BookingStatus;
import com.cinema.booking.entity.Payment;
import com.cinema.booking.entity.PaymentOutcome;
import com.cinema.booking.entity.PaymentStatus;
import com.cinema.booking.entity.User;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.BookingRepository;
import com.cinema.booking.repository.PaymentRepository;
import com.cinema.booking.repository.UserRepository;
import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Xử lý thanh toán giả lập chỉ khi được bật tường minh ở môi trường local/dev. */
@Service
public class PaymentService {

    private final BookingRepository bookings;
    private final PaymentRepository payments;
    private final UserRepository users;
    private final BookingService bookingService;
    private final boolean simulationEnabled;
    private final boolean developmentProfile;

    public PaymentService(BookingRepository bookings, PaymentRepository payments, UserRepository users,
        BookingService bookingService, @Value("${payment.simulation-enabled:false}") boolean simulationEnabled,
        @Value("${spring.profiles.active:}") String activeProfiles) {
        this.bookings = bookings;
        this.payments = payments;
        this.users = users;
        this.bookingService = bookingService;
        this.simulationEnabled = simulationEnabled;
        this.developmentProfile = Arrays.stream(activeProfiles.split(","))
            .map(String::trim).anyMatch("dev"::equals);
    }

    /** USER: ghi nhận kết quả giả lập, cập nhật trạng thái đơn; không tích hợp thanh toán thật. */
    @Transactional
    public PaymentSimulationResponse simulatePayment(PaymentRequest request) {
        if (!simulationEnabled || !developmentProfile) {
            throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "PAYMENT_SIMULATION_DISABLED",
                "Thanh toán mô phỏng chỉ được bật trong môi trường phát triển.");
        }
        User user = currentUser();
        Booking booking = bookings.findByIdForUpdate(request.bookingId())
            .orElseThrow(() -> new NotFoundException("BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt vé."));
        if (!booking.getUserId().equals(user.getId())) {
            throw new NotFoundException("BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt vé.");
        }
        if (booking.getStatus() == BookingStatus.CONFIRMED
            && payments.existsByBookingIdAndStatus(booking.getId(), PaymentStatus.SUCCESS)) {
            return new PaymentSimulationResponse(true, bookingService.getBookingDetail(booking.getId()));
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BusinessException(HttpStatus.CONFLICT, "INVALID_BOOKING_STATUS",
                "Đơn không còn chờ thanh toán.");
        }
        if (booking.getExpiresAt() == null || !booking.getExpiresAt().isAfter(Instant.now())) {
            throw new BusinessException(HttpStatus.GONE, "BOOKING_EXPIRED", "Thời gian thanh toán đã hết.");
        }

        PaymentStatus paymentStatus = request.outcome() == PaymentOutcome.SUCCESS
            ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
        payments.saveAndFlush(new Payment(booking.getId(), request.method(), paymentStatus,
            booking.getTotalAmount(), UUID.randomUUID().toString()));
        if (paymentStatus == PaymentStatus.SUCCESS) {
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setExpiresAt(null);
            bookings.saveAndFlush(booking);
        }
        BookingResponse response = bookingService.getBookingDetail(booking.getId());
        return new PaymentSimulationResponse(paymentStatus == PaymentStatus.SUCCESS, response);
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Cần đăng nhập để tiếp tục.");
        }
        return users.findByEmailIgnoreCase(authentication.getName())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED",
                "Phiên đăng nhập không hợp lệ."));
    }
}

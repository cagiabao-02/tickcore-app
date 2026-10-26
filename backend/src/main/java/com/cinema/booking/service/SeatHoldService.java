package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ SeatHoldService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class SeatHoldService {
    /** USER: kiểm tra ghế trống, giữ tối đa 8 ghế trong 10 phút, trả holdId và expiresAt. */
    public SeatHoldResponse holdSeats(Long id, SeatHoldRequest request) {
        // TODO: trong một transaction, khóa các ghế của suất theo thứ tự ID rồi kiểm tra và ghi hold nguyên tử.
        // Bảng ghế theo suất cần UNIQUE(showtime_id, seat_id); yêu cầu thua tranh chấp trả HTTP 409.
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** USER: kiểm tra chủ sở hữu và nhả các ghế đang giữ. */
    public MessageResponse releaseHold(Long holdId) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Nhả ghế hết hạn giữ; sẽ được job định kỳ gọi khi tự cài đặt. */
    public void releaseExpiredHolds() {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}

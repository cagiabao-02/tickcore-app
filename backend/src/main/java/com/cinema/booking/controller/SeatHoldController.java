package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.SeatHoldService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class SeatHoldController {
    private final SeatHoldService service;
    public SeatHoldController(SeatHoldService service) { this.service = service; }

    /** USER: kiểm tra ghế trống, giữ tối đa 8 ghế trong 10 phút, trả holdId và expiresAt. */
    @PostMapping("/showtimes/{id}/seat-holds")
    public SeatHoldResponse holdSeats(@PathVariable("id") Long id, @Valid @RequestBody SeatHoldRequest request) {
        return service.holdSeats(id, request);
    }

    /** USER: kiểm tra chủ sở hữu và nhả các ghế đang giữ. */
    @DeleteMapping("/seat-holds/{holdId}")
    public MessageResponse releaseHold(@PathVariable("holdId") Long holdId) {
        return service.releaseHold(holdId);
    }
}

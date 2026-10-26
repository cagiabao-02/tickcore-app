package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class BookingController {
    private final BookingService service;
    public BookingController(BookingService service) { this.service = service; }

    /** USER: kiểm tra hold còn hạn, giá combo và điều kiện mã, tạo đơn chờ. */
    @PostMapping("/bookings")
    public BookingResponse createBooking(@Valid @RequestBody CreateBookingRequest request) {
        return service.createBooking(request);
    }

    /** USER: lọc vé theo trạng thái và phân trang. */
    @GetMapping("/bookings/me")
    public PageResponse<BookingResponse> getMyBookings(@ModelAttribute SearchRequest query) {
        return service.getMyBookings(query);
    }

    /** USER: chỉ lấy đơn thuộc tài khoản hiện tại. */
    @GetMapping("/bookings/{id}")
    public BookingResponse getBookingDetail(@PathVariable("id") Long id) {
        return service.getBookingDetail(id);
    }

    /** USER: chỉ hủy vé của mình khi còn trên 2 giờ trước suất chiếu. */
    @PostMapping("/bookings/{id}/cancel")
    public BookingResponse cancelBooking(@PathVariable("id") Long id) {
        return service.cancelBooking(id);
    }
}

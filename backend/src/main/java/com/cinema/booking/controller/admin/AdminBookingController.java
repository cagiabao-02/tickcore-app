package com.cinema.booking.controller.admin;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class AdminBookingController {
    private final BookingService service;
    public AdminBookingController(BookingService service) { this.service = service; }

    /** ADMIN: lọc đơn theo ngày, phim, trạng thái. */
    @GetMapping("/admin/bookings")
    public PageResponse<BookingResponse> searchBookings(@ModelAttribute SearchRequest query) {
        return service.searchBookings(query);
    }

    /** ADMIN: hủy đơn và nhả ghế theo quy tắc quản trị. */
    @PostMapping("/admin/bookings/{id}/cancel")
    public BookingResponse cancelBookingAsAdmin(@PathVariable("id") Long id) {
        return service.cancelBookingAsAdmin(id);
    }
}

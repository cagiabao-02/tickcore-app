package com.cinema.booking.controller.admin;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.ShowtimeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class AdminShowtimeController {
    private final ShowtimeService service;
    public AdminShowtimeController(ShowtimeService service) { this.service = service; }

    /** ADMIN: lọc và phân trang showtimes. */
    @GetMapping("/admin/showtimes")
    public PageResponse<ShowtimeResponse> searchShowtimes(@ModelAttribute SearchRequest query) {
        return service.searchShowtimes(query);
    }

    /** ADMIN: tạo showtimes, kiểm tra dữ liệu và liên kết. */
    @PostMapping("/admin/showtimes")
    public ShowtimeResponse createShowtime(@Valid @RequestBody ShowtimeRequest request) {
        return service.createShowtime(request);
    }

    /** ADMIN: cập nhật showtimes; kiểm tra xung đột nếu là suất chiếu. */
    @PutMapping("/admin/showtimes/{id}")
    public ShowtimeResponse updateShowtime(@PathVariable("id") Long id, @Valid @RequestBody ShowtimeRequest request) {
        return service.updateShowtime(id, request);
    }

    /** ADMIN: xóa showtimes, kiểm tra các dữ liệu liên quan. */
    @DeleteMapping("/admin/showtimes/{id}")
    public MessageResponse deleteShowtime(@PathVariable("id") Long id) {
        return service.deleteShowtime(id);
    }

    /** ADMIN: API bổ sung cho yêu cầu giá vé chưa có trong bảng hợp đồng gốc. */
    @GetMapping("/admin/pricing")
    public List<TicketPricingResponse> getPricing() {
        return service.getPricing();
    }

    /** ADMIN: lưu giá ghế, phụ thu định dạng và cuối tuần. */
    @PutMapping("/admin/pricing")
    public List<TicketPricingResponse> savePricing(@Valid @RequestBody List<TicketPricingResponse> request) {
        return service.savePricing(request);
    }
}

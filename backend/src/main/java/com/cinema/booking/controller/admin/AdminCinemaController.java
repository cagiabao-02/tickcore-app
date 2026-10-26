package com.cinema.booking.controller.admin;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.CinemaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class AdminCinemaController {
    private final CinemaService service;
    public AdminCinemaController(CinemaService service) { this.service = service; }

    /** ADMIN: lọc và phân trang cinemas. */
    @GetMapping("/admin/cinemas")
    public PageResponse<CinemaResponse> searchCinemas(@ModelAttribute SearchRequest query) {
        return service.searchCinemas(query);
    }

    /** ADMIN: tạo cinemas, kiểm tra dữ liệu và liên kết. */
    @PostMapping("/admin/cinemas")
    public CinemaResponse createCinema(@Valid @RequestBody CinemaRequest request) {
        return service.createCinema(request);
    }

    /** ADMIN: cập nhật cinemas; kiểm tra xung đột nếu là suất chiếu. */
    @PutMapping("/admin/cinemas/{id}")
    public CinemaResponse updateCinema(@PathVariable("id") Long id, @Valid @RequestBody CinemaRequest request) {
        return service.updateCinema(id, request);
    }

    /** ADMIN: xóa cinemas, kiểm tra các dữ liệu liên quan. */
    @DeleteMapping("/admin/cinemas/{id}")
    public MessageResponse deleteCinema(@PathVariable("id") Long id) {
        return service.deleteCinema(id);
    }
}

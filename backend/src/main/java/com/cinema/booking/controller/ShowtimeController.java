package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.ShowtimeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class ShowtimeController {
    private final ShowtimeService service;
    public ShowtimeController(ShowtimeService service) { this.service = service; }

    /** Công khai: lọc lịch theo phim, rạp và ngày. */
    @GetMapping("/showtimes")
    public List<ShowtimeResponse> searchShowtimes(@ModelAttribute ShowtimeSearchRequest query) {
        return service.searchShowtimes(query);
    }

    /** Công khai: lấy thông tin suất chiếu. */
    @GetMapping("/showtimes/{id}")
    public ShowtimeResponse getShowtime(@PathVariable("id") Long id) {
        return service.getShowtime(id);
    }

    /** Công khai: lấy ghế cùng trạng thái và giá theo cấu hình. */
    @GetMapping("/showtimes/{id}/seats")
    public SeatMapResponse getSeatMap(@PathVariable("id") Long id) {
        return service.getSeatMap(id);
    }
}

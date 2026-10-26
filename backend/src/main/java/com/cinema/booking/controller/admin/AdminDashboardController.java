package com.cinema.booking.controller.admin;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.DashboardService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class AdminDashboardController {
    private final DashboardService service;
    public AdminDashboardController(DashboardService service) { this.service = service; }

    /** ADMIN: thống kê theo khoảng thời gian. */
    @GetMapping("/admin/dashboard/summary")
    public DashboardSummaryResponse getSummary(@ModelAttribute DateRangeRequest query) {
        return service.getSummary(query);
    }

    /** ADMIN: thống kê theo khoảng thời gian. */
    @GetMapping("/admin/dashboard/revenue")
    public List<RevenueByDayResponse> getRevenueByDay(@ModelAttribute DateRangeRequest query) {
        return service.getRevenueByDay(query);
    }

    /** ADMIN: thống kê theo khoảng thời gian. */
    @GetMapping("/admin/dashboard/top-movies")
    public List<TopMovieResponse> getTopMovies(@ModelAttribute DateRangeRequest query) {
        return service.getTopMovies(query);
    }

    /** ADMIN: thống kê theo khoảng thời gian. */
    @GetMapping("/admin/dashboard/occupancy")
    public List<OccupancyByCinemaResponse> getOccupancyByCinema(@ModelAttribute DateRangeRequest query) {
        return service.getOccupancyByCinema(query);
    }
}

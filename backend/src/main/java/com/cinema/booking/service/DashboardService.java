package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ DashboardService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class DashboardService {
    /** ADMIN: thống kê theo khoảng thời gian. */
    public DashboardSummaryResponse getSummary(DateRangeRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: thống kê theo khoảng thời gian. */
    public List<RevenueByDayResponse> getRevenueByDay(DateRangeRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: thống kê theo khoảng thời gian. */
    public List<TopMovieResponse> getTopMovies(DateRangeRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: thống kê theo khoảng thời gian. */
    public List<OccupancyByCinemaResponse> getOccupancyByCinema(DateRangeRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}

package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ CinemaService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class CinemaService {
    /** Công khai: liệt kê thành phố có rạp. */
    public List<CityResponse> listCities() {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Công khai: lọc rạp theo thành phố. */
    public List<CinemaResponse> listCinemas(Long city) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Công khai: lấy chi tiết rạp. */
    public CinemaResponse getCinema(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: lọc và phân trang cinemas. */
    public PageResponse<CinemaResponse> searchCinemas(SearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: tạo cinemas, kiểm tra dữ liệu và liên kết. */
    public CinemaResponse createCinema(CinemaRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: cập nhật cinemas; kiểm tra xung đột nếu là suất chiếu. */
    public CinemaResponse updateCinema(Long id, CinemaRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: xóa cinemas, kiểm tra các dữ liệu liên quan. */
    public MessageResponse deleteCinema(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}

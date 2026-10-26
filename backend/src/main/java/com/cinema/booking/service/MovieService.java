package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ MovieService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class MovieService {
    /** Công khai: lọc phim theo thể loại, ngôn ngữ, tuổi, tìm kiếm và phân trang. */
    public PageResponse<MovieResponse> searchMovies(MovieSearchRequest query) {
        // TODO: chủ dự án tự cài đặt.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
    /** ADMIN: lọc và phân trang movies. */
    public PageResponse<MovieResponse> searchMovies(SearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Công khai: lấy thông tin phim và điểm đánh giá. */
    public MovieResponse getMovieDetail(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Công khai: liệt kê thể loại. */
    public List<GenreResponse> listGenres() {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: tạo movies, kiểm tra dữ liệu và liên kết. */
    public MovieResponse createMovie(MovieRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: cập nhật movies; kiểm tra xung đột nếu là suất chiếu. */
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: xóa movies, kiểm tra các dữ liệu liên quan. */
    public MessageResponse deleteMovie(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}

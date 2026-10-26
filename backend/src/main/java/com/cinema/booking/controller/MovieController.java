package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.MovieService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class MovieController {
    private final MovieService service;
    public MovieController(MovieService service) { this.service = service; }

    /** Công khai: lọc, tìm kiếm, sắp xếp và phân trang phim. */
    @GetMapping("/movies")
    public PageResponse<MovieResponse> searchMovies(@ModelAttribute MovieSearchRequest query) {
        return service.searchMovies(query);
    }

    /** Công khai: lấy thông tin phim và điểm đánh giá. */
    @GetMapping("/movies/{id}")
    public MovieResponse getMovieDetail(@PathVariable("id") Long id) {
        return service.getMovieDetail(id);
    }

    /** Công khai: liệt kê thể loại. */
    @GetMapping("/genres")
    public List<GenreResponse> listGenres() {
        return service.listGenres();
    }
}

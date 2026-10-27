package com.cinema.booking.controller.admin;

import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.MovieService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật.
 */
@RestController
@RequestMapping("/api/v1")
public class AdminMovieController {
    private final MovieService service;

    public AdminMovieController(MovieService service) {
        this.service = service;
    }

    /** ADMIN: lọc và phân trang movies. */
    @GetMapping("/admin/movies")
    public PageResponse<MovieResponse> searchMovies(@ModelAttribute SearchRequest query) {
        return service.searchMovies(query);
    }

    /** ADMIN: tạo movies, kiểm tra dữ liệu và liên kết. */
    @PostMapping("/admin/movies")
    public MovieResponse createMovie(@Valid @RequestBody MovieRequest request) {
        return service.createMovie(request);
    }

    /** ADMIN: cập nhật movies; kiểm tra xung đột nếu là suất chiếu. */
    @PutMapping("/admin/movies/{id}")
    public MovieResponse updateMovie(@PathVariable("id") Long id, @Valid @RequestBody MovieRequest request) {
        return service.updateMovie(id, request);
    }

    /** ADMIN: xóa movies, kiểm tra các dữ liệu liên quan. */
    @DeleteMapping("/admin/movies/{id}")
    public MessageResponse deleteMovie(@PathVariable("id") Long id) {
        return service.deleteMovie(id);
    }
}

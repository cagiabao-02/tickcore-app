package com.cinema.booking.controller;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class ReviewController {
    private final ReviewService service;
    public ReviewController(ReviewService service) { this.service = service; }

    /** Công khai: phân trang, sắp xếp, không trả đánh giá bị ẩn. */
    @GetMapping("/movies/{id}/reviews")
    public PageResponse<ReviewResponse> listReviews(@PathVariable("id") Long id, @ModelAttribute ReviewSearchRequest query) {
        return service.listReviews(id, query);
    }

    /** USER: chỉ tạo khi có vé đã chiếu và chưa đánh giá phim. */
    @PostMapping("/movies/{id}/reviews")
    public ReviewResponse createReview(@PathVariable("id") Long id, @Valid @RequestBody ReviewRequest request) {
        return service.createReview(id, request);
    }

    /** USER: chỉ sửa đánh giá của mình. */
    @PutMapping("/reviews/{id}")
    public ReviewResponse updateReview(@PathVariable("id") Long id, @Valid @RequestBody ReviewRequest request) {
        return service.updateReview(id, request);
    }

    /** USER: chỉ xóa đánh giá của mình. */
    @DeleteMapping("/reviews/{id}")
    public MessageResponse deleteReview(@PathVariable("id") Long id) {
        return service.deleteReview(id);
    }
}

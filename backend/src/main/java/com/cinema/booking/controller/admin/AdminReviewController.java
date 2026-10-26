package com.cinema.booking.controller.admin;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import com.cinema.booking.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
/** Khai báo hợp đồng API; quyền truy cập sẽ được cấu hình khi cài đặt bảo mật. */
@RestController
@RequestMapping("/api/v1")
public class AdminReviewController {
    private final ReviewService service;
    public AdminReviewController(ReviewService service) { this.service = service; }

    /** ADMIN: phân trang đánh giá gồm cả mục bị ẩn. */
    @GetMapping("/admin/reviews")
    public PageResponse<ReviewResponse> searchReviews(@ModelAttribute SearchRequest query) {
        return service.searchReviews(query);
    }

    /** ADMIN: ẩn hoặc hiện đánh giá vi phạm. */
    @PutMapping("/admin/reviews/{id}/hide")
    public ReviewResponse hideReview(@PathVariable("id") Long id) {
        return service.hideReview(id);
    }

    /** ADMIN: xóa đánh giá vi phạm. */
    @DeleteMapping("/admin/reviews/{id}")
    public MessageResponse deleteReviewAsAdmin(@PathVariable("id") Long id) {
        return service.deleteReviewAsAdmin(id);
    }
}

package com.cinema.booking.service;

import java.util.List;
import com.cinema.booking.dto.request.*;
import com.cinema.booking.dto.response.*;
import org.springframework.stereotype.Service;
/** Khung dịch vụ ReviewService; toàn bộ nghiệp vụ do chủ dự án tự viết. */
@Service
public class ReviewService {
    /** Công khai: phân trang, sắp xếp, không trả đánh giá bị ẩn. */
    public PageResponse<ReviewResponse> listReviews(Long id, ReviewSearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** USER: chỉ tạo khi có vé đã chiếu và chưa đánh giá phim. */
    public ReviewResponse createReview(Long id, ReviewRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** USER: chỉ sửa đánh giá của mình. */
    public ReviewResponse updateReview(Long id, ReviewRequest request) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** USER: chỉ xóa đánh giá của mình. */
    public MessageResponse deleteReview(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: phân trang đánh giá gồm cả mục bị ẩn. */
    public PageResponse<ReviewResponse> searchReviews(SearchRequest query) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: ẩn hoặc hiện đánh giá vi phạm. */
    public ReviewResponse hideReview(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** ADMIN: xóa đánh giá vi phạm. */
    public MessageResponse deleteReviewAsAdmin(Long id) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }

    /** Kiểm tra người dùng hiện tại có vé đã chiếu của phim và chưa đánh giá. */
    public Boolean canUserReview(Long movieId) {
        // TODO: chủ dự án tự cài đặt; service chỉ gọi repository và trả DTO.
        throw new UnsupportedOperationException("Chưa cài đặt");
    }
}

package com.cinema.booking.service;

import com.cinema.booking.dto.request.ReviewRequest;
import com.cinema.booking.dto.request.ReviewSearchRequest;
import com.cinema.booking.dto.request.SearchRequest;
import com.cinema.booking.dto.response.MessageResponse;
import com.cinema.booking.dto.response.PageResponse;
import com.cinema.booking.dto.response.ReviewResponse;
import com.cinema.booking.entity.BookingStatus;
import com.cinema.booking.entity.Movie;
import com.cinema.booking.entity.Review;
import com.cinema.booking.entity.User;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.BookingRepository;
import com.cinema.booking.repository.MovieRepository;
import com.cinema.booking.repository.ReviewRepository;
import com.cinema.booking.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Đánh giá được giới hạn cho khách đã xem phim và giữ trạng thái kiểm duyệt. */
@Service
public class ReviewService {
    private final ReviewRepository reviews;
    private final MovieRepository movies;
    private final BookingRepository bookings;
    private final UserRepository users;

    public ReviewService(ReviewRepository reviews, MovieRepository movies, BookingRepository bookings, UserRepository users) {
        this.reviews = reviews;
        this.movies = movies;
        this.bookings = bookings;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> listReviews(Long id, ReviewSearchRequest query) {
        findMovie(id);
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(100, Math.max(1, query.size() == null ? 5 : query.size()));
        Sort sort = "rating".equalsIgnoreCase(query.sort())
            ? Sort.by(Sort.Order.desc("rating"), Sort.Order.desc("createdAt"))
            : Sort.by(Sort.Order.desc("createdAt"));
        Page<Review> found = reviews.findByMovieIdAndHiddenFalse(id, PageRequest.of(page, size, sort));
        return page(found);
    }

    @Transactional
    public ReviewResponse createReview(Long movieId, ReviewRequest request) {
        findMovie(movieId);
        User user = currentUser();
        if (!eligible(user.getId(), movieId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "WATCH_REQUIRED", "Cần có vé đã thanh toán của suất đã chiếu để đánh giá phim.");
        }
        if (reviews.existsByUserIdAndMovieId(user.getId(), movieId)) {
            throw new BusinessException(HttpStatus.CONFLICT, "REVIEW_EXISTS", "Bạn đã đánh giá phim này.");
        }
        validate(request);
        try {
            return response(reviews.saveAndFlush(Review.create(user.getId(), movieId, request.rating(), request.comment().trim())));
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new BusinessException(HttpStatus.CONFLICT, "REVIEW_EXISTS", "Bạn đã đánh giá phim này.");
        }
    }

    @Transactional
    public ReviewResponse updateReview(Long id, ReviewRequest request) {
        Review review = reviews.findByIdForUpdate(id)
            .orElseThrow(() -> new NotFoundException("REVIEW_NOT_FOUND", "Không tìm thấy đánh giá."));
        User user = currentUser();
        if (!review.getUserId().equals(user.getId())) throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thể sửa đánh giá này.");
        validate(request);
        review.setRating(request.rating());
        review.setComment(request.comment().trim());
        return response(reviews.saveAndFlush(review));
    }

    @Transactional
    public MessageResponse deleteReview(Long id) {
        User user = currentUser();
        Review review = reviews.findById(id).orElseThrow(() -> new NotFoundException("REVIEW_NOT_FOUND", "Không tìm thấy đánh giá."));
        if (!review.getUserId().equals(user.getId())) throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thể xóa đánh giá này.");
        reviews.delete(review);
        return new MessageResponse("Đã xóa đánh giá.");
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> searchReviews(SearchRequest query) {
        int page = Math.max(0, query.page() == null ? 0 : query.page());
        int size = Math.min(100, Math.max(1, query.size() == null ? 20 : query.size()));
        Boolean hidden = parseHidden(query.status());
        Page<Review> found = reviews.searchAdmin(trim(query.keyword()), query.movieId(), hidden,
            PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt"))));
        return page(found);
    }

    @Transactional
    public ReviewResponse hideReview(Long id) {
        Review review = findReviewForUpdate(id);
        review.setHidden(!review.isHidden());
        return response(reviews.saveAndFlush(review));
    }

    @Transactional
    public MessageResponse deleteReviewAsAdmin(Long id) {
        Review review = findReviewForUpdate(id);
        reviews.delete(review);
        return new MessageResponse("Đã xóa đánh giá.");
    }

    @Transactional(readOnly = true)
    public Boolean canUserReview(Long movieId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) return false;
        User user = users.findByEmailIgnoreCase(authentication.getName()).orElse(null);
        return user != null && eligible(user.getId(), movieId) && !reviews.existsByUserIdAndMovieId(user.getId(), movieId);
    }

    private boolean eligible(Long userId, Long movieId) {
        return bookings.countWatchedConfirmedByUserAndMovie(userId, movieId, BookingStatus.CONFIRMED, Instant.now()) > 0;
    }
    private void validate(ReviewRequest request) {
        if (request.rating() == null || request.rating() < 1 || request.rating() > 5) invalid("rating", "Điểm đánh giá phải từ 1 đến 5.");
        String comment = trim(request.comment());
        if (comment == null || comment.length() > 2000) invalid("comment", "Nội dung đánh giá không được trống và tối đa 2000 ký tự.");
    }
    private PageResponse<ReviewResponse> page(Page<Review> found) {
        return new PageResponse<>(found.getContent().stream().map(this::response).toList(), found.getNumber(),
            found.getSize(), found.getTotalElements(), found.getTotalPages());
    }
    private ReviewResponse response(Review review) {
        User user = users.findById(review.getUserId()).orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Không tìm thấy người dùng."));
        return new ReviewResponse(review.getId(), user.getId(), user.getFullName(), user.getAvatarUrl(), review.getMovieId(),
            review.getRating(), review.getComment(), review.isHidden(), review.getCreatedAt().toString(), review.getUpdatedAt().toString());
    }
    private Movie findMovie(Long id) {
        return movies.findById(id).orElseThrow(() -> new NotFoundException("MOVIE_NOT_FOUND", "Không tìm thấy phim."));
    }
    private Review findReviewForUpdate(Long id) {
        return reviews.findByIdForUpdate(id).orElseThrow(() -> new NotFoundException("REVIEW_NOT_FOUND", "Không tìm thấy đánh giá."));
    }
    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName()))
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Cần đăng nhập để tiếp tục.");
        return users.findByEmailIgnoreCase(authentication.getName())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Phiên đăng nhập không hợp lệ."));
    }
    private Boolean parseHidden(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) return null;
        if ("HIDDEN".equalsIgnoreCase(status) || "true".equalsIgnoreCase(status)) return true;
        if ("VISIBLE".equalsIgnoreCase(status) || "false".equalsIgnoreCase(status)) return false;
        invalid("status", "Bộ lọc trạng thái không hợp lệ.");
        return null;
    }
    private String trim(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private void invalid(String field, String message) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_REVIEW_" + field.toUpperCase(Locale.ROOT), message);
    }
}

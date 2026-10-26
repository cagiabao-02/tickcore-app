package com.cinema.booking.dto.request;

import java.util.List;
import java.util.Map;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Movie; trường do máy chủ tạo có thể để null. */
public record MovieRequest(
    Long id,
    String title,
    String originalTitle,
    String posterUrl,
    String bannerUrl,
    String trailerUrl,
    String description,
    Integer duration,
    String releaseDate,
    String endDate,
    String language,
    String ageRating,
    String director,
    String cast,
    String status,
    List<GenreResponse> genres,
    Double averageRating,
    Integer totalReviews
) {}

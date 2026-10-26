package com.cinema.booking.dto.response;

import java.util.List;
import java.util.Map;
/** Dữ liệu MovieResponse; tên trường và kiểu JSON khớp frontend/src/types/index.ts. */
public record MovieResponse(
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

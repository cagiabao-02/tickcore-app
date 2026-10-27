package com.cinema.booking.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import com.cinema.booking.dto.response.*;
/** Dữ liệu quản trị Movie; trường do máy chủ tạo có thể để null. */
public record MovieRequest(
    Long id,
    @NotBlank @Size(max = 240) String title,
    @Size(max = 240) String originalTitle,
    @Size(max = 2048) String posterUrl,
    @Size(max = 2048) String bannerUrl,
    @Size(max = 2048) String trailerUrl,
    @Size(max = 16000) String description,
    @NotNull @Min(1) @Max(600) Integer duration,
    @NotBlank @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$") String releaseDate,
    @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$") String endDate,
    @NotBlank @Size(max = 80) String language,
    @NotBlank @Size(max = 24) String ageRating,
    @Size(max = 240) String director,
    @Size(max = 16000) String cast,
    String status,
    @Size(max = 30) List<GenreResponse> genres,
    Double averageRating,
    Integer totalReviews
) {}

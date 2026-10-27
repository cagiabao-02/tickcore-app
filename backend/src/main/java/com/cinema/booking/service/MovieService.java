package com.cinema.booking.service;

import com.cinema.booking.dto.request.MovieRequest;
import com.cinema.booking.dto.request.MovieSearchRequest;
import com.cinema.booking.dto.request.SearchRequest;
import com.cinema.booking.dto.response.GenreResponse;
import com.cinema.booking.dto.response.MessageResponse;
import com.cinema.booking.dto.response.MovieResponse;
import com.cinema.booking.dto.response.PageResponse;
import com.cinema.booking.entity.Genre;
import com.cinema.booking.entity.Movie;
import com.cinema.booking.entity.MovieStatus;
import com.cinema.booking.exception.BusinessException;
import com.cinema.booking.exception.NotFoundException;
import com.cinema.booking.repository.GenreRepository;
import com.cinema.booking.repository.MovieRepository;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.function.Function;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Nghiệp vụ đọc và quản trị phim; các trường đánh giá luôn lấy từ review đã lưu. */
@Service
public class MovieService {
    private final MovieRepository movies;
    private final GenreRepository genres;

    public MovieService(MovieRepository movies, GenreRepository genres) {
        this.movies = movies;
        this.genres = genres;
    }

    @Transactional(readOnly = true)
    public PageResponse<MovieResponse> searchMovies(MovieSearchRequest query) {
        return search(query.status(), query.genre(), query.language(), query.ageRating(), query.keyword(),
            query.sort(), query.page(), query.size());
    }

    @Transactional(readOnly = true)
    public PageResponse<MovieResponse> searchMovies(SearchRequest query) {
        return search(query.status(), null, null, null, query.keyword(), "releaseDate", query.page(), query.size());
    }

    private PageResponse<MovieResponse> search(String rawStatus, String rawGenre, String language,
        String ageRating, String keyword, String sort, Integer page, Integer size) {
        MovieStatus status = parseStatus(rawStatus);
        String genre = normalize(rawGenre);
        String normalizedLanguage = normalize(language);
        String normalizedAge = normalize(ageRating);
        String normalizedKeyword = normalize(keyword);
        String sortField = switch (sort == null ? "" : sort.toLowerCase(Locale.ROOT)) {
            case "title" -> "title";
            case "duration" -> "duration";
            default -> "releaseDate";
        };
        int pageNumber = Math.max(0, page == null ? 0 : page);
        int pageSize = Math.min(100, Math.max(1, size == null ? 20 : size));
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, sortField));
        Page<Movie> found = movies.search(status, genre, normalizedLanguage, normalizedAge, normalizedKeyword, pageable);
        return page(found, this::toResponse);
    }

    @Transactional(readOnly = true)
    public MovieResponse getMovieDetail(Long id) {
        return toResponse(findMovie(id));
    }

    @Transactional(readOnly = true)
    public List<GenreResponse> listGenres() {
        return genres.findAll(Sort.by(Sort.Direction.ASC, "name")).stream().map(this::toResponse).toList();
    }

    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        Movie movie = Movie.create();
        apply(movie, request);
        return toResponse(movies.saveAndFlush(movie));
    }

    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = findMovie(id);
        apply(movie, request);
        return toResponse(movies.saveAndFlush(movie));
    }

    @Transactional
    public MessageResponse deleteMovie(Long id) {
        Movie movie = findMovie(id);
        try {
            movies.delete(movie);
            movies.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new BusinessException(HttpStatus.CONFLICT, "MOVIE_IN_USE",
                "Phim đã có suất chiếu hoặc dữ liệu liên quan nên không thể xóa.");
        }
        return new MessageResponse("Đã xóa phim.");
    }

    private void apply(Movie movie, MovieRequest request) {
        String title = required(request.title(), "title");
        Integer duration = request.duration();
        if (duration == null || duration < 1 || duration > 600) invalid("duration", "Thời lượng phim phải từ 1 đến 600 phút.");
        LocalDate releaseDate = parseDate(request.releaseDate(), "releaseDate", true);
        LocalDate endDate = parseDate(request.endDate(), "endDate", false);
        if (endDate != null && endDate.isBefore(releaseDate)) invalid("endDate", "Ngày kết thúc không được trước ngày khởi chiếu.");
        movie.setTitle(title);
        movie.setOriginalTitle(trimToNull(request.originalTitle()));
        movie.setPosterUrl(trimToNull(request.posterUrl()));
        movie.setBannerUrl(trimToNull(request.bannerUrl()));
        movie.setTrailerUrl(trimToNull(request.trailerUrl()));
        movie.setDescription(trimToNull(request.description()));
        movie.setDuration(duration);
        movie.setReleaseDate(releaseDate);
        movie.setEndDate(endDate);
        movie.setLanguage(required(request.language(), "language"));
        movie.setAgeRating(required(request.ageRating(), "ageRating"));
        movie.setDirector(trimToNull(request.director()));
        movie.setCast(trimToNull(request.cast()));
        movie.setStatus(parseStatus(required(request.status(), "status")));
        Set<Long> ids = request.genres() == null ? Set.of() : request.genres().stream()
            .map(GenreResponse::id).filter(java.util.Objects::nonNull).collect(java.util.stream.Collectors.toSet());
        if (request.genres() != null && ids.size() != request.genres().size()) {
            invalid("genres", "Mỗi thể loại phải có id hợp lệ và không được lặp.");
        }
        List<Genre> resolved = genres.findAllById(ids);
        if (resolved.size() != ids.size()) invalid("genres", "Có thể loại phim không tồn tại.");
        movie.setGenres(new HashSet<>(resolved));
    }

    private MovieResponse toResponse(Movie movie) {
        List<GenreResponse> movieGenres = movie.getGenres().stream().sorted(SortComparators.GENRE)
            .map(this::toResponse).toList();
        Double average = movies.averageRating(movie.getId());
        return new MovieResponse(movie.getId(), movie.getTitle(), movie.getOriginalTitle(), movie.getPosterUrl(),
            movie.getBannerUrl(), movie.getTrailerUrl(), movie.getDescription(), movie.getDuration(),
            movie.getReleaseDate().toString(), movie.getEndDate() == null ? null : movie.getEndDate().toString(),
            movie.getLanguage(), movie.getAgeRating(), movie.getDirector(), movie.getCast(), movie.getStatus().name(),
            movieGenres, average == null ? 0d : Math.round(average * 10d) / 10d, movies.reviewCount(movie.getId()));
    }

    private GenreResponse toResponse(Genre genre) { return new GenreResponse(genre.getId(), genre.getName(), genre.getSlug()); }
    private Movie findMovie(Long id) {
        return movies.findById(id).orElseThrow(() -> new NotFoundException("MOVIE_NOT_FOUND", "Không tìm thấy phim."));
    }
    private MovieStatus parseStatus(String raw) {
        String normalized = normalize(raw);
        if (normalized == null) return null;
        try { return MovieStatus.valueOf(normalized.toUpperCase(Locale.ROOT)); }
        catch (IllegalArgumentException ex) { invalid("status", "Trạng thái phim không hợp lệ."); return null; }
    }
    private LocalDate parseDate(String raw, String field, boolean required) {
        String value = normalize(raw);
        if (value == null && !required) return null;
        if (value == null) { invalid(field, "Trường ngày không được để trống."); return null; }
        try { return LocalDate.parse(value); }
        catch (DateTimeParseException ex) { invalid(field, "Ngày phải theo định dạng YYYY-MM-DD."); return null; }
    }
    private String required(String value, String field) {
        String result = normalize(value);
        if (result == null) invalid(field, "Trường này không được để trống.");
        return result;
    }
    private String normalize(String value) { return trimToNull(value); }
    private String trimToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private void invalid(String field, String message) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_MOVIE_" + field.toUpperCase(Locale.ROOT), message);
    }
    private <T, R> PageResponse<R> page(Page<T> source, Function<T, R> mapper) {
        return new PageResponse<>(source.getContent().stream().map(mapper).toList(), source.getNumber(),
            source.getSize(), source.getTotalElements(), source.getTotalPages());
    }
    private static final class SortComparators {
        private static final java.util.Comparator<Genre> GENRE = java.util.Comparator.comparing(Genre::getName, String.CASE_INSENSITIVE_ORDER);
    }
}

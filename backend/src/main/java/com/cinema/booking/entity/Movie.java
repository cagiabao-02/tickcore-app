package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Phim và các thể loại; doanh thu/điểm đánh giá được tính từ dữ liệu nghiệp vụ. */
@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Movie {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 240) private String title;
    @Column(name = "original_title", length = 240) private String originalTitle;
    @Column(name = "poster_url", length = 2048) private String posterUrl;
    @Column(name = "banner_url", length = 2048) private String bannerUrl;
    @Column(name = "trailer_url", length = 2048) private String trailerUrl;
    @Column(columnDefinition = "text") private String description;
    @Column(name = "duration_minutes", nullable = false) private Integer duration;
    @Column(name = "release_date", nullable = false) private LocalDate releaseDate;
    @Column(name = "end_date") private LocalDate endDate;
    @Column(nullable = false, length = 80) private String language;
    @Column(name = "age_rating", nullable = false, length = 24) private String ageRating;
    @Column(length = 240) private String director;
    @Column(name = "cast_list", columnDefinition = "text") private String cast;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private MovieStatus status;

    @ManyToMany
    @JoinTable(name = "movie_genres", joinColumns = @JoinColumn(name = "movie_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id"))
    private Set<Genre> genres = new HashSet<>();

    /** Factory for service-layer creation while keeping the JPA constructor protected. */
    public static Movie create() { return new Movie(); }
}

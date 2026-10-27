package com.cinema.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Suất chiếu lưu thời điểm theo UTC; kiểm tra giao nhau thực hiện trong service. */
@Entity @Table(name = "showtimes") @Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Showtime {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "movie_id", nullable = false) private Long movieId;
    @Column(name = "room_id", nullable = false) private Long roomId;
    @Column(name = "start_time", nullable = false) private Instant startTime;
    @Column(name = "end_time", nullable = false) private Instant endTime;
    @Convert(converter = ShowFormatConverter.class) @Column(nullable = false, length = 24) private ShowFormat format;
    @Enumerated(EnumType.STRING) @Column(name = "subtitle_type", nullable = false, length = 40) private SubtitleType subtitleType;
    @Column(name = "base_price", nullable = false) private Long basePrice;
    @Column(nullable = false) private boolean active = true;

    public static Showtime create() { return new Showtime(); }
}

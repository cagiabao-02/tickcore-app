package com.cinema.booking.repository;

import com.cinema.booking.entity.Showtime;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    boolean existsByRoomId(Long roomId);
    long countByActiveTrueAndStartTimeGreaterThanEqualAndStartTimeLessThan(Instant from, Instant to);
    List<Showtime> findByActiveTrueAndStartTimeGreaterThanEqualAndStartTimeLessThanOrderByStartTimeAsc(Instant from, Instant to);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Showtime s where s.id = :id")
    Optional<Showtime> findByIdForUpdate(@Param("id") Long id);

    @Query("select s from Showtime s, Room r where r.id = s.roomId and s.active = true and r.active = true " +
        "and (:movieId is null or s.movieId = :movieId) and (:cinemaId is null or r.cinemaId = :cinemaId) " +
        "and (:fromTime is null or s.startTime >= :fromTime) and (:toTime is null or s.startTime < :toTime)")
    List<Showtime> searchPublic(@Param("movieId") Long movieId, @Param("cinemaId") Long cinemaId,
        @Param("fromTime") Instant fromTime, @Param("toTime") Instant toTime, Pageable pageable);

    @Query("select s from Showtime s, Room r where r.id = s.roomId " +
        "and (:movieId is null or s.movieId = :movieId) and (:cinemaId is null or r.cinemaId = :cinemaId) " +
        "and (:fromTime is null or s.startTime >= :fromTime) and (:toTime is null or s.startTime < :toTime)")
    Page<Showtime> searchAdmin(@Param("movieId") Long movieId, @Param("cinemaId") Long cinemaId,
        @Param("fromTime") Instant fromTime, @Param("toTime") Instant toTime, Pageable pageable);

    @Query("select count(s) from Showtime s where s.active = true and s.roomId = :roomId " +
        "and s.startTime < :endTime and s.endTime > :startTime and (:excludeId is null or s.id <> :excludeId)")
    long countOverlaps(@Param("roomId") Long roomId, @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime, @Param("excludeId") Long excludeId);
}

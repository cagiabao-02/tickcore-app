package com.cinema.booking.repository;

import com.cinema.booking.entity.Room;
import java.util.List;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Room r where r.id = :id")
    Optional<Room> findByIdForUpdate(@Param("id") Long id);
    List<Room> findByCinemaIdOrderByNameAsc(Long cinemaId);
    boolean existsByCinemaIdAndNameIgnoreCase(Long cinemaId, String name);
    boolean existsByCinemaIdAndNameIgnoreCaseAndIdNot(Long cinemaId, String name, Long id);
    long countByCinemaId(Long cinemaId);
    @Query("select r from Room r where (:cinemaId is null or r.cinemaId = :cinemaId) and " +
        "(:keyword is null or lower(r.name) like lower(concat('%', :keyword, '%')))")
    Page<Room> search(@Param("cinemaId") Long cinemaId, @Param("keyword") String keyword, Pageable pageable);
}

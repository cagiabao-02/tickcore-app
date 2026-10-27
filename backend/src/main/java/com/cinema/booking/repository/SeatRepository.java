package com.cinema.booking.repository;

import com.cinema.booking.entity.Seat;
import com.cinema.booking.entity.SeatType;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Truy vấn sơ đồ ghế và khóa ghế theo thứ tự ID trong lúc tạo hold. */
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByRoomIdOrderByRowLabelAscSeatNumberAsc(Long roomId);
    List<Seat> findByRoomIdAndActiveTrueOrderByRowLabelAscSeatNumberAsc(Long roomId);
    long countByRoomIdAndActiveTrueAndSeatTypeNot(Long roomId, SeatType excludedType);
    boolean existsByRoomId(Long roomId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select seat from Seat seat where seat.id in :ids order by seat.id")
    List<Seat> findAllByIdForUpdate(@Param("ids") Collection<Long> ids);
}

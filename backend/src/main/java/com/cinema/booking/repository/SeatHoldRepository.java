package com.cinema.booking.repository;

import com.cinema.booking.entity.SeatHold;
import com.cinema.booking.entity.HoldStatus;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.List;

/** Truy vấn hold sở hữu bởi user và cập nhật trạng thái hết hạn theo lô. */
public interface SeatHoldRepository extends JpaRepository<SeatHold, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select hold from SeatHold hold where hold.id = :id")
    Optional<SeatHold> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select hold from SeatHold hold where hold.status = :status and hold.expiresAt <= :now " +
        "order by hold.expiresAt")
    List<SeatHold> findExpiredForUpdate(@Param("status") HoldStatus status,
        @Param("now") Instant now, Pageable pageable);
}

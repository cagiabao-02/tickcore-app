package com.cinema.booking.repository;

import com.cinema.booking.entity.BookingSeat;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Truy vấn vé theo đơn hoặc QR; khóa ticket row để chặn check-in lặp đồng thời. */
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {
    boolean existsBySeatId(Long seatId);
    boolean existsByBookingIdAndCheckedInAtIsNotNull(Long bookingId);
    List<BookingSeat> findByBookingIdOrderById(Long bookingId);
    List<BookingSeat> findByBookingIdIn(Iterable<Long> bookingIds);
    Optional<BookingSeat> findByTicketCode(String ticketCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select ticket from BookingSeat ticket where ticket.ticketCode = :ticketCode")
    Optional<BookingSeat> findByTicketCodeForUpdate(@Param("ticketCode") String ticketCode);
}

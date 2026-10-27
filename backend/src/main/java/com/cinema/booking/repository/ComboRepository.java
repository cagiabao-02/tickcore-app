package com.cinema.booking.repository;

import com.cinema.booking.entity.Combo;
import jakarta.persistence.LockModeType;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Truy vấn combo còn bán trong luồng tạo đơn. */
public interface ComboRepository extends JpaRepository<Combo, Long> {
    List<Combo> findByIdInAndActiveTrue(Iterable<Long> ids);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select combo from Combo combo where combo.id in :ids and combo.active = true order by combo.id")
    List<Combo> findActiveByIdsForUpdate(@Param("ids") Iterable<Long> ids);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select combo from Combo combo where combo.id = :id")
    java.util.Optional<Combo> findByIdForUpdate(@Param("id") Long id);
    List<Combo> findByActiveTrueOrderByNameAsc();
    @Query("select combo from Combo combo where (:keyword is null or lower(combo.name) like lower(concat('%', :keyword, '%')))")
    Page<Combo> search(@Param("keyword") String keyword, Pageable pageable);
}

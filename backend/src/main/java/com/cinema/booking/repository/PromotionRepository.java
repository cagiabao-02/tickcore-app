package com.cinema.booking.repository;

import com.cinema.booking.entity.Promotion;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Tìm và khóa promotion để cấp lượt dùng cạnh tranh một cách nguyên tử. */
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);
    @Query("select promotion from Promotion promotion where (:keyword is null or lower(promotion.code) like lower(concat('%', :keyword, '%'))) " +
        "and (:status is null or promotion.active = :status)")
    Page<Promotion> search(@Param("keyword") String keyword, @Param("status") Boolean status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select promotion from Promotion promotion where upper(promotion.code) = upper(:code)")
    Optional<Promotion> findByCodeForUpdate(@Param("code") String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select promotion from Promotion promotion where promotion.id = :id")
    Optional<Promotion> findByIdForUpdate(@Param("id") Long id);
}

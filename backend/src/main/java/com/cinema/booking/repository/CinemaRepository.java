package com.cinema.booking.repository;

import com.cinema.booking.entity.Cinema;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CinemaRepository extends JpaRepository<Cinema, Long> {
    List<Cinema> findByCityIdOrderByNameAsc(Long cityId);
    @Query("select c from Cinema c where (:cityId is null or c.cityId = :cityId) and " +
        "(:keyword is null or lower(c.name) like lower(concat('%', :keyword, '%')) or " +
        "lower(c.address) like lower(concat('%', :keyword, '%')))")
    Page<Cinema> search(@Param("cityId") Long cityId, @Param("keyword") String keyword, Pageable pageable);
}

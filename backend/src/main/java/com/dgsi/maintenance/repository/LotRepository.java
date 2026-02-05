package com.dgsi.maintenance.repository;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LotRepository extends JpaRepository<Lot, Long> {
    Optional<Lot> findByNomLot(String nomLot);
    
    @Query("SELECT l FROM Lot l WHERE l.nomLot LIKE %:keyword% OR l.codeLot LIKE %:keyword%")
    List<Lot> searchByKeyword(@Param("keyword") String keyword);
}

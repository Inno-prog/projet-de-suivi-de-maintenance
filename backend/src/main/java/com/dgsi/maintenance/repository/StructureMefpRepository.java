package com.dgsi.maintenance.repository;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.StructureMefp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StructureMefpRepository extends JpaRepository<StructureMefp, String> {
    Optional<StructureMefp> findByNom(String nom);

    List<StructureMefp> findByLotId(Long lotId);

    List<StructureMefp> findByRegion(String region);

    List<StructureMefp> findByVille(String ville);

    List<StructureMefp> findByRegionAndVille(String region, String ville);
    
    @Query("SELECT s FROM StructureMefp s WHERE s.nom LIKE %:keyword% OR s.region LIKE %:keyword% OR s.ville LIKE %:keyword%")
    List<StructureMefp> searchByKeyword(@Param("keyword") String keyword);
}

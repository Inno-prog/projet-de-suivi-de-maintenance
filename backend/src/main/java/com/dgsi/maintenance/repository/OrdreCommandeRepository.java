package com.dgsi.maintenance.repository;

import java.util.List;
import com.dgsi.maintenance.entity.OrdreCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdreCommandeRepository extends JpaRepository<OrdreCommande, Long> {

    // Custom query methods can be added here as needed
    java.util.Optional<com.dgsi.maintenance.entity.OrdreCommande> findByPrestataireItemAndTrimestre(String prestataireItem, Integer trimestre);

    @org.springframework.data.jpa.repository.Query("SELECT oc FROM OrdreCommande oc LEFT JOIN FETCH oc.items WHERE oc.id = :id")
    java.util.Optional<com.dgsi.maintenance.entity.OrdreCommande> findByIdWithItems(Long id);
    
    @Query("SELECT oc FROM OrdreCommande oc WHERE oc.numeroOc LIKE %:keyword% OR oc.prestataireItem LIKE %:keyword%")
    List<OrdreCommande> searchByKeyword(@Param("keyword") String keyword);
}

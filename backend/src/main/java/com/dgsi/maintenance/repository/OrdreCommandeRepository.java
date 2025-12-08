package com.dgsi.maintenance.repository;

import com.dgsi.maintenance.entity.OrdreCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdreCommandeRepository extends JpaRepository<OrdreCommande, Long> {

    // Custom query methods can be added here as needed
    java.util.Optional<com.dgsi.maintenance.entity.OrdreCommande> findByPrestataireItemAndTrimestre(String prestataireItem, Integer trimestre);
}

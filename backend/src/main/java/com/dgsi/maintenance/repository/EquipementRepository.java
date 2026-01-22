package com.dgsi.maintenance.repository;

import java.util.List;
import com.dgsi.maintenance.entity.Equipement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipementRepository extends JpaRepository<Equipement, Long> {
    List<Equipement> findByNomEquipementContainingIgnoreCase(String nomEquipement);
    List<Equipement> findByMarque(String marque);
    
    // Get all used equipment numbers
    @Query("SELECT e.numero FROM Equipement e WHERE e.numero IS NOT NULL ORDER BY e.numero")
    List<Integer> findAllUsedNumeros();
    
    // Find the maximum equipment number
    @Query("SELECT COALESCE(MAX(e.numero), 0) FROM Equipement e")
    int findMaxNumero();
    
    boolean existsByNumero(Integer numero);
}

package com.dgsi.maintenance.repository;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {
    
    @Modifying
    @Query(value = "DELETE FROM contrat_regions WHERE contrat_id = :id", nativeQuery = true)
    void deleteContratRegions(@Param("id") Long id);
    List<Contrat> findByPrestataireId(String prestataireId);
    @Query("SELECT c FROM Contrat c WHERE c.prestataireId = :prestataireId")
    List<Contrat> findByPrestataireIdExplicit(@Param("prestataireId") String prestataireId);
    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.ordresCommande LEFT JOIN FETCH c.lot WHERE c.lot.nomLot = :lot")
    List<Contrat> findByLot(String lot);
    Optional<Contrat> findByIdContrat(String idContrat);
    boolean existsByIdContrat(String idContrat);

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.lot")
    List<Contrat> findAllWithItems();

    // Fetch contrats with ordresCommande for prestataire.
    // NOTE: we avoid fetching oc.items here to prevent Hibernate MultipleBagFetchException
    // Items will be loaded lazily within a transactional service method when needed.
    @Query("SELECT DISTINCT c FROM Contrat c LEFT JOIN FETCH c.ordresCommande oc WHERE c.prestataireId = :prestataireId")
    List<Contrat> findByPrestataireIdWithItems(String prestataireId);

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.ordresCommande WHERE c.id = :id")
    java.util.Optional<Contrat> findByIdWithItems(Long id);

    // Note: This method is kept for backward compatibility but will always return empty list
    // because we no longer store prestataire contact information in the local database
    default List<Contrat> findActiveContratsByContactPrestataire(String contact) {
        return java.util.Collections.emptyList();
    }

    @Query("SELECT c FROM Contrat c WHERE c.nomPrestataire = :nomPrestataire AND c.statut = com.dgsi.maintenance.entity.StatutContrat.ACTIF")
    List<Contrat> findActiveContratsByNomPrestataire(String nomPrestataire);

    @Query("SELECT c FROM Contrat c WHERE c.nomPrestataire LIKE %:nomPrestataire% AND c.statut = com.dgsi.maintenance.entity.StatutContrat.ACTIF")
    List<Contrat> findActiveContratsByNomPrestataireContaining(String nomPrestataire);

    // Note: This method is kept for backward compatibility but will always return empty list
    // because we no longer store prestataire contact information in the local database
    default List<Contrat> findActiveContratsByContactPrestataireAndLot(String contact, String lot) {
        return java.util.Collections.emptyList();
    }

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.ordresCommande WHERE c.nomPrestataire = :nomPrestataire AND c.lot.nomLot = :lot AND c.statut = com.dgsi.maintenance.entity.StatutContrat.ACTIF")
    List<Contrat> findActiveContratsByNomPrestataireAndLot(String nomPrestataire, String lot);
    
    @Query("SELECT c FROM Contrat c WHERE c.nomPrestataire = :nomPrestataire")
    List<Contrat> findByNomPrestataire(String nomPrestataire);
    
    @Query("SELECT c FROM Contrat c WHERE c.idContrat LIKE %:keyword% OR c.nomPrestataire LIKE %:keyword% OR c.lot.nomLot LIKE %:keyword%")
    List<Contrat> searchByKeyword(@Param("keyword") String keyword);
}

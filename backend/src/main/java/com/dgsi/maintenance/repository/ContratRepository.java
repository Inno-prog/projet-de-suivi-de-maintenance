package com.dgsi.maintenance.repository;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {
    List<Contrat> findByPrestataireId(String prestataireId);
    @Query("SELECT c FROM Contrat c WHERE c.prestataire.id = :prestataireId")
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
    @Query("SELECT DISTINCT c FROM Contrat c LEFT JOIN FETCH c.ordresCommande oc WHERE c.prestataire.id = :prestataireId")
    List<Contrat> findByPrestataireIdWithItems(String prestataireId);

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.ordresCommande WHERE c.id = :id")
    java.util.Optional<Contrat> findByIdWithItems(Long id);

    @Query("SELECT c FROM Contrat c WHERE c.prestataire.contact = :contact AND c.statut = com.dgsi.maintenance.entity.StatutContrat.ACTIF")
    List<Contrat> findActiveContratsByContactPrestataire(String contact);

    @Query("SELECT c FROM Contrat c WHERE c.nomPrestataire = :nomPrestataire AND c.statut = com.dgsi.maintenance.entity.StatutContrat.ACTIF")
    List<Contrat> findActiveContratsByNomPrestataire(String nomPrestataire);

    @Query("SELECT c FROM Contrat c WHERE c.nomPrestataire LIKE %:nomPrestataire% AND c.statut = com.dgsi.maintenance.entity.StatutContrat.ACTIF")
    List<Contrat> findActiveContratsByNomPrestataireContaining(String nomPrestataire);

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.ordresCommande WHERE c.prestataire.contact = :contact AND c.lot.nomLot = :lot AND c.statut = com.dgsi.maintenance.entity.StatutContrat.ACTIF")
    List<Contrat> findActiveContratsByContactPrestataireAndLot(String contact, String lot);

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.ordresCommande WHERE c.nomPrestataire = :nomPrestataire AND c.lot.nomLot = :lot AND c.statut = com.dgsi.maintenance.entity.StatutContrat.ACTIF")
    List<Contrat> findActiveContratsByNomPrestataireAndLot(String nomPrestataire, String lot);
}

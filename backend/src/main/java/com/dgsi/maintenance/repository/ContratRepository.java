package com.dgsi.maintenance.repository;

import java.util.List;
import com.dgsi.maintenance.entity.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {
    List<Contrat> findByPrestataireId(String prestataireId);
    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.items WHERE c.lot = :lot")
    List<Contrat> findByLot(String lot);
    boolean existsByIdContrat(String idContrat);

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.items")
    List<Contrat> findAllWithItems();

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.items WHERE c.prestataire.id = :prestataireId")
    List<Contrat> findByPrestataireIdWithItems(String prestataireId);

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.items WHERE c.id = :id")
    java.util.Optional<Contrat> findByIdWithItems(Long id);

    @Query("SELECT c FROM Contrat c WHERE c.prestataire.contact = :contact AND (c.statut = 'ACTIF' OR c.statut = 'ACTIVE')")
    List<Contrat> findActiveContratsByContactPrestataire(String contact);

    @Query("SELECT c FROM Contrat c WHERE c.nomPrestataire = :nomPrestataire AND (c.statut = 'ACTIF' OR c.statut = 'ACTIVE')")
    List<Contrat> findActiveContratsByNomPrestataire(String nomPrestataire);

    @Query("SELECT c FROM Contrat c WHERE c.nomPrestataire LIKE %:nomPrestataire% AND (c.statut = 'ACTIF' OR c.statut = 'ACTIVE')")
    List<Contrat> findActiveContratsByNomPrestataireContaining(String nomPrestataire);

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.items WHERE c.prestataire.contact = :contact AND c.lot = :lot AND c.statut = 'ACTIF'")
    List<Contrat> findActiveContratsByContactPrestataireAndLot(String contact, String lot);

    @Query("SELECT c FROM Contrat c LEFT JOIN FETCH c.items WHERE c.nomPrestataire = :nomPrestataire AND c.lot = :lot AND c.statut = 'ACTIF'")
    List<Contrat> findActiveContratsByNomPrestataireAndLot(String nomPrestataire, String lot);
}

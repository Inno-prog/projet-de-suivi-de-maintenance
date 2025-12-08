package com.dgsi.maintenance.repository;

import java.time.LocalDate;
import java.util.List;
import com.dgsi.maintenance.entity.RapportSuivi;
import com.dgsi.maintenance.entity.StatutRapport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RapportSuiviRepository extends JpaRepository<RapportSuivi, Long> {

    // Trouver les rapports par prestataire
    List<RapportSuivi> findByPrestataire(String prestataire);

    // Trouver les rapports par trimestre
    List<RapportSuivi> findByTrimestre(String trimestre);

    // Trouver les rapports par statut
    List<RapportSuivi> findByStatut(StatutRapport statut);

    // Trouver les rapports par ordre de commande
    List<RapportSuivi> findByOrdreCommandeId(Long ordreCommandeId);

    // Trouver les rapports par prestataire et trimestre
    List<RapportSuivi> findByPrestataireAndTrimestre(String prestataire, String trimestre);

    // Trouver les rapports par date
    List<RapportSuivi> findByDateRapport(LocalDate dateRapport);

    // Trouver les rapports entre deux dates
    List<RapportSuivi> findByDateRapportBetween(LocalDate dateDebut, LocalDate dateFin);

    // Trouver les rapports par prestataire et statut
    List<RapportSuivi> findByPrestataireAndStatut(String prestataire, StatutRapport statut);

    // Comptage des rapports par prestataire
    @Query("SELECT COUNT(r) FROM RapportSuivi r WHERE r.prestataire = :prestataire")
    Long countByPrestataire(@Param("prestataire") String prestataire);

    // Comptage des rapports par statut
    @Query("SELECT COUNT(r) FROM RapportSuivi r WHERE r.statut = :statut")
    Long countByStatut(@Param("statut") StatutRapport statut);

    // Statistiques des rapports par prestataire
    @Query("SELECT r.prestataire, COUNT(r), r.statut FROM RapportSuivi r GROUP BY r.prestataire, r.statut")
    List<Object[]> getStatistiquesParPrestataire();

    // Rapports avec ordre de commande chargé
    @Query("SELECT r FROM RapportSuivi r LEFT JOIN FETCH r.ordreCommande WHERE r.id = :id")
    RapportSuivi findByIdWithOrdreCommande(@Param("id") Long id);

    // Tous les rapports avec ordre de commande chargé
    @Query("SELECT r FROM RapportSuivi r LEFT JOIN FETCH r.ordreCommande")
    List<RapportSuivi> findAllWithOrdreCommande();
}

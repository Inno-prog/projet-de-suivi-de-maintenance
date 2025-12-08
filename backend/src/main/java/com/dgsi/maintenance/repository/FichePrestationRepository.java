package com.dgsi.maintenance.repository;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.StatutFiche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FichePrestationRepository extends JpaRepository<FichePrestation, Long> {
    @Query("SELECT f FROM FichePrestation f WHERE f.nomPrestataire = :nomPrestataire")
    List<FichePrestation> findByNomPrestataire(@Param("nomPrestataire") String nomPrestataire);
    List<FichePrestation> findByStatut(StatutFiche statut);
    List<FichePrestation> findByNomItem(String nomItem);
    boolean existsByIdPrestation(String idPrestation);
    Optional<FichePrestation> findByIdPrestation(String idPrestation);

    // Nouvelle méthode pour filtrer par ID de prestataire
    @Query("SELECT f FROM FichePrestation f WHERE f.prestataire.id = :prestataireId")
    List<FichePrestation> findByPrestataireId(@Param("prestataireId") String prestataireId);

    // Native query to force selection of all fields including statutIntervention
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM fiches_prestation", nativeQuery = true)
    List<FichePrestation> findAllWithStatutIntervention();
}

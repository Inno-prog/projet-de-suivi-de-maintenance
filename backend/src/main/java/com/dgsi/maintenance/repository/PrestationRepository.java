package com.dgsi.maintenance.repository;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.Prestation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PrestationRepository extends JpaRepository<Prestation, Long> {

    @Query("SELECT p FROM Prestation p LEFT JOIN FETCH p.itemsUtilises WHERE p.id = :id")
    Optional<Prestation> findByIdWithEquipements(@Param("id") Long id);

    @Query("SELECT p FROM Prestation p LEFT JOIN FETCH p.itemsUtilises WHERE p.id = :id")
    Optional<Prestation> findByIdWithEquipementsAndItems(@Param("id") Long id);

    List<Prestation> findByNomPrestataire(String nomPrestataire);
    Page<Prestation> findByNomPrestataire(String nomPrestataire, Pageable pageable);

    @Query("SELECT p FROM Prestation p WHERE p.contactPrestataire = :email")
    List<Prestation> findByContactPrestataire(@Param("email") String email);

    @Query("SELECT p FROM Prestation p WHERE p.contactPrestataire = :email")
    Page<Prestation> findByContactPrestataire(@Param("email") String email, Pageable pageable);

    @Query("SELECT p FROM Prestation p WHERE p.prestataireId = :prestataireId")
    List<Prestation> findByPrestataireId(@Param("prestataireId") String prestataireId);

    @Query("SELECT p FROM Prestation p WHERE p.prestataireId = :prestataireId")
    Page<Prestation> findByPrestataireId(@Param("prestataireId") String prestataireId, Pageable pageable);

    List<Prestation> findByStatut(String statut);

    List<Prestation> findByTrimestre(String trimestre);

    @Query("SELECT p FROM Prestation p WHERE p.nomPrestataire LIKE %:keyword% OR p.nomPrestation LIKE %:keyword%")
    List<Prestation> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT COUNT(p) FROM Prestation p WHERE p.statut = :statut")
    Long countByStatut(@Param("statut") String statut);

    @Query("SELECT SUM(p.montantPrest) FROM Prestation p WHERE p.trimestre = :trimestre")
    Long sumMontantByTrimestre(@Param("trimestre") String trimestre);

    List<Prestation> findByTrimestreAndNomPrestationAndNomPrestataire(String trimestre, String nomPrestation, String nomPrestataire);

    @Query("SELECT COUNT(p) FROM Prestation p WHERE p.trimestre = :trimestre AND p.nomPrestation = :nomPrestation AND p.nomPrestataire = :nomPrestataire")
    Long countByTrimestreAndNomPrestationAndNomPrestataire(@Param("trimestre") String trimestre, @Param("nomPrestation") String nomPrestation, @Param("nomPrestataire") String nomPrestataire);

    @Query("SELECT COUNT(p) FROM Prestation p WHERE p.trimestre = :trimestre AND p.nomPrestation = :nomPrestation")
    Long countByTrimestreAndNomPrestation(@Param("trimestre") String trimestre, @Param("nomPrestation") String nomPrestation);

    @Query("SELECT COUNT(p) FROM Prestation p WHERE p.nomPrestation = :nomPrestation")
    Long countByNomPrestation(@Param("nomPrestation") String nomPrestation);

    @Query("SELECT COUNT(p) FROM Prestation p WHERE p.nomPrestation = :nomPrestation AND p.nomPrestataire = :nomPrestataire")
    Long countByNomPrestationAndNomPrestataire(@Param("nomPrestation") String nomPrestation, @Param("nomPrestataire") String nomPrestataire);

    @Query("SELECT COUNT(p) FROM Prestation p JOIN p.itemsUtilises i WHERE i.id = :itemId")
    Long countPrestationsByItemId(@Param("itemId") Long itemId);
}

package com.dgsi.maintenance.config;

import java.util.List;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Configuration pour nettoyer automatiquement les fiches de prestation
 * liées à des prestations en brouillon au démarrage de l'application.
 * 
 * Cela garantit que les prestations non soumises n'apparaissent pas
 * dans le tableau de bord administrateur.
 */
@Configuration
public class BrouillonFicheCleanupConfig {

    private static final Logger log = LoggerFactory.getLogger(BrouillonFicheCleanupConfig.class);

    @Autowired
    private FichePrestationRepository fichePrestationRepository;

    @Autowired
    private PrestationRepository prestationRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Bean qui s'exécute au démarrage de l'application.
     * Nettoie les fiches liées à des prestations en brouillon.
     */
    @Bean
    @Profile("!test") // Ne pas exécuter pendant les tests
    public CommandLineRunner cleanupBrouillonFichesOnStartup() {
        return args -> {
            log.info("🧹 Démarrage du nettoyage des fiches de brouillon...");
            
            try {
                // Méthode 1: Utiliser SQL direct (plus fiable)
                cleanupUsingSql();
                
            } catch (Exception e) {
                log.error("❌ Erreur lors du cleanup SQL: {}", e.getMessage());
                // Fallback: méthode Java
                try {
                    cleanupUsingJava();
                } catch (Exception e2) {
                    log.error("❌ Erreur lors du cleanup Java: {}", e2.getMessage());
                }
            }
        };
    }

    /**
     * Cleanup utilisant SQL direct - plus rapide et fiable
     */
    private void cleanupUsingSql() {
        // Compter les fiches à supprimer
        String countSql = """
            SELECT COUNT(*) FROM fiches_prestation fp
            WHERE EXISTS (
                SELECT 1 FROM prestations p 
                WHERE p.id::text = fp.id_prestation 
                AND p.statut_validation = 'BROUILLON'
            )
            """;
        
        Integer countToDelete = jdbcTemplate.queryForObject(countSql, Integer.class);
        
        if (countToDelete == null || countToDelete == 0) {
            log.info("✅ Aucune fiche de brouillon à nettoyer");
            return;
        }

        log.info("📋 {} fiches de brouillon trouvées à supprimer", countToDelete);

        // Afficher les détails des fiches à supprimer
        String listSql = """
            SELECT fp.id, fp.id_prestation, fp.nom_prestataire, fp.nom_item
            FROM fiches_prestation fp
            WHERE EXISTS (
                SELECT 1 FROM prestations p 
                WHERE p.id::text = fp.id_prestation 
                AND p.statut_validation = 'BROUILLON'
            )
            """;
        
        List<BrouillonFicheInfo> fiches = jdbcTemplate.query(listSql, (rs, rowNum) -> 
            new BrouillonFicheInfo(
                rs.getLong("id"),
                rs.getString("id_prestation"),
                rs.getString("nom_prestataire"),
                rs.getString("nom_item")
            )
        );
        
        for (BrouillonFicheInfo fiche : fiches) {
            log.info("   - Fiche ID: {} | Prestation ID: {} | Prestataire: {}", 
                fiche.id, fiche.idPrestation, fiche.nomPrestataire);
        }

        // Supprimer les fiches
        String deleteSql = """
            DELETE FROM fiches_prestation fp
            WHERE EXISTS (
                SELECT 1 FROM prestations p 
                WHERE p.id::text = fp.id_prestation 
                AND p.statut_validation = 'BROUILLON'
            )
            """;
        
        int deletedCount = jdbcTemplate.update(deleteSql);
        log.info("✅ Cleanup terminé: {} fiches de brouillon supprimées", deletedCount);
    }

    /**
     * Cleanup utilisant les repositories Java (fallback)
     */
    private void cleanupUsingJava() {
        log.info("🔄 Utilisation de la méthode Java pour le cleanup...");
        
        List<FichePrestation> brouillonFiches = findBrouillonLinkedFiches();
        
        if (brouillonFiches.isEmpty()) {
            log.info("✅ Aucune fiche de brouillon à nettoyer");
            return;
        }

        log.info("📋 {} fiches de brouillon trouvées à supprimer", brouillonFiches.size());
        
        int deletedCount = 0;
        for (FichePrestation fiche : brouillonFiches) {
            log.info("   - Fiche ID: {} | Prestation ID: {} | Prestataire: {}", 
                fiche.getId(), fiche.getIdPrestation(), fiche.getNomPrestataire());
            fichePrestationRepository.delete(fiche);
            deletedCount++;
        }

        log.info("✅ Cleanup terminé: {} fiches de brouillon supprimées", deletedCount);
    }

    /**
     * Trouve toutes les fiches qui sont liées à des prestations en brouillon.
     */
    private List<FichePrestation> findBrouillonLinkedFiches() {
        List<FichePrestation> brouillonFiches = new java.util.ArrayList<>();
        List<FichePrestation> allFiches = fichePrestationRepository.findAll();
        
        for (FichePrestation fiche : allFiches) {
            if (fiche.getIdPrestation() != null) {
                try {
                    Long prestationId = Long.parseLong(fiche.getIdPrestation());
                    java.util.Optional<Prestation> prestationOpt = prestationRepository.findById(prestationId);
                    
                    if (prestationOpt.isPresent()) {
                        Prestation prestation = prestationOpt.get();
                        if ("BROUILLON".equals(prestation.getStatutValidation())) {
                            brouillonFiches.add(fiche);
                        }
                    }
                } catch (NumberFormatException e) {
                    log.trace("ID de prestation invalide ignoré: {}", fiche.getIdPrestation());
                }
            }
        }
        
        return brouillonFiches;
    }

    /**
     * Classe interne pour stocker les infos des fiches à supprimer
     */
    private static class BrouillonFicheInfo {
        Long id;
        String idPrestation;
        String nomPrestataire;
        String nomItem;
        
        BrouillonFicheInfo(Long id, String idPrestation, String nomPrestataire, String nomItem) {
            this.id = id;
            this.idPrestation = idPrestation;
            this.nomPrestataire = nomPrestataire;
            this.nomItem = nomItem;
        }
    }
}

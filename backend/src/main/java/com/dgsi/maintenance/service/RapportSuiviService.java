package com.dgsi.maintenance.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import com.dgsi.maintenance.entity.RapportSuivi;
import com.dgsi.maintenance.entity.StatutRapport;
import com.dgsi.maintenance.repository.RapportSuiviRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional
public class RapportSuiviService {

    @Autowired
    private RapportSuiviRepository rapportSuiviRepository;

    /**
     * Créer un nouveau rapport de suivi
     */
    public RapportSuivi createRapport(RapportSuivi rapport) {
        log.info("Création d'un nouveau rapport de suivi pour le prestataire: {}", rapport.getPrestataire());

        // Validation des données
        validateRapportData(rapport);

        // Sauvegarde
        RapportSuivi savedRapport = rapportSuiviRepository.save(rapport);
        log.info("Rapport de suivi créé avec ID: {}", savedRapport.getId());

        return savedRapport;
    }

    /**
     * Mettre à jour un rapport de suivi
     */
    public RapportSuivi updateRapport(Long id, RapportSuivi rapportDetails) {
        log.info("Mise à jour du rapport de suivi ID: {}", id);

        return rapportSuiviRepository.findById(id)
            .map(rapport -> {
                // Mise à jour des champs
                if (rapportDetails.getOrdreCommandeId() != null) {
                    rapport.setOrdreCommandeId(rapportDetails.getOrdreCommandeId());
                }
                if (rapportDetails.getDateRapport() != null) {
                    rapport.setDateRapport(rapportDetails.getDateRapport());
                }
                if (rapportDetails.getTrimestre() != null) {
                    rapport.setTrimestre(rapportDetails.getTrimestre());
                }
                if (rapportDetails.getPrestataire() != null) {
                    rapport.setPrestataire(rapportDetails.getPrestataire());
                }
                if (rapportDetails.getPrestationsRealisees() != null) {
                    rapport.setPrestationsRealisees(rapportDetails.getPrestationsRealisees());
                }
                if (rapportDetails.getObservations() != null) {
                    rapport.setObservations(rapportDetails.getObservations());
                }
                if (rapportDetails.getStatut() != null) {
                    rapport.setStatut(rapportDetails.getStatut());
                }

                RapportSuivi updatedRapport = rapportSuiviRepository.save(rapport);
                log.info("Rapport de suivi mis à jour ID: {}", id);

                return updatedRapport;
            })
            .orElseThrow(() -> {
                log.warn("Rapport de suivi non trouvé pour mise à jour ID: {}", id);
                return new IllegalArgumentException("Rapport de suivi non trouvé avec ID: " + id);
            });
    }

    /**
     * Supprimer un rapport de suivi
     */
    public boolean deleteRapport(Long id) {
        log.info("Suppression du rapport de suivi ID: {}", id);

        return rapportSuiviRepository.findById(id)
            .map(rapport -> {
                rapportSuiviRepository.delete(rapport);
                log.info("Rapport de suivi supprimé ID: {}", id);
                return true;
            })
            .orElse(false);
    }

    /**
     * Récupérer tous les rapports de suivi
     */
    @Transactional(readOnly = true)
    public List<RapportSuivi> getAllRapports() {
        log.info("Récupération de tous les rapports de suivi");
        return rapportSuiviRepository.findAllWithOrdreCommande();
    }

    /**
     * Récupérer un rapport par ID
     */
    @Transactional(readOnly = true)
    public Optional<RapportSuivi> getRapportById(Long id) {
        log.info("Récupération du rapport de suivi ID: {}", id);
        return Optional.ofNullable(rapportSuiviRepository.findByIdWithOrdreCommande(id));
    }

    /**
     * Récupérer les rapports par prestataire
     */
    @Transactional(readOnly = true)
    public List<RapportSuivi> getRapportsByPrestataire(String prestataire) {
        log.info("Récupération des rapports pour le prestataire: {}", prestataire);
        return rapportSuiviRepository.findByPrestataire(prestataire);
    }

    /**
     * Récupérer les rapports par trimestre
     */
    @Transactional(readOnly = true)
    public List<RapportSuivi> getRapportsByTrimestre(String trimestre) {
        log.info("Récupération des rapports pour le trimestre: {}", trimestre);
        return rapportSuiviRepository.findByTrimestre(trimestre);
    }

    /**
     * Récupérer les rapports par statut
     */
    @Transactional(readOnly = true)
    public List<RapportSuivi> getRapportsByStatut(StatutRapport statut) {
        log.info("Récupération des rapports avec statut: {}", statut);
        return rapportSuiviRepository.findByStatut(statut);
    }

    /**
     * Récupérer les rapports par ordre de commande
     */
    @Transactional(readOnly = true)
    public List<RapportSuivi> getRapportsByOrdreCommande(Long ordreCommandeId) {
        log.info("Récupération des rapports pour l'ordre de commande ID: {}", ordreCommandeId);
        return rapportSuiviRepository.findByOrdreCommandeId(ordreCommandeId);
    }

    /**
     * Récupérer les rapports entre deux dates
     */
    @Transactional(readOnly = true)
    public List<RapportSuivi> getRapportsBetweenDates(LocalDate dateDebut, LocalDate dateFin) {
        log.info("Récupération des rapports entre {} et {}", dateDebut, dateFin);
        return rapportSuiviRepository.findByDateRapportBetween(dateDebut, dateFin);
    }

    /**
     * Approuver un rapport
     */
    public RapportSuivi approuverRapport(Long id) {
        log.info("Approbation du rapport ID: {}", id);
        return updateRapportStatut(id, StatutRapport.APPROUVE);
    }

    /**
     * Rejeter un rapport
     */
    public RapportSuivi rejeterRapport(Long id) {
        log.info("Rejet du rapport ID: {}", id);
        return updateRapportStatut(id, StatutRapport.REJETE);
    }

    /**
     * Méthode utilitaire pour mettre à jour le statut
     */
    private RapportSuivi updateRapportStatut(Long id, StatutRapport nouveauStatut) {
        return rapportSuiviRepository.findById(id)
            .map(rapport -> {
                rapport.setStatut(nouveauStatut);
                RapportSuivi updatedRapport = rapportSuiviRepository.save(rapport);
                log.info("Statut du rapport ID {} mis à jour: {}", id, nouveauStatut);
                return updatedRapport;
            })
            .orElseThrow(() -> {
                log.warn("Rapport non trouvé pour mise à jour du statut ID: {}", id);
                return new IllegalArgumentException("Rapport de suivi non trouvé avec ID: " + id);
            });
    }

    /**
     * Obtenir les statistiques des rapports
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatistiquesRapports() {
        log.info("Calcul des statistiques des rapports");

        List<RapportSuivi> rapports = rapportSuiviRepository.findAll();

        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalRapports", rapports.size());
        stats.put("rapportsEnAttente", rapports.stream().filter(r -> r.getStatut() == StatutRapport.EN_ATTENTE).count());
        stats.put("rapportsApprouves", rapports.stream().filter(r -> r.getStatut() == StatutRapport.APPROUVE).count());
        stats.put("rapportsRejetes", rapports.stream().filter(r -> r.getStatut() == StatutRapport.REJETE).count());

        // Statistiques par prestataire
        Map<String, Long> rapportsParPrestataire = rapports.stream()
            .collect(Collectors.groupingBy(RapportSuivi::getPrestataire, Collectors.counting()));
        stats.put("rapportsParPrestataire", rapportsParPrestataire);

        // Statistiques par trimestre
        Map<String, Long> rapportsParTrimestre = rapports.stream()
            .collect(Collectors.groupingBy(RapportSuivi::getTrimestre, Collectors.counting()));
        stats.put("rapportsParTrimestre", rapportsParTrimestre);

        return stats;
    }

    /**
     * Validation des données du rapport
     */
    private void validateRapportData(RapportSuivi rapport) {
        if (rapport == null) {
            throw new IllegalArgumentException("Le rapport ne peut pas être nul");
        }
        if (rapport.getDateRapport() == null) {
            throw new IllegalArgumentException("La date du rapport est obligatoire");
        }
        if (rapport.getTrimestre() == null || rapport.getTrimestre().trim().isEmpty()) {
            throw new IllegalArgumentException("Le trimestre est obligatoire");
        }
        if (rapport.getPrestataire() == null || rapport.getPrestataire().trim().isEmpty()) {
            throw new IllegalArgumentException("Le prestataire est obligatoire");
        }
        if (rapport.getPrestationsRealisees() == null || rapport.getPrestationsRealisees() < 0) {
            throw new IllegalArgumentException("Le nombre de prestations réalisées doit être positif ou nul");
        }
        if (rapport.getStatut() == null) {
            throw new IllegalArgumentException("Le statut est obligatoire");
        }
    }
}

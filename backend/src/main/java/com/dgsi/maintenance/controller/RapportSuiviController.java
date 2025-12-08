package com.dgsi.maintenance.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.dgsi.maintenance.entity.RapportSuivi;
import com.dgsi.maintenance.entity.StatutRapport;
import com.dgsi.maintenance.service.RapportSuiviService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/rapports-suivi")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class RapportSuiviController {

    @Autowired
    private RapportSuiviService rapportSuiviService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<List<RapportSuivi>> getAllRapports() {
        try {
            List<RapportSuivi> rapports = rapportSuiviService.getAllRapports();
            return ResponseEntity.ok(rapports);
        } catch (Exception e) {
            log.error("❌ Erreur lors du chargement des rapports de suivi: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<RapportSuivi> getRapportById(@PathVariable Long id) {
        Optional<RapportSuivi> rapport = rapportSuiviService.getRapportById(id);
        return rapport.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> createRapport(@RequestBody RapportSuivi rapport) {
        try {
            RapportSuivi createdRapport = rapportSuiviService.createRapport(rapport);
            return ResponseEntity.ok(createdRapport);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création du rapport: ", e);
            return ResponseEntity.internalServerError().body("Erreur lors de la création");
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> updateRapport(@PathVariable Long id, @RequestBody RapportSuivi rapportDetails) {
        try {
            RapportSuivi updatedRapport = rapportSuiviService.updateRapport(id, rapportDetails);
            return ResponseEntity.ok(updatedRapport);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("❌ Erreur lors de la mise à jour du rapport: ", e);
            return ResponseEntity.internalServerError().body("Erreur lors de la mise à jour");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteRapport(@PathVariable Long id) {
        try {
            boolean deleted = rapportSuiviService.deleteRapport(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression du rapport: ", e);
            return ResponseEntity.internalServerError().body("Erreur lors de la suppression");
        }
    }

    @PutMapping("/{id}/approuver")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<RapportSuivi> approuverRapport(@PathVariable Long id) {
        try {
            RapportSuivi rapport = rapportSuiviService.approuverRapport(id);
            return ResponseEntity.ok(rapport);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'approbation du rapport: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<RapportSuivi> rejeterRapport(@PathVariable Long id) {
        try {
            RapportSuivi rapport = rapportSuiviService.rejeterRapport(id);
            return ResponseEntity.ok(rapport);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors du rejet du rapport: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/prestataire/{prestataire}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or (hasRole('PRESTATAIRE') and #prestataire == authentication.name)")
    public ResponseEntity<List<RapportSuivi>> getRapportsByPrestataire(@PathVariable String prestataire) {
        try {
            List<RapportSuivi> rapports = rapportSuiviService.getRapportsByPrestataire(prestataire);
            return ResponseEntity.ok(rapports);
        } catch (Exception e) {
            log.error("❌ Erreur lors du chargement des rapports pour le prestataire {}: ", prestataire, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/trimestre/{trimestre}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<List<RapportSuivi>> getRapportsByTrimestre(@PathVariable String trimestre) {
        try {
            List<RapportSuivi> rapports = rapportSuiviService.getRapportsByTrimestre(trimestre);
            return ResponseEntity.ok(rapports);
        } catch (Exception e) {
            log.error("❌ Erreur lors du chargement des rapports pour le trimestre {}: ", trimestre, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<List<RapportSuivi>> getRapportsByStatut(@PathVariable StatutRapport statut) {
        try {
            List<RapportSuivi> rapports = rapportSuiviService.getRapportsByStatut(statut);
            return ResponseEntity.ok(rapports);
        } catch (Exception e) {
            log.error("❌ Erreur lors du chargement des rapports avec statut {}: ", statut, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ordre-commande/{ordreCommandeId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<List<RapportSuivi>> getRapportsByOrdreCommande(@PathVariable Long ordreCommandeId) {
        try {
            List<RapportSuivi> rapports = rapportSuiviService.getRapportsByOrdreCommande(ordreCommandeId);
            return ResponseEntity.ok(rapports);
        } catch (Exception e) {
            log.error("❌ Erreur lors du chargement des rapports pour l'ordre de commande {}: ", ordreCommandeId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/periode")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<List<RapportSuivi>> getRapportsBetweenDates(
            @RequestParam LocalDate dateDebut,
            @RequestParam LocalDate dateFin) {
        try {
            List<RapportSuivi> rapports = rapportSuiviService.getRapportsBetweenDates(dateDebut, dateFin);
            return ResponseEntity.ok(rapports);
        } catch (Exception e) {
            log.error("❌ Erreur lors du chargement des rapports entre {} et {}: ", dateDebut, dateFin, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/statistiques")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<Map<String, Object>> getStatistiquesRapports() {
        try {
            Map<String, Object> stats = rapportSuiviService.getStatistiquesRapports();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("❌ Erreur lors du calcul des statistiques: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

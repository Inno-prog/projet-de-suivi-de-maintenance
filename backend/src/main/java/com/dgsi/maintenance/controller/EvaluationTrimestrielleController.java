package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.repository.EvaluationTrimestrielleRepository;
import com.dgsi.maintenance.repository.UserRepository;
import com.dgsi.maintenance.service.EvaluationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class EvaluationTrimestrielleController {

    private static final Logger logger = LoggerFactory.getLogger(EvaluationTrimestrielleController.class);

    @Autowired
    private EvaluationService evaluationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<EvaluationTrimestrielle> getAllEvaluations() {
        logger.info("Récupération de toutes les évaluations");
        return evaluationService.getAllEvaluations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationTrimestrielle> getEvaluationById(@PathVariable Long id) {
        logger.info("Récupération de l'évaluation avec ID: {}", id);
        Optional<EvaluationTrimestrielle> evaluation = evaluationService.getEvaluationById(id);
        return evaluation.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<?> createEvaluation(@RequestBody EvaluationTrimestrielle evaluation) {
        try {
            logger.info("Création d'une nouvelle évaluation pour le prestataire: {}", evaluation.getPrestataireNom());
            logger.info("Trimestre: {}, Lot: {}", evaluation.getTrimestre(), evaluation.getLot());
            
            // Validation des champs obligatoires
            if (evaluation.getTrimestre() == null || evaluation.getTrimestre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "Le trimestre est obligatoire")
                );
            }
            if (evaluation.getLot() == null || evaluation.getLot().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "Le lot est obligatoire")
                );
            }
            if (evaluation.getPrestataireNom() == null || evaluation.getPrestataireNom().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "Le nom du prestataire est obligatoire")
                );
            }
            if (evaluation.getDateEvaluation() == null) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "La date d'évaluation est obligatoire")
                );
            }
            
            EvaluationTrimestrielle savedEvaluation = evaluationService.saveEvaluation(evaluation);
            logger.info("Évaluation créée avec succès. ID: {}", savedEvaluation.getId());
            
            return ResponseEntity.ok(savedEvaluation);
        } catch (Exception e) {
            logger.error("Erreur lors de la création de l'évaluation: ", e);
            return ResponseEntity.status(500).body(
                java.util.Map.of(
                    "error", "Erreur lors de la création de l'évaluation",
                    "message", e.getMessage(),
                    "details", e.getCause() != null ? e.getCause().getMessage() : "Unknown",
                    "stackTrace", e.getStackTrace()
                )
            );
        }
    }

    // Endpoint de test non protégé (uniquement pour debug en environnement local)
    @PostMapping("/test")
    public ResponseEntity<?> createEvaluationNoAuth(@RequestBody EvaluationTrimestrielle evaluation) {
        try {
            logger.info("[TEST] Création d'une nouvelle évaluation (no auth) pour le prestataire: {}", evaluation.getPrestataireNom());
            // Réutiliser la logique du service
            EvaluationTrimestrielle savedEvaluation = evaluationService.saveEvaluation(evaluation);
            logger.info("[TEST] Évaluation (no auth) créée avec succès. ID: {}", savedEvaluation.getId());
            return ResponseEntity.ok(savedEvaluation);
        } catch (Exception e) {
            logger.error("[TEST] Erreur lors de la création (no auth) de l'évaluation: ", e);
            // Retourner un body détaillé pour faciliter le debug local
            return ResponseEntity.status(500).body(
                    java.util.Map.of(
                            "error", "Erreur lors de la création de l'évaluation (no auth)",
                            "message", e.getMessage(),
                            "cause", e.getCause() != null ? e.getCause().toString() : "null"
                    )
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvaluationTrimestrielle> updateEvaluation(@PathVariable Long id, @RequestBody EvaluationTrimestrielle evaluationDetails) {
        Optional<EvaluationTrimestrielle> optionalEvaluation = evaluationService.getEvaluationById(id);
        
        if (optionalEvaluation.isPresent()) {
            EvaluationTrimestrielle evaluation = optionalEvaluation.get();
            
            if (evaluationDetails.getSessionId() != null) evaluation.setSessionId(evaluationDetails.getSessionId());
            if (evaluationDetails.getTrimestre() != null) evaluation.setTrimestre(evaluationDetails.getTrimestre());
            if (evaluationDetails.getLot() != null) evaluation.setLot(evaluationDetails.getLot());
            if (evaluationDetails.getPrestataireNom() != null) evaluation.setPrestataireNom(evaluationDetails.getPrestataireNom());
            if (evaluationDetails.getPrestataireEmail() != null) evaluation.setPrestataireEmail(evaluationDetails.getPrestataireEmail());
            if (evaluationDetails.getDateEvaluation() != null) evaluation.setDateEvaluation(evaluationDetails.getDateEvaluation());
            if (evaluationDetails.getEvaluateurNom() != null) evaluation.setEvaluateurNom(evaluationDetails.getEvaluateurNom());
            if (evaluationDetails.getCorrespondantId() != null) evaluation.setCorrespondantId(evaluationDetails.getCorrespondantId());
            evaluation.setTechniciensListe(evaluationDetails.getTechniciensListe());
            evaluation.setRapportInterventionTransmis(evaluationDetails.getRapportInterventionTransmis());
            evaluation.setRegistreRempli(evaluationDetails.getRegistreRempli());
            evaluation.setHorairesRespectes(evaluationDetails.getHorairesRespectes());
            evaluation.setDelaiReactionRespecte(evaluationDetails.getDelaiReactionRespecte());
            evaluation.setDelaiInterventionRespecte(evaluationDetails.getDelaiInterventionRespecte());
            evaluation.setVehiculeDisponible(evaluationDetails.getVehiculeDisponible());
            evaluation.setTenueDisponible(evaluationDetails.getTenueDisponible());
            // Exigences et observations
            evaluation.setExigence1(evaluationDetails.getExigence1());
            evaluation.setExigence2(evaluationDetails.getExigence2());
            evaluation.setExigence3(evaluationDetails.getExigence3());
            evaluation.setExigence4(evaluationDetails.getExigence4());
            evaluation.setExigence5(evaluationDetails.getExigence5());
            evaluation.setExigence6(evaluationDetails.getExigence6());
            evaluation.setExigence7(evaluationDetails.getExigence7());
            evaluation.setExigence8(evaluationDetails.getExigence8());
            evaluation.setExigence9(evaluationDetails.getExigence9());
            evaluation.setObs1(evaluationDetails.getObs1());
            evaluation.setObs2(evaluationDetails.getObs2());
            evaluation.setObs3(evaluationDetails.getObs3());
            evaluation.setObs4(evaluationDetails.getObs4());
            evaluation.setObs5(evaluationDetails.getObs5());
            evaluation.setObs6(evaluationDetails.getObs6());
            evaluation.setObs7(evaluationDetails.getObs7());
            evaluation.setObs8(evaluationDetails.getObs8());
            evaluation.setObs9(evaluationDetails.getObs9());
            // Instances non résolues
            evaluation.setInstance1(evaluationDetails.getInstance1());
            evaluation.setDirection1(evaluationDetails.getDirection1());
            evaluation.setDateDebut1(evaluationDetails.getDateDebut1());
            evaluation.setJoursPenalite1(evaluationDetails.getJoursPenalite1());
            evaluation.setObsInstance1(evaluationDetails.getObsInstance1());
            // Signatures
            evaluation.setSignaturePrestataire(evaluationDetails.getSignaturePrestataire());
            evaluation.setSignatureDirection(evaluationDetails.getSignatureDirection());
            evaluation.setSignatureDGSI(evaluationDetails.getSignatureDGSI());
            evaluation.setPrestationsVerifiees(evaluationDetails.getPrestationsVerifiees());
            evaluation.setInstancesNonResolues(evaluationDetails.getInstancesNonResolues());
            evaluation.setObservationsGenerales(evaluationDetails.getObservationsGenerales());
            evaluation.setAppreciationRepresentant(evaluationDetails.getAppreciationRepresentant());
            evaluation.setSignatureRepresentant(evaluationDetails.getSignatureRepresentant());
            evaluation.setSignatureEvaluateur(evaluationDetails.getSignatureEvaluateur());
            evaluation.setPreuves(evaluationDetails.getPreuves());
            if (evaluationDetails.getStatut() != null) evaluation.setStatut(evaluationDetails.getStatut());
            if (evaluationDetails.getPenalitesCalcul() != null) evaluation.setPenalitesCalcul(evaluationDetails.getPenalitesCalcul());
            
            return ResponseEntity.ok(evaluationService.saveEvaluation(evaluation));
        }
        
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvaluation(@PathVariable Long id) {
        return evaluationService.getEvaluationById(id)
                .map(evaluation -> {
                    evaluationService.deleteEvaluation(id);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/prestataire")
    public List<EvaluationTrimestrielle> getEvaluationsByPrestataire() {
        // Récupérer l'utilisateur connecté via SecurityContextHolder
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Tentative d'accès non autorisé aux évaluations prestataire");
            return List.of();
        }
        
        String username = authentication.getName();
        logger.info("Récupération des évaluations pour l'utilisateur: {}", username);
        
        // Vérifier les rôles de l'utilisateur
        boolean isAdminOrAgent = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRATEUR") || 
                           a.getAuthority().equals("ROLE_AGENT_DGSI"));
        
        if (isAdminOrAgent) {
            // Les administrateurs et agents DGSI voient toutes les évaluations
            logger.info("Rôle admin/agent détecté - retour de toutes les évaluations");
            return evaluationService.getAllEvaluations();
        }
        
        // Pour les prestataires, récupérer leur profil pour obtenir le nom exact
        // Le username peut être un email, on doit trouver le nom du prestataire dans la base
        String prestataireNom = evaluationService.getPrestataireNomFromUsername(username);
        
        if (prestataireNom != null && !prestataireNom.isEmpty()) {
            logger.info("Prestataire identifié: {} - retour des évaluations filtrées", prestataireNom);
            return evaluationService.getEvaluationsByPrestataireNom(prestataireNom);
        } else {
            // Fallback: utiliser le username comme nom de prestataire
            logger.info("Nom prestataire non trouvé - utilisation du username comme filtre: {}", username);
            return evaluationService.getEvaluationsByPrestataireNom(username);
        }
    }

    @GetMapping("/statut/{statut}")
    public List<EvaluationTrimestrielle> getEvaluationsByStatut(@PathVariable String statut) {
        return evaluationService.getEvaluationsByStatut(statut);
    }
    
    @PostMapping("/{id}/send-email")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<?> sendEvaluationEmail(@PathVariable Long id) {
        logger.info("Demande d'envoi d'email pour l'évaluation ID: {}", id);
        
        try {
            Optional<EvaluationTrimestrielle> evaluationOpt = evaluationService.getEvaluationById(id);
            if (evaluationOpt.isPresent()) {
                EvaluationTrimestrielle evaluation = evaluationOpt.get();
                evaluationService.sendEvaluationEmail(evaluation);
                
                return ResponseEntity.ok().body(java.util.Map.of(
                    "success", true,
                    "message", "Email envoyé avec succès au prestataire " + evaluation.getPrestataireNom()
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email pour l'évaluation ID: {}", id, e);
            return ResponseEntity.status(500).body(java.util.Map.of(
                "success", false,
                "message", "Erreur lors de l'envoi de l'email: " + e.getMessage()
            ));
        }
    }
}

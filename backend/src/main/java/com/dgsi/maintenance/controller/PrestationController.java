package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.dto.PaginationResponse;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.entity.StatutFiche;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import com.dgsi.maintenance.service.NotificationService;
import com.dgsi.maintenance.service.PrestationPdfService;
import com.dgsi.maintenance.service.PrestationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
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
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/prestations")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class PrestationController {

    private final PrestationService prestationService;
    private final PrestationPdfService prestationPdfService;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private FichePrestationRepository fichePrestationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.dgsi.maintenance.service.ContratItemService contratItemService;

    @Autowired
    private PrestationRepository prestationRepository;

    @Autowired
    public PrestationController(PrestationService prestationService, PrestationPdfService prestationPdfService, ItemRepository itemRepository, com.dgsi.maintenance.repository.PrestationRepository prestationRepository) {
        this.prestationService = prestationService;
        this.prestationPdfService = prestationPdfService;
        this.itemRepository = itemRepository;
        this.prestationRepository = prestationRepository;
    }

    // DTO for prestation creation request
    public static class PrestationCreateRequest {
        private String prestataireId;
        private String nomPrestataire;
        private String nomResponsablePrestation;
        private String contactResponsablePrestation;
        private String qualificationResponsablePrestation;
        private String nomPrestation;
        private String structurePrestataire;
        private String directionPrestataire;
        private String servicePrestataire;
        private String rolePrestataire;
        private String qualificationPrestataire;
        private java.math.BigDecimal montantIntervention;
        private String equipementsUtilises;
        private List<Long> itemIds;
        private java.util.Map<Long, Integer> itemQuantities; // itemId -> quantity
        private String trimestre;
        private String dateHeureDebut;
        private String dateHeureFin;
        private String statutIntervention;
        private String statutValidation;
        private String nomCi;
        private String prenomCi;
        private String contactCi;
        private String fonctionCi;
        private String nomStructure;
        private String contactStructure;
        private String adresseStructure;

        // Getters and setters
        public String getPrestataireId() { return prestataireId; }
        public void setPrestataireId(String prestataireId) { this.prestataireId = prestataireId; }

        public String getNomPrestataire() { return nomPrestataire; }
        public void setNomPrestataire(String nomPrestataire) { this.nomPrestataire = nomPrestataire; }

        public String getNomResponsablePrestation() { return nomResponsablePrestation; }
        public void setNomResponsablePrestation(String nomResponsablePrestation) { this.nomResponsablePrestation = nomResponsablePrestation; }

        public String getContactResponsablePrestation() { return contactResponsablePrestation; }
        public void setContactResponsablePrestation(String contactResponsablePrestation) { this.contactResponsablePrestation = contactResponsablePrestation; }

        public String getQualificationResponsablePrestation() { return qualificationResponsablePrestation; }
        public void setQualificationResponsablePrestation(String qualificationResponsablePrestation) { this.qualificationResponsablePrestation = qualificationResponsablePrestation; }

        public String getNomPrestation() { return nomPrestation; }
        public void setNomPrestation(String nomPrestation) { this.nomPrestation = nomPrestation; }

        public String getStructurePrestataire() { return structurePrestataire; }
        public void setStructurePrestataire(String structurePrestataire) { this.structurePrestataire = structurePrestataire; }

        public String getDirectionPrestataire() { return directionPrestataire; }
        public void setDirectionPrestataire(String directionPrestataire) { this.directionPrestataire = directionPrestataire; }

        public String getServicePrestataire() { return servicePrestataire; }
        public void setServicePrestataire(String servicePrestataire) { this.servicePrestataire = servicePrestataire; }

        public String getRolePrestataire() { return rolePrestataire; }
        public void setRolePrestataire(String rolePrestataire) { this.rolePrestataire = rolePrestataire; }

        public String getQualificationPrestataire() { return qualificationPrestataire; }
        public void setQualificationPrestataire(String qualificationPrestataire) { this.qualificationPrestataire = qualificationPrestataire; }

        public java.math.BigDecimal getMontantIntervention() { return montantIntervention; }
        public void setMontantIntervention(java.math.BigDecimal montantIntervention) { this.montantIntervention = montantIntervention; }

        public String getEquipementsUtilises() { return equipementsUtilises; }
        public void setEquipementsUtilises(String equipementsUtilises) { this.equipementsUtilises = equipementsUtilises; }

        public List<Long> getItemIds() { return itemIds; }
        public void setItemIds(List<Long> itemIds) { this.itemIds = itemIds; }

        public String getTrimestre() { return trimestre; }
        public void setTrimestre(String trimestre) { this.trimestre = trimestre; }

        public String getDateHeureDebut() { return dateHeureDebut; }
        public void setDateHeureDebut(String dateHeureDebut) { this.dateHeureDebut = dateHeureDebut; }

        public String getDateHeureFin() { return dateHeureFin; }
        public void setDateHeureFin(String dateHeureFin) { this.dateHeureFin = dateHeureFin; }


        public String getStatutIntervention() { return statutIntervention; }
        public void setStatutIntervention(String statutIntervention) { this.statutIntervention = statutIntervention; }

        public String getStatutValidation() { return statutValidation; }
        public void setStatutValidation(String statutValidation) { this.statutValidation = statutValidation; }

        public String getNomCi() { return nomCi; }
        public void setNomCi(String nomCi) { this.nomCi = nomCi; }

        public String getPrenomCi() { return prenomCi; }
        public void setPrenomCi(String prenomCi) { this.prenomCi = prenomCi; }

        public String getContactCi() { return contactCi; }
        public void setContactCi(String contactCi) { this.contactCi = contactCi; }

        public String getFonctionCi() { return fonctionCi; }
        public void setFonctionCi(String fonctionCi) { this.fonctionCi = fonctionCi; }

        public String getContactStructure() { return contactStructure; }
        public void setContactStructure(String contactStructure) { this.contactStructure = contactStructure; }

        public String getAdresseStructure() { return adresseStructure; }
        public void setAdresseStructure(String adresseStructure) { this.adresseStructure = adresseStructure; }


        public String getNomStructure() { return nomStructure; }
        public void setNomStructure(String nomStructure) { this.nomStructure = nomStructure; }

        public java.util.Map<Long, Integer> getItemQuantities() { return itemQuantities; }
        public void setItemQuantities(java.util.Map<Long, Integer> itemQuantities) { this.itemQuantities = itemQuantities; }
    }

    /**
     * Validation des quantités d'items avant création de prestation
     */
    private void validateItemQuantities(PrestationCreateRequest request) {
        if (request.getItemIds() != null && request.getItemQuantities() != null) {
            // Vérifier que toutes les quantités sont valides
            for (Long itemId : request.getItemIds()) {
                Integer quantity = request.getItemQuantities().get(itemId);
                if (quantity == null || quantity <= 0) {
                    throw new IllegalArgumentException("Quantité invalide pour l'item " + itemId);
                }
            }

            // Vérifier la disponibilité du budget au niveau item
            if (request.getNomPrestataire() != null) {
                // Déterminer le lot à partir du premier item
                Optional<com.dgsi.maintenance.entity.Item> firstItem = itemRepository.findById(request.getItemIds().get(0));
                if (firstItem.isPresent()) {
                    String lot = firstItem.get().getLot();
                    prestationService.checkBudgetAvailability(request.getNomPrestataire(), lot, request.getItemQuantities());
                }
            }

            // Vérifier la disponibilité du budget au niveau contrat
            if (request.getNomPrestataire() != null && request.getMontantIntervention() != null) {
                prestationService.checkContractBudgetAvailability(request.getNomPrestataire(), request.getMontantIntervention());
            }
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('PRESTATAIRE')")
    public ResponseEntity<?> createPrestation(@Valid @RequestBody PrestationCreateRequest request) {
        log.info("📥 Requête POST pour créer une prestation: {}", request.getNomPrestataire() != null ? request.getNomPrestataire() : "Nouvelle prestation");

        try {
            // Validation des quantités avant création
            validateItemQuantities(request);

            Prestation createdPrestation = prestationService.createPrestationFromRequest(request);
            log.info("✅ Prestation créée avec succès ID: {}", createdPrestation.getId());

            return ResponseEntity.ok(createdPrestation);

        } catch (com.dgsi.maintenance.service.BudgetInsufficientException e) {
            log.warn("⚠️ Budget insuffisant: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                new ErrorResponse("BUDGET_INSUFFICIENT", e.getMessage())
            );
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Erreur de validation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                new ErrorResponse("VALIDATION_ERROR", e.getMessage())
            );
        } catch (RuntimeException e) {
            log.error("❌ Erreur technique lors de la création: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("CREATION_ERROR", e.getMessage())
            );
        } catch (Exception e) {
            log.error("❌ Erreur inattendue lors de la création", e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("UNEXPECTED_ERROR", "Erreur inattendue lors de la création")
            );
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> updatePrestation(@PathVariable Long id, @Valid @RequestBody Prestation prestationDetails) {
        log.info("📥 Requête PUT pour mettre à jour prestation ID: {}", id);

        try {
            Prestation updatedPrestation = prestationService.updatePrestation(id, prestationDetails);
            return ResponseEntity.ok(updatedPrestation);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("NOT_FOUND", e.getMessage())
            );
        } catch (Exception e) {
            log.error("❌ Erreur lors de la mise à jour de la prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("UPDATE_ERROR", "Erreur lors de la mise à jour")
            );
        }
    }

    @GetMapping("/dev")
    public ResponseEntity<?> getAllPrestationsDev(@RequestParam(required = false) String secret) {
        // Simple guard: require known secret value. Change or remove for production.
        if (secret == null || !"dev-secret-please-change".equals(secret)) {
            return ResponseEntity.status(403).body("Forbidden: missing or invalid dev secret");
        }

        try {
            log.info("[DEV] getAllPrestationsDev - Returning all prestations without authentication");
            List<Prestation> prestations = prestationService.getAllPrestations();
            log.info("[DEV] Found {} prestations", prestations.size());
            return ResponseEntity.ok(prestations);
        } catch (Exception e) {
            log.error("[DEV] Error in getAllPrestationsDev", e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/dev")
    public ResponseEntity<?> createPrestationDev(@RequestParam(required = false) String secret, @RequestBody PrestationCreateRequest request) {
        if (secret == null || !"dev-secret-please-change".equals(secret)) {
            return ResponseEntity.status(403).body("Forbidden: missing or invalid dev secret");
        }

        try {
            log.info("[DEV] createPrestationDev - Creating prestation without authentication");
            log.info("[DEV] Request data: {}", request.getNomPrestataire());

            // Validation des quantités avant création (optionnelle en dev)
            try {
                validateItemQuantities(request);
            } catch (Exception e) {
                log.warn("[DEV] Validation warning (continuing anyway): {}", e.getMessage());
            }

            Prestation createdPrestation = prestationService.createPrestationFromRequest(request);
            log.info("[DEV] Prestation créée avec succès ID: {}", createdPrestation.getId());

            return ResponseEntity.ok(createdPrestation);

        } catch (com.dgsi.maintenance.service.BudgetInsufficientException e) {
            log.warn("[DEV] ⚠️ Budget insuffisant: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                new ErrorResponse("BUDGET_INSUFFICIENT", e.getMessage())
            );
        } catch (Exception e) {
            log.error("[DEV] Error in createPrestationDev", e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/mes-prestations/dev")
    public ResponseEntity<?> getMesPrestationsDev(@RequestParam(required = false) String secret,
                                                  @RequestParam(required = false) String username) {
        // Simple guard: require known secret value. Change or remove for production.
        if (secret == null || !"dev-secret-please-change".equals(secret)) {
            return ResponseEntity.status(403).body("Forbidden: missing or invalid dev secret");
        }

        try {
            log.info("[DEV] getMesPrestationsDev - Filtering by username: {}", username);

            List<Prestation> prestations;
            if (username != null && !username.trim().isEmpty()) {
                // Filter by prestataire username
                prestations = prestationService.findByPrestataireUsername(username);
                log.info("[DEV] Found {} prestations for prestataire: {}", prestations.size(), username);
            } else {
                // Return all prestations if no username provided
                prestations = prestationService.getAllPrestations();
                log.info("[DEV] Found {} total prestations (no filter)", prestations.size());
            }

            return ResponseEntity.ok(prestations);

        } catch (Exception e) {
            log.error("[DEV] Error in getMesPrestationsDev", e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/dev")
    public ResponseEntity<?> getPrestationByIdDev(@PathVariable Long id, @RequestParam(required = false) String secret) {
        // Simple guard: require known secret value. Change or remove for production.
        if (secret == null || !"dev-secret-please-change".equals(secret)) {
            return ResponseEntity.status(403).body("Forbidden: missing or invalid dev secret");
        }

        try {
            Optional<Prestation> prestation = prestationService.getPrestationById(id);
            return prestation.map(ResponseEntity::ok)
                           .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de la prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("FETCH_ERROR", "Erreur lors de la récupération de la prestation")
            );
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllPrestations(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            log.info("📥 GET /api/prestations - Accès à toutes les prestations par l'utilisateur: {} (page={}, size={})",
                    authentication.getName(), page, size);
            log.info("📥 Rôles de l'utilisateur: {}", authentication.getAuthorities());

            // Get paginated prestations - only show submitted ones (not drafts)
            var pageResult = prestationService.getAllPrestationsPaginated(page, size);

            // Convert to pagination response
            PaginationResponse<Prestation> response = new PaginationResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isFirst(),
                pageResult.isLast()
            );

            log.info("✅ {} prestations récupérées avec succès (page {}/{}, total: {})",
                    pageResult.getContent().size(), page + 1, pageResult.getTotalPages(), pageResult.getTotalElements());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des prestations", e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("FETCH_ERROR", "Erreur lors de la récupération des prestations")
            );
        }
    }

    @GetMapping("/mes-prestations")
    @PreAuthorize("hasRole('PRESTATAIRE')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMesPrestations(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            log.info("📥 GET /api/prestations/mes-prestations - Accès aux prestations du prestataire: {} (page={}, size={})",
                    authentication.getName(), page, size);
            String username = authentication.getName();

            // Get paginated prestations for the prestataire
            var pageResult = prestationService.findByPrestataireUsernamePaginated(username, page, size);

            // Convert to pagination response
            PaginationResponse<Prestation> response = new PaginationResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isFirst(),
                pageResult.isLast()
            );

            log.info("✅ {} prestations récupérées pour le prestataire {} (page {}/{}, total: {})",
                    pageResult.getContent().size(), username, page + 1, pageResult.getTotalPages(), pageResult.getTotalElements());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des prestations du prestataire {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("FETCH_PRESTATAIRE_ERROR", "Erreur lors de la récupération de vos prestations")
            );
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getPrestationById(@PathVariable Long id) {
        try {
            Optional<Prestation> prestation = prestationService.getPrestationById(id);
            return prestation.map(ResponseEntity::ok)
                           .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de la prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("FETCH_ERROR", "Erreur lors de la récupération de la prestation")
            );
        }
    }

    @GetMapping("/count-by-item")
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<Long> countByItem(@RequestParam String nomItem) {
        log.info("📊 Comptage des prestations pour l'item: {}", nomItem);

        try {
            Long count = prestationService.countByNomPrestation(nomItem);
            log.info("✅ Nombre de prestations pour '{}': {}", nomItem, count);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("❌ Erreur lors du comptage pour l'item: {}", nomItem, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/count-all-items")
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<java.util.Map<String, Long>> countAllItems(@RequestParam("trimestre") String trimestre) {
        log.info("📊 Comptage des prestations pour tous les items pour le trimestre: {}", trimestre);

        try {
            java.util.Map<String, Long> itemCounts = prestationService.countAllByNomPrestation(trimestre);
            log.info("✅ Nombre d'items avec comptage: {}", itemCounts.size());
            return ResponseEntity.ok(itemCounts);
        } catch (Exception e) {
            log.error("❌ Erreur lors du comptage des items: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    @Transactional(readOnly = true)
    public List<Prestation> searchPrestations(@RequestParam String keyword) {
        return prestationRepository.searchByKeyword(keyword);
    }
    
    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    @Transactional(readOnly = true)
    public ResponseEntity<Long> countAllPrestations() {
        log.info("📊 Comptage total des prestations non supprimées");

        try {
            Long count = prestationService.countAllNonDeleted();
            log.info("✅ Nombre total de prestations: {}", count);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("❌ Erreur lors du comptage total des prestations", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/trimestre/{trimestre}")
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getPrestationsByTrimestre(@PathVariable String trimestre) {
        try {
            log.info("📊 Récupération des prestations pour le trimestre: {}", trimestre);
            
            List<Prestation> prestations = prestationService.findByTrimestre(trimestre);
            
            log.info("✅ {} prestations trouvées pour T{}", prestations.size(), trimestre);
            return ResponseEntity.ok(prestations);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des prestations pour T{}", trimestre, e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("FETCH_ERROR", "Erreur lors de la récupération des prestations du trimestre")
            );
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deletePrestation(@PathVariable Long id, Authentication authentication) {
        log.info("📥 Requête DELETE pour prestation ID: {}", id);

        try {
            // Déterminer si c'est un admin ou un prestataire
            boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMINISTRATEUR"));

            // Vérifier les permissions pour les prestataires
            if (!isAdmin) {
                // Pour les données de test (IDs négatifs), permettre la suppression sans vérification
                if (id < 0) {
                    log.info("Suppression de données de test (ID négatif): {}", id);
                } else {
                    // Pour les prestations réelles, vérifier qu'ils sont propriétaires
                    Optional<Prestation> prestationOpt = prestationService.getPrestationById(id);
                    if (prestationOpt.isPresent()) {
                        Prestation prestation = prestationOpt.get();
                        String currentUsername = authentication.getName();

                        // Vérifier si le prestataire est propriétaire (multiple vérifications comme dans findByPrestataireUsername)
                        boolean isOwner = false;
                        // 1. Vérifier prestataireId
                        if (prestation.getPrestataireId() != null && prestation.getPrestataireId().equals(currentUsername)) {
                            isOwner = true;
                        }
                        // 3. Vérifier nomPrestataire (au cas où)
                        else if (prestation.getNomPrestataire() != null && prestation.getNomPrestataire().equals(currentUsername)) {
                            isOwner = true;
                        }

                        if (!isOwner) {
                            return ResponseEntity.status(403).body("Vous ne pouvez supprimer que vos propres prestations. Utilisateur: " + currentUsername +
                                    ", PrestataireId: " + prestation.getPrestataireId());
                        }
                    }
                }
            }

            boolean deleted = prestationService.deletePrestation(id, isAdmin);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression de la prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().body(new ErrorResponse("DELETE_ERROR", "Erreur lors de la suppression"));
        }
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('PRESTATAIRE')")
    public ResponseEntity<?> submitPrestationForValidation(@PathVariable Long id) {
        try {
            // Récupérer la prestation
            Optional<Prestation> prestationOpt = prestationService.getPrestationById(id);
            if (prestationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Prestation prestation = prestationOpt.get();

            // Vérifier que c'est bien le prestataire propriétaire
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_PRESTATAIRE"))) {
                // En mode développement, l'authentification peut ne pas correspondre exactement
                // Vérifier si c'est un environnement de développement
                boolean isProduction = "production".equals(System.getProperty("spring.profiles.active"));
                if (!isProduction) {
                    // En développement, permettre la soumission si l'utilisateur a le rôle PRESTATAIRE
                    // (la vérification de propriété est gérée au niveau de l'interface utilisateur)
                    log.info("Mode développement: autorisation de soumission pour prestataire");
                } else {
                    // En production, vérifier la propriété de la prestation
                    String currentUserId = authentication.getName();
                    if (prestation.getPrestataireId() != null && !prestation.getPrestataireId().equals(currentUserId)) {
                        return ResponseEntity.status(403).body("Vous ne pouvez soumettre que vos propres prestations");
                    }
                }
            }

            // Vérifier que la prestation n'est pas déjà validée
            if ("VALIDE".equals(prestation.getStatutValidation()) || "VALIDER".equals(prestation.getStatutValidation())) {
                return ResponseEntity.badRequest().body("Cette prestation a déjà été validée");
            }

            // CORRECTION : S'assurer qu'un ordre de commande existe pour cette prestation
            if (prestation.getOrdreCommande() == null) {
                log.info("Création ordre de commande manquant pour prestation ID: {}", id);
                // Utiliser le service pour créer l'ordre de commande
                try {
                    com.dgsi.maintenance.service.OrdreCommandeService ordreCommandeService = prestationService.getOrdreCommandeService();
                    com.dgsi.maintenance.entity.OrdreCommande ordre = ordreCommandeService.gererOrdreCommandePourPrestation(prestation);
                    prestation.setOrdreCommande(ordre);
                    prestationService.updatePrestation(id, prestation);
                    log.info("✅ Ordre de commande créé pour prestation ID: {}", id);
                } catch (Exception e) {
                    log.warn("⚠️ Échec création ordre de commande pour prestation ID: {} - {}", id, e.getMessage());
                    // Ne pas bloquer la soumission pour une erreur d'ordre de commande
                }
            }

            // Vérifier si une fiche existe déjà pour cette prestation
            Optional<FichePrestation> existingFiche = fichePrestationRepository.findByIdPrestation(prestation.getId().toString());
            if (existingFiche.isPresent()) {
                if (existingFiche.get() != null) {
                    FichePrestation fiche = existingFiche.get();
                    if (StatutFiche.VALIDE.equals(fiche.getStatut())) {
                        return ResponseEntity.badRequest().body("Une fiche de prestation validée existe déjà pour cette prestation");
                    } else if (StatutFiche.EN_ATTENTE.equals(fiche.getStatut())) {
                        // Mettre à jour la fiche existante au lieu de créer une nouvelle
                        log.info("Mise à jour de la fiche existante EN_ATTENTE pour prestation ID: {}", id);
                        fiche.setCommentaire("Mise à jour - " + fiche.getCommentaire());
                        fichePrestationRepository.save(fiche);
                        // Mettre à jour le statut de la prestation
                        prestation.setStatutValidation("EN_ATTENTE");
                        prestationService.updatePrestation(id, prestation);
                        return ResponseEntity.ok(fiche);
                    } else {
                        // Si la fiche est rejetée, on peut la resoumettre en la marquant comme EN_ATTENTE
                        fiche.setStatut(StatutFiche.EN_ATTENTE);
                        fiche.setCommentaire("Resoumise après rejet - " + fiche.getCommentaire());
                        fichePrestationRepository.save(fiche);
                        // Mettre à jour le statut de la prestation
                        prestation.setStatutValidation("EN_ATTENTE");
                        prestationService.updatePrestation(id, prestation);
                        return ResponseEntity.ok(fiche);
                    }
                }
            }

            // Créer la fiche de prestation
            FichePrestation fiche = creerFichePourPrestation(prestation);
            FichePrestation savedFiche = fichePrestationRepository.save(fiche);

            // Mettre à jour le statut de la prestation
            prestation.setStatutValidation("EN_ATTENTE");
            prestationService.updatePrestation(id, prestation);

            // Envoyer une notification aux administrateurs
            notificationService.envoyerNotificationFicheSoumise(
                savedFiche.getNomPrestataire(),
                savedFiche.getIdPrestation(),
                savedFiche.getNomItem() != null ? savedFiche.getNomItem() : (savedFiche.getItemsCouverts() != null ? savedFiche.getItemsCouverts() : "N/A")
            );

            return ResponseEntity.ok(savedFiche);

        } catch (Exception e) {
            log.error("Erreur lors de la soumission de la prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("SUBMIT_ERROR", "Erreur lors de la soumission: " + e.getMessage())
            );
        }
    }

    /**
     * Crée une fiche de prestation pour validation
     */
    private FichePrestation creerFichePourPrestation(Prestation prestation) {
        FichePrestation fiche = new FichePrestation();

        // Lier la fiche à la prestation
        String prestationId = prestation.getId() != null ? prestation.getId().toString() : null;
        if (prestationId == null || prestationId.isEmpty()) {
            throw new IllegalArgumentException("Impossible de créer une fiche: la prestation n'a pas d'id");
        }
        fiche.setIdPrestation(prestationId);
        fiche.setNomPrestataire(prestation.getNomPrestataire());
        fiche.setNomItem(prestation.getNomPrestation());
        fiche.setNomStructure(prestation.getNomStructure());

        // Collecter les items utilisés
        if (prestation.getItemsUtilises() != null && !prestation.getItemsUtilises().isEmpty()) {
            String itemsCouverts = prestation.getItemsUtilises().stream()
                .map(item -> item.getNomItem())
                .reduce((a, b) -> a + "," + b)
                .orElse("");
            fiche.setItemsCouverts(itemsCouverts);
        }

        // Date de réalisation basée sur la prestation
        fiche.setDateRealisation(prestation.getDateHeureDebut() != null ?
            prestation.getDateHeureDebut() : java.time.LocalDateTime.now());

        // Statut initial : en attente de validation
        fiche.setStatut(StatutFiche.EN_ATTENTE);

        // Quantité basée sur les items utilisés
        if (prestation.getItemsUtilises() != null) {
            fiche.setQuantite(prestation.getItemsUtilises().size());
        }

        // Commentaire initial
        fiche.setCommentaire("Fiche créée automatiquement pour la prestation " + prestation.getNomPrestation());

        // Statut intervention
        fiche.setStatutIntervention(prestation.getStatutIntervention());

        // Log pour debug
        System.out.println("[DEBUG] Création fiche: idPrestation=" + fiche.getIdPrestation() + ", statut=" + fiche.getStatut());

        return fiche;
    }

    /**
     * Génère et retourne le PDF d'une fiche de prestation
     */
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> generatePrestationPdf(@PathVariable Long id) {
        try {
            // Récupérer uniquement les données essentielles pour le PDF (éviter les relations lourdes)
            Prestation prestation = prestationService.findByIdForPdf(id).orElse(null);
            if (prestation == null) {
                return ResponseEntity.notFound().build();
            }

            // Générer le PDF avec un timeout pour éviter les blocages
            byte[] pdfContent = prestationPdfService.generatePrestationPdf(prestation);

            if (pdfContent == null || pdfContent.length == 0) {
                return ResponseEntity.internalServerError().build();
            }

            // Préparer les headers pour le téléchargement
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.set("Pragma", "no-cache");
            headers.set("Expires", "0");
            String filename = (prestation.getNomPrestataire() != null ?
                prestation.getNomPrestataire().replaceAll("[^a-zA-Z0-9]", "-") : "fiche-prestation") + ".pdf";
            headers.setContentDispositionFormData("attachment", filename);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF pour prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Valider une prestation directement (sans fiche)
     */
    @PutMapping("/{id}/valider")
    @PreAuthorize("hasRole('AGENT_DGSI') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> validerPrestation(@PathVariable Long id, @RequestParam(required = false) String commentaires) {
        try {
            Optional<Prestation> prestationOpt = prestationService.getPrestationById(id);
            if (prestationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Prestation prestation = prestationOpt.get();

            // Mettre à jour le statut de validation de la prestation
            prestation.setStatutValidation("VALIDE");
            prestationService.updatePrestation(id, prestation);

            // IMPORTANT: Also validate the corresponding fiche if it exists
            Optional<FichePrestation> ficheOpt = fichePrestationRepository.findByIdPrestation(prestation.getId().toString());
            if (ficheOpt.isPresent()) {
                FichePrestation fiche = ficheOpt.get();
                if (StatutFiche.EN_ATTENTE.equals(fiche.getStatut()) || StatutFiche.REJETE.equals(fiche.getStatut())) {
                    fiche.setStatut(StatutFiche.VALIDE);
                    if (commentaires != null && !commentaires.trim().isEmpty()) {
                        fiche.setCommentaire(commentaires);
                    }
                    fichePrestationRepository.save(fiche);
                    log.info("✅ Fiche ID:{} également validée automatiquement pour la prestation ID:{}", fiche.getId(), id);
                }
            }

            // Envoyer une notification au prestataire
            notificationService.envoyerNotificationFicheValidee(
                prestation.getNomPrestataire(),
                prestation.getId().toString()
            );

            log.info("✅ Prestation ID:{} validée directement par administrateur", id);
            return ResponseEntity.ok(prestation);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la validation directe de la prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("VALIDATION_ERROR", "Erreur lors de la validation: " + e.getMessage())
            );
        }
    }

    /**
     * Rejeter une prestation directement (sans fiche)
     */
    @PutMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('AGENT_DGSI') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> rejeterPrestation(@PathVariable Long id, @RequestParam(required = false) String commentaires) {
        try {
            Optional<Prestation> prestationOpt = prestationService.getPrestationById(id);
            if (prestationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Prestation prestation = prestationOpt.get();

            // Mettre à jour le statut de validation de la prestation
            prestation.setStatutValidation("REJETE");
            prestationService.updatePrestation(id, prestation);

            // Envoyer une notification au prestataire
            notificationService.envoyerNotificationFicheRejetee(
                prestation.getNomPrestataire(),
                prestation.getId().toString(),
                commentaires != null ? commentaires : "Rejetée par l'administrateur"
            );

            log.info("✅ Prestation ID:{} rejetée directement par administrateur", id);
            return ResponseEntity.ok(prestation);

        } catch (Exception e) {
            log.error("❌ Erreur lors du rejet direct de la prestation ID: {}", id, e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("REJECTION_ERROR", "Erreur lors du rejet: " + e.getMessage())
            );
        }
    }

    /**
     * Valider la sélection d'items avant création de prestation
     */
    @PostMapping("/validate-item-selection")
    @PreAuthorize("hasRole('PRESTATAIRE')")
    public ResponseEntity<?> validateItemSelection(@RequestBody java.util.Map<String, Integer> itemQuantities) {
        log.info("🔍 Validation de la sélection d'items: {}", itemQuantities);

        try {
            // DTO de réponse pour la validation
            class ValidationResponse {
                private boolean valid;
                private java.util.List<String> invalidItems;
                private boolean budgetExhausted;

                public ValidationResponse(boolean valid, java.util.List<String> invalidItems, boolean budgetExhausted) {
                    this.valid = valid;
                    this.invalidItems = invalidItems;
                    this.budgetExhausted = budgetExhausted;
                }

                // Getters
                public boolean isValid() { return valid; }
                public java.util.List<String> getInvalidItems() { return invalidItems; }
                public boolean isBudgetExhausted() { return budgetExhausted; }
            }

            java.util.List<String> invalidItems = new java.util.ArrayList<>();
            boolean budgetExhausted = false;

            // Construire une map id->quantité pour la vérification contractuelle
            java.util.Map<Long, Integer> itemQuantitiesById = new java.util.HashMap<>();
            String lotForCheck = null;

            // Pour chaque item dans la sélection
            for (java.util.Map.Entry<String, Integer> entry : itemQuantities.entrySet()) {
                String itemName = entry.getKey();
                Integer quantity = entry.getValue();

                // Trouver l'item par nom (décoder au cas où le client envoie des noms encodés)
                String decodedName = itemName;
                try {
                    decodedName = java.net.URLDecoder.decode(itemName, java.nio.charset.StandardCharsets.UTF_8);
                } catch (Exception ex) {
                    // si decode échoue, continuer avec la valeur originale
                }
                Optional<com.dgsi.maintenance.entity.Item> itemOpt = itemRepository.findFirstByNomItem(decodedName);
                com.dgsi.maintenance.entity.Item item = null;
                if (itemOpt.isPresent()) {
                    item = itemOpt.get();
                } else {
                    // Fallbacks: try original key, then partial case-insensitive search
                    itemOpt = itemRepository.findFirstByNomItem(itemName);
                    if (itemOpt.isPresent()) {
                        item = itemOpt.get();
                    } else {
                        java.util.List<com.dgsi.maintenance.entity.Item> matches = itemRepository.findByNomItemContainingIgnoreCase(decodedName);
                        if (!matches.isEmpty()) {
                            item = matches.get(0);
                            log.info("🔎 Item '{}' résolu par correspondance partielle -> '{}'", itemName, item.getNomItem());
                        }
                    }
                }

                if (item != null) {
                    // Recueillir pour la vérification contractuelle (logique par contrat uniquement)
                    itemQuantitiesById.put(item.getId(), quantity != null ? quantity : 0);
                    if (lotForCheck == null) lotForCheck = item.getLot();
                } else {
                    invalidItems.add(itemName + " (item non trouvé)");
                }
            }

            // Si pas d'items invalides jusqu'ici, effectuer la vérification contractuelle robuste
            if (invalidItems.isEmpty() && !itemQuantitiesById.isEmpty()) {
                // Récupérer le nom du prestataire connecté si présent
                String nomPrestataire = null;
                try {
                    var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.isAuthenticated() && !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                        nomPrestataire = auth.getName();
                    }
                } catch (Exception ex) {
                    // ignore - on fera la vérification sans nom si non disponible
                }

                try {
                    contratItemService.verifierDisponibiliteItems(nomPrestataire, lotForCheck, itemQuantitiesById);
                } catch (IllegalArgumentException iae) {
                    invalidItems.add(iae.getMessage());
                }
            }

            boolean isValid = invalidItems.isEmpty();
            ValidationResponse response = new ValidationResponse(isValid, invalidItems, budgetExhausted);

            log.info("✅ Validation terminée: valid={}, invalidItems={}, budgetExhausted={}",
                    isValid, invalidItems.size(), budgetExhausted);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la validation de la sélection d'items", e);
            return ResponseEntity.internalServerError().body(
                new ErrorResponse("VALIDATION_ERROR", "Erreur lors de la validation: " + e.getMessage())
            );
        }
    }

    // Classe pour les réponses d'erreur standardisées
    public static class ErrorResponse {
        private String code;
        private String message;

        public ErrorResponse(String code, String message) {
            this.code = code;
            this.message = message;
        }

        // Getters et setters
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}

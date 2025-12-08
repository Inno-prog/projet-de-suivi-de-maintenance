package com.dgsi.maintenance.controller;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.dgsi.maintenance.dto.LotWithContractorDto;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.StatutFiche;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import com.dgsi.maintenance.repository.UserRepository;
import com.dgsi.maintenance.service.FichePrestationPdfService;
import com.dgsi.maintenance.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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

@RestController
@RequestMapping("/api/fiches-prestation")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FichePrestationController {

        @Autowired
    private FichePrestationRepository ficheRepository;
    
        @Autowired
    private OrdreCommandeRepository ordreCommandeRepository;

        @Autowired
   private ContratRepository contratRepository;

        @Autowired
   private PrestationRepository prestationRepository;

        @Autowired
     private FichePrestationPdfService fichePdfService;

        @Autowired
          private NotificationService notificationService;
    
        @Autowired
        private UserRepository userRepository;

    @GetMapping("/dev")
    public List<FichePrestation> getAllFichesDev(@RequestParam(required = false) String secret) {
        // Simple guard: require known secret value. Change or remove for production.
        if (secret == null || !"dev-secret-please-change".equals(secret)) {
            throw new RuntimeException("Forbidden: missing or invalid dev secret");
        }

        System.out.println("[DEV] getAllFichesDev - Returning real fiches only (no test data)");

        // Get all real fiches from database
        List<FichePrestation> realFiches = ficheRepository.findAllWithStatutIntervention();
        System.out.println(String.format("[DEV] Found %d real fiches in database", realFiches.size()));

        System.out.println(String.format("[DEV] Returning %d total fiches (real only)", realFiches.size()));
        return realFiches;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI') or hasRole('PRESTATAIRE')")
    public List<FichePrestation> getAllFiches() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Vérifier si l'utilisateur est administrateur ou agent DGSI
        boolean isAdminOrAgent = authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().contains("ADMINISTRATEUR") ||
                             auth.getAuthority().contains("AGENT_DGSI"));

        if (isAdminOrAgent) {
            // Les administrateurs et agents DGSI voient toutes les fiches
            return ficheRepository.findAll();
        }

        // Pour les prestataires, filtrer uniquement leurs propres fiches
        String currentUserEmail = authentication.getName();
        Optional<com.dgsi.maintenance.entity.User> userOpt = userRepository.findByEmail(currentUserEmail);

        if (userOpt.isPresent() && userOpt.get() instanceof com.dgsi.maintenance.entity.Prestataire) {
            com.dgsi.maintenance.entity.Prestataire prestataire =
                (com.dgsi.maintenance.entity.Prestataire) userOpt.get();

            // Utiliser la relation JPA pour filtrer les fiches par prestataire ID
            List<FichePrestation> fiches = ficheRepository.findByPrestataireId(prestataire.getId());

            // Si pas de résultats, essayer aussi par nom (pour compatibilité avec anciennes données)
            if (fiches.isEmpty()) {
                String nomEntreprise = prestataire.getStructure() != null ?
                    prestataire.getStructure() : prestataire.getNom();
                fiches = ficheRepository.findByNomPrestataire(nomEntreprise);
            }

            return fiches;
        }

        // Si ce n'est pas un prestataire valide, retourner une liste vide
        return java.util.Collections.emptyList();
    }

    /**
     * Dev-only: force validation without security, requires a secret query param.
     * Useful for local testing when Keycloak tokens are not available.
     */
    @PutMapping("/dev/{id}/force-valider")
    public ResponseEntity<?> devForceValider(@PathVariable Long id,
                                             @RequestParam(required = false) String commentaires,
                                             @RequestParam(required = false) String secret) {
        // Simple guard: require known secret value. Change or remove for production.
        if (secret == null || !"dev-secret-please-change".equals(secret)) {
            return ResponseEntity.status(403).body("Forbidden: missing or invalid dev secret");
        }

        return ficheRepository.findById(id)
            .map(fiche -> {
                // add audit note when forcing
                String forcedNote = "(Validation forcée en mode DEV)";
                if (commentaires != null && !commentaires.trim().isEmpty()) {
                    fiche.setCommentaire(commentaires + " " + forcedNote);
                } else {
                    fiche.setCommentaire(forcedNote);
                }

                fiche.setStatut(StatutFiche.VALIDE);

                // Update prestation validation status if linked
                if (fiche.getIdPrestation() != null) {
                    try {
                        Long prestationId = Long.parseLong(fiche.getIdPrestation());
                        prestationRepository.findById(prestationId).ifPresent(prestation -> {
                            prestation.setStatutValidation("VALIDE");
                            prestationRepository.save(prestation);
                        });
                    } catch (NumberFormatException e) {
                        System.err.println("ID de prestation invalide: " + fiche.getIdPrestation());
                    }
                }

                FichePrestation saved = ficheRepository.save(fiche);
                notificationService.envoyerNotificationFicheValidee(fiche.getNomPrestataire(), fiche.getIdPrestation());
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/dev/{id}/force-rejeter")
    public ResponseEntity<?> devForceRejeter(@PathVariable Long id,
                                            @RequestParam(required = false) String commentaires,
                                            @RequestParam(required = false) String secret) {
        if (secret == null || !"dev-secret-please-change".equals(secret)) {
            return ResponseEntity.status(403).body("Forbidden: missing or invalid dev secret");
        }

        return ficheRepository.findById(id)
            .map(fiche -> {
                String forcedNote = "(Rejet forcé en mode DEV)";
                if (commentaires != null && !commentaires.trim().isEmpty()) {
                    fiche.setCommentaire(commentaires + " " + forcedNote);
                } else {
                    fiche.setCommentaire(forcedNote);
                }

                fiche.setStatut(StatutFiche.REJETE);

                if (fiche.getIdPrestation() != null) {
                    try {
                        Long prestationId = Long.parseLong(fiche.getIdPrestation());
                        prestationRepository.findById(prestationId).ifPresent(prestation -> {
                            prestation.setStatutValidation("REJETE");
                            prestationRepository.save(prestation);
                        });
                    } catch (NumberFormatException e) {
                        System.err.println("ID de prestation invalide: " + fiche.getIdPrestation());
                    }
                }

                FichePrestation saved = ficheRepository.save(fiche);
                notificationService.envoyerNotificationFicheRejetee(fiche.getNomPrestataire(), fiche.getIdPrestation(), commentaires);
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<?> getFicheById(@PathVariable Long id) {
        return ficheRepository.findById(id)
            .map(fiche -> {
                // Vérifier les permissions pour les prestataires
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                boolean isPrestataire = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().contains("PRESTATAIRE"));

                if (isPrestataire) {
                    // Les prestataires ne peuvent voir que leurs propres fiches
                    String currentUserEmail = authentication.getName();
                    Optional<com.dgsi.maintenance.entity.User> userOpt = userRepository.findByEmail(currentUserEmail);

                    if (userOpt.isPresent() && userOpt.get() instanceof com.dgsi.maintenance.entity.Prestataire) {
                        com.dgsi.maintenance.entity.Prestataire prestataire =
                            (com.dgsi.maintenance.entity.Prestataire) userOpt.get();

                        // Vérifier que la fiche appartient au prestataire
                        if (fiche.getPrestataire() == null || !fiche.getPrestataire().getId().equals(prestataire.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                        }
                    } else {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                }

                return ResponseEntity.ok().body(fiche);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-prestation/{prestationId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<?> getFicheByPrestationId(@PathVariable String prestationId) {
        return ficheRepository.findByIdPrestation(prestationId)
            .map(fiche -> {
                // Vérifier les permissions pour les prestataires
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                boolean isPrestataire = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().contains("PRESTATAIRE"));

                if (isPrestataire) {
                    // Les prestataires ne peuvent voir que leurs propres fiches
                    String currentUserEmail = authentication.getName();
                    Optional<com.dgsi.maintenance.entity.User> userOpt = userRepository.findByEmail(currentUserEmail);

                    if (userOpt.isPresent() && userOpt.get() instanceof com.dgsi.maintenance.entity.Prestataire) {
                        com.dgsi.maintenance.entity.Prestataire prestataire =
                            (com.dgsi.maintenance.entity.Prestataire) userOpt.get();

                        // Vérifier que la fiche appartient au prestataire
                        if (fiche.getPrestataire() == null || !fiche.getPrestataire().getId().equals(prestataire.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                        }
                    } else {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                }

                return ResponseEntity.ok().body(fiche);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('PRESTATAIRE')")
    public ResponseEntity<?> createFichePrestation(@RequestBody FichePrestation fiche) {
        // Récupérer l'utilisateur connecté
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();

        return userRepository.findByEmail(currentUserEmail)
            .map(user -> {
                if (user instanceof com.dgsi.maintenance.entity.Prestataire) {
                    com.dgsi.maintenance.entity.Prestataire prestataire =
                        (com.dgsi.maintenance.entity.Prestataire) user;

                    // Mettre à jour les informations du prestataire dans la fiche
                    fiche.setPrestataire(prestataire);
                    fiche.setNomPrestataire(prestataire.getNom());

                    // S'assurer que les champs obligatoires sont définis
                    if (fiche.getDateRealisation() == null) {
                        fiche.setDateRealisation(java.time.LocalDateTime.now());
                    }

                    // Enregistrer la fiche
                    FichePrestation savedFiche = ficheRepository.save(fiche);

                    // Mettre à jour la relation bidirectionnelle
                    prestataire.getFichesPrestation().add(savedFiche);
                    userRepository.save(prestataire);

                    return ResponseEntity.ok(savedFiche);
                } else {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    private void createOrUpdateOrdreCommandeForItem(String trimestre, int annee, String prestataireName, String itemName) {
        try {
            java.util.Optional<com.dgsi.maintenance.entity.OrdreCommande> existOc =
                    ordreCommandeRepository.findByPrestataireItemAndTrimestre(prestataireName, trimestreToNumero(trimestre))
                        .stream()
                        .filter(oc -> annee == oc.getAnnee())
                        .findFirst();

            com.dgsi.maintenance.entity.OrdreCommande oc;
            if (!existOc.isPresent()) {
                // Create a minimal OrdreCommande for the trimestre
                oc = new com.dgsi.maintenance.entity.OrdreCommande();
                oc.setAnnee(annee);
                oc.setTrimestre(trimestreToNumero(trimestre));
                oc.setPrestataireItem(prestataireName);
                // Map trimestre to numeroOc (T1 -> 1 ... T4 -> 4)
                int numero = trimestreToNumero(trimestre);
                oc.setNumeroOc(String.valueOf(numero));
                oc.setIdOC("OC" + numero + "-" + System.currentTimeMillis()); // Make unique

                // Optionally link to a contract for this prestataire (pick first match)
                java.util.List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findAll();
                for (com.dgsi.maintenance.entity.Contrat c : contrats) {
                    if (prestataireName != null && prestataireName.equals(c.getNomPrestataire())) {
                        oc.setContratId(c.getId());
                        break;
                    }
                }

                // initialize counter
                oc.setNombreArticlesUtilise(1);
                ordreCommandeRepository.save(oc);
                System.out.println("Created new OrdreCommande for annee: " + annee + ", trimestre: " + trimestre + ", prestataire: " + prestataireName);
            } else {
                oc = existOc.get();
                // increment the counter of prestations (use nombreArticlesUtilise as a counter)
                Integer current = oc.getNombreArticlesUtilise();
                oc.setNombreArticlesUtilise((current == null ? 0 : current) + 1);
                ordreCommandeRepository.save(oc);
                System.out.println("Updated existing OrdreCommande for annee: " + annee + ", trimestre: " + trimestre + ", prestataire: " + prestataireName);
            }
        } catch (Exception e) {
            System.err.println("Error creating/updating OrdreCommande: " + e.getMessage());
            e.printStackTrace();
            // Continue without failing the fiche creation
        }
    }

    private String determineTrimestre(java.time.LocalDateTime date) {
        int month = date.getMonthValue();
        if (month >= 1 && month <= 3) return "T1";
        if (month >= 4 && month <= 6) return "T2";
        if (month >= 7 && month <= 9) return "T3";
        return "T4";
    }

    private int trimestreToNumero(String trimestre) {
        switch (trimestre) {
            case "T1": return 1;
            case "T2": return 2;
            case "T3": return 3;
            default: return 4;
        }
    }

    private int determineAnnee(java.time.LocalDateTime date) {
        return date.getYear();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<FichePrestation> updateFiche(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        System.out.println("Mise à jour fiche ID: " + id);
        System.out.println("Données reçues: " + updates);

        return ficheRepository.findById(id)
            .map(fiche -> {
                try {
                    // Mettre à jour seulement les champs fournis
                    if (updates.containsKey("statut") && updates.get("statut") != null) {
                        String statutStr = updates.get("statut").toString();
                        System.out.println("Mise à jour statut: " + statutStr);
                        fiche.setStatut(StatutFiche.valueOf(statutStr));
                    }

                    FichePrestation saved = ficheRepository.save(fiche);
                    System.out.println("Fiche mise à jour avec succès: " + saved.getId());
                    return ResponseEntity.ok(saved);
                } catch (Exception e) {
                    System.err.println("Erreur lors de la mise à jour: " + e.getMessage());
                    e.printStackTrace();
                    throw new RuntimeException("Erreur lors de la mise à jour de la fiche: " + e.getMessage());
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteFiche(@PathVariable Long id) {
        return ficheRepository.findById(id)
            .map(fiche -> {
                ficheRepository.delete(fiche);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasRole('AGENT_DGSI') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> validerFiche(@PathVariable Long id, @RequestParam(required = false) String commentaires) {
        // Debug: log current authentication to diagnose 403 issues in dev
        org.springframework.security.core.Authentication authenticationDebug = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG] validerFiche - Authentication: " + authenticationDebug);
        System.out.println("[DEBUG] validerFiche - Principal: " + (authenticationDebug != null ? authenticationDebug.getPrincipal() : "null"));
        System.out.println("[DEBUG] validerFiche - Name: " + (authenticationDebug != null ? authenticationDebug.getName() : "null"));
        System.out.println("[DEBUG] validerFiche - Authorities: " + (authenticationDebug != null ? authenticationDebug.getAuthorities() : "null"));

        return ficheRepository.findById(id)
            .map(fiche -> {
                // Allow ADMINISTRATEUR to validate regardless of current statut.
                // Other roles (AGENT_DGSI) must only validate if fiche is EN_ATTENTE.
                org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                        .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMINISTRATEUR"));

                if (!isAdmin && !StatutFiche.EN_ATTENTE.equals(fiche.getStatut())) {
                    String msg = "La fiche n'est pas en attente de validation (statut actuel: " + fiche.getStatut() + ")";
                    return ResponseEntity.badRequest().body(msg);
                }

                // If admin forces validation, keep an audit note in the commentaire
                if (isAdmin && !StatutFiche.EN_ATTENTE.equals(fiche.getStatut())) {
                    String forcedNote = "(Validation forcée par ADMIN, ancien statut: " + fiche.getStatut() + ")";
                    if (commentaires != null && !commentaires.trim().isEmpty()) {
                        fiche.setCommentaire(commentaires + " " + forcedNote);
                    } else {
                        fiche.setCommentaire(forcedNote);
                    }
                } else if (commentaires != null) {
                    fiche.setCommentaire(commentaires);
                }

                fiche.setStatut(StatutFiche.VALIDE);

                // Mettre à jour le statut de validation de la prestation associée
                if (fiche.getIdPrestation() != null) {
                    try {
                        Long prestationId = Long.parseLong(fiche.getIdPrestation());
                        prestationRepository.findById(prestationId).ifPresent(prestation -> {
                            prestation.setStatutValidation("VALIDE");
                            prestationRepository.save(prestation);
                        });
                    } catch (NumberFormatException e) {
                        System.err.println("ID de prestation invalide: " + fiche.getIdPrestation());
                    }
                }

                FichePrestation saved = ficheRepository.save(fiche);

                // Envoyer une notification au prestataire
                notificationService.envoyerNotificationFicheValidee(fiche.getNomPrestataire(), fiche.getIdPrestation());

                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('AGENT_DGSI') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> rejeterFiche(@PathVariable Long id, @RequestParam(required = false) String commentaires) {
        // Debug: log current authentication to diagnose 403 issues in dev
        org.springframework.security.core.Authentication authenticationDebug = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG] rejeterFiche - Authentication: " + authenticationDebug);
        System.out.println("[DEBUG] rejeterFiche - Principal: " + (authenticationDebug != null ? authenticationDebug.getPrincipal() : "null"));
        System.out.println("[DEBUG] rejeterFiche - Name: " + (authenticationDebug != null ? authenticationDebug.getName() : "null"));
        System.out.println("[DEBUG] rejeterFiche - Authorities: " + (authenticationDebug != null ? authenticationDebug.getAuthorities() : "null"));

        return ficheRepository.findById(id)
            .map(fiche -> {
                // Allow ADMINISTRATEUR to reject regardless of current statut.
                // Other roles (AGENT_DGSI) must only reject if fiche is EN_ATTENTE.
                org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                        .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMINISTRATEUR"));

                if (!isAdmin && !StatutFiche.EN_ATTENTE.equals(fiche.getStatut())) {
                    String msg = "La fiche n'est pas en attente de validation (statut actuel: " + fiche.getStatut() + ")";
                    return ResponseEntity.badRequest().body(msg);
                }

                // If admin forces rejection, keep an audit note in the commentaire
                if (isAdmin && !StatutFiche.EN_ATTENTE.equals(fiche.getStatut())) {
                    String forcedNote = "(Rejet forcé par ADMIN, ancien statut: " + fiche.getStatut() + ")";
                    if (commentaires != null && !commentaires.trim().isEmpty()) {
                        fiche.setCommentaire(commentaires + " " + forcedNote);
                    } else {
                        fiche.setCommentaire(forcedNote);
                    }
                } else if (commentaires != null) {
                    fiche.setCommentaire(commentaires);
                }

                fiche.setStatut(StatutFiche.REJETE);

                // Mettre à jour le statut de validation de la prestation associée
                if (fiche.getIdPrestation() != null) {
                    try {
                        Long prestationId = Long.parseLong(fiche.getIdPrestation());
                        prestationRepository.findById(prestationId).ifPresent(prestation -> {
                            prestation.setStatutValidation("REJETE");
                            prestationRepository.save(prestation);
                        });
                    } catch (NumberFormatException e) {
                        System.err.println("ID de prestation invalide: " + fiche.getIdPrestation());
                    }
                }

                FichePrestation saved = ficheRepository.save(fiche);

                // Envoyer une notification au prestataire
                notificationService.envoyerNotificationFicheRejetee(fiche.getNomPrestataire(), fiche.getIdPrestation(), commentaires);

                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Dev/admin helper: mark a fiche as EN_ATTENTE (submitted) so admin buttons appear in the UI.
     * This is useful for local testing when you need to reset a fiche to the submitted state.
     */
    @PutMapping("/{id}/mark-en-attente")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<?> markEnAttente(@PathVariable Long id) {
        return ficheRepository.findById(id)
            .map(fiche -> {
                fiche.setStatut(StatutFiche.EN_ATTENTE);

                // Update linked prestation validation status if possible
                if (fiche.getIdPrestation() != null) {
                    try {
                        Long prestationId = Long.parseLong(fiche.getIdPrestation());
                        prestationRepository.findById(prestationId).ifPresent(prestation -> {
                            prestation.setStatutValidation("EN_ATTENTE");
                            prestationRepository.save(prestation);
                        });
                    } catch (NumberFormatException e) {
                        System.err.println("ID de prestation invalide: " + fiche.getIdPrestation());
                    }
                }

                FichePrestation saved = ficheRepository.save(fiche);
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Génère et retourne le PDF d'une fiche de prestation
     */
    @GetMapping("/{id}/pdf")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<byte[]> generateFichePdf(@PathVariable Long id) {
        try {
            FichePrestation fiche = ficheRepository.findById(id).orElse(null);
            if (fiche == null) {
                return ResponseEntity.notFound().build();
            }

            // Vérifier les permissions pour les prestataires
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isPrestataire = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().contains("PRESTATAIRE"));

            if (isPrestataire) {
                // Les prestataires ne peuvent voir que leurs propres fiches
                String currentUserEmail = authentication.getName();
                Optional<com.dgsi.maintenance.entity.User> userOpt = userRepository.findByEmail(currentUserEmail);

                if (userOpt.isPresent() && userOpt.get() instanceof com.dgsi.maintenance.entity.Prestataire) {
                    com.dgsi.maintenance.entity.Prestataire prestataire =
                        (com.dgsi.maintenance.entity.Prestataire) userOpt.get();

                    // Vérifier que la fiche appartient au prestataire
                    if (fiche.getPrestataire() == null || !fiche.getPrestataire().getId().equals(prestataire.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                } else {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }

            // Générer le PDF
            byte[] pdfContent = fichePdfService.generateFichePrestationPdf(fiche);

            if (pdfContent == null || pdfContent.length == 0) {
                return ResponseEntity.internalServerError().build();
            }

            // Préparer les headers pour le téléchargement
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = (fiche.getNomPrestataire() != null ?
                fiche.getNomPrestataire().replaceAll("[^a-zA-Z0-9]", "-") : "fiche-prestation") + ".pdf";
            headers.setContentDispositionFormData("attachment", filename);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get lots with their contractors for a given quarter
     */
    @GetMapping("/lots/{annee}/{trimestre}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<List<LotWithContractorDto>> getLotsWithContractors(@PathVariable int annee, @PathVariable int trimestre) {
        try {
            List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findAll();

            // Filter active contracts and group by lot
            Map<String, com.dgsi.maintenance.entity.Contrat> lotToContract = new java.util.HashMap<>();

            for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
                if (contrat.getStatut() == com.dgsi.maintenance.entity.StatutContrat.ACTIF &&
                    contrat.getLot() != null && !contrat.getLot().trim().isEmpty()) {
                    // For now, just take the first contract per lot
                    // In a real scenario, you might want to handle multiple contracts per lot differently
                    if (!lotToContract.containsKey(contrat.getLot())) {
                        lotToContract.put(contrat.getLot(), contrat);
                    }
                }
            }

            List<LotWithContractorDto> result = new java.util.ArrayList<>();
            for (Map.Entry<String, com.dgsi.maintenance.entity.Contrat> entry : lotToContract.entrySet()) {
                LotWithContractorDto dto = new LotWithContractorDto(entry.getKey());
                dto.addVille(entry.getValue().getVille());
                dto.addContractId(entry.getValue().getIdContrat());
                result.add(dto);
            }

            // Sort by lot number if possible
            result.sort((a, b) -> {
                try {
                    String aNum = a.getLot().replaceAll("[^0-9]", "");
                    String bNum = b.getLot().replaceAll("[^0-9]", "");
                    return Integer.compare(Integer.parseInt(aNum), Integer.parseInt(bNum));
                } catch (Exception e) {
                    return a.getLot().compareTo(b.getLot());
                }
            });

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get fiches for a specific lot and quarter
     */
    @GetMapping("/lots/{lot}/fiches/{annee}/{trimestre}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<?> getFichesForLotAndQuarter(
            @PathVariable String lot,
            @PathVariable int annee,
            @PathVariable int trimestre) {
        try {
            // Get all fiches
            List<FichePrestation> allFiches = ficheRepository.findAll();

            List<FichePrestation> filteredFiches = new java.util.ArrayList<>();

            for (FichePrestation fiche : allFiches) {
                // Check if fiche belongs to this lot and quarter
                if (fiche.getIdPrestation() != null) {
                    try {
                        Long prestationId = Long.parseLong(fiche.getIdPrestation());
                        java.util.Optional<com.dgsi.maintenance.entity.Prestation> prestationOpt = prestationRepository.findById(prestationId);

                        if (prestationOpt.isPresent()) {
                            com.dgsi.maintenance.entity.Prestation prestation = prestationOpt.get();
            
                            // Check if prestation is for this quarter and year
                            boolean matchesQuarter = prestation.getTrimestre() != null &&
                                trimestreToNumero(prestation.getTrimestre()) == trimestre;
            
                            // Check if prestation is for this year (using dateHeureDebut or dateHeureFin)
                            // If no dates available, assume it matches (for backward compatibility)
                            boolean matchesYear = true; // Default to true
                            if (prestation.getDateHeureDebut() != null) {
                                matchesYear = prestation.getDateHeureDebut().getYear() == annee;
                            } else if (prestation.getDateHeureFin() != null) {
                                matchesYear = prestation.getDateHeureFin().getYear() == annee;
                            }
            
                            // For the lot matching, we need to check if the prestataire has a contract for this lot
                            boolean matchesLot = false;
                            if (fiche.getPrestataire() != null) {
                                List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findByPrestataireId(fiche.getPrestataire().getId());
                                for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
                                    if (lot.equals(contrat.getLot()) && contrat.getStatut() == com.dgsi.maintenance.entity.StatutContrat.ACTIF) {
                                        matchesLot = true;
                                        break;
                                    }
                                }
                            }
            
                            if (matchesQuarter && matchesYear && matchesLot) {
                                filteredFiches.add(fiche);
                            }
                        }
                    } catch (NumberFormatException e) {
                        // Skip invalid prestation IDs
                    }
                }
            }

            // Sort by date (most recent first) and then by number
            filteredFiches.sort((a, b) -> {
                // First by date descending (handle null dates)
                if (a.getDateRealisation() == null && b.getDateRealisation() == null) {
                    return 0;
                } else if (a.getDateRealisation() == null) {
                    return 1; // null dates go to the end
                } else if (b.getDateRealisation() == null) {
                    return -1; // null dates go to the end
                }

                int dateCompare = b.getDateRealisation().compareTo(a.getDateRealisation());
                if (dateCompare != 0) return dateCompare;

                // Then by ID (as a proxy for creation order)
                return a.getId().compareTo(b.getId());
            });

            return ResponseEntity.ok(filteredFiches);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Generate global PDF for all fiches in a lot for a quarter
     */
    @GetMapping("/lots/{lot}/pdf/{annee}/{trimestre}")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<byte[]> generateLotQuarterlyPdf(
            @PathVariable String lot,
            @PathVariable int annee,
            @PathVariable int trimestre) {
        try {
            // Get fiches for this lot and quarter
            ResponseEntity<?> fichesResponse = getFichesForLotAndQuarter(lot, annee, trimestre);
            if (!fichesResponse.getStatusCode().is2xxSuccessful() || fichesResponse.getBody() == null) {
                return ResponseEntity.notFound().build();
            }

            @SuppressWarnings("unchecked")
            List<FichePrestation> fiches = (List<FichePrestation>) fichesResponse.getBody();
            if (fiches.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Generate combined PDF - for now, just generate individual PDFs and combine them
            // This is a placeholder - you might need to implement a proper combined PDF service
            byte[] pdfContent = fichePdfService.generateFichePrestationPdf(fiches.get(0)); // Placeholder

            if (pdfContent == null || pdfContent.length == 0) {
                return ResponseEntity.internalServerError().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = "fiches-" + lot.replaceAll("[^a-zA-Z0-9]", "-") + "-" + annee + "-T" + trimestre + ".pdf";
            headers.setContentDispositionFormData("attachment", filename);

            return ResponseEntity.ok().headers(headers).body(pdfContent);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Generate service sheet PDF for a specific prestataire in a lot for a quarter
     */
    @GetMapping("/lots/{lot}/fiche-prestataire/{annee}/{trimestre}/{prestataire}")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI') or hasRole('PRESTATAIRE')")
    public ResponseEntity<byte[]> generatePrestataireServiceSheetPdf(
            @PathVariable String lot,
            @PathVariable int annee,
            @PathVariable int trimestre,
            @PathVariable String prestataire) {
        try {
            // Récupérer les fiches pour ce prestataire spécifique
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "http://localhost:8085/api/ordres-commande/trimestre/" + trimestre + "/lot/" + lot + "/fiches";
            
            try {
                org.springframework.http.ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> fichesData = (List<Map<String, Object>>) response.getBody().get("fiches");
                    
                    // Filtrer les fiches pour ce prestataire uniquement
                    List<FichePrestation> fiches = new java.util.ArrayList<>();
                    if (fichesData != null) {
                        for (Map<String, Object> ficheData : fichesData) {
                            if (ficheData.get("id") != null) {
                                Long ficheId = Long.valueOf(ficheData.get("id").toString());
                                ficheRepository.findById(ficheId).ifPresent(fiche -> {
                                    if (prestataire.equals(fiche.getNomPrestataire())) {
                                        fiches.add(fiche);
                                    }
                                });
                            }
                        }
                    }
                    
                    // Générer le PDF pour ce prestataire
                    byte[] pdfContent = fichePdfService.generatePrestataireServiceSheetPdf(lot, annee, trimestre, prestataire, fiches);
                    
                    if (pdfContent == null || pdfContent.length == 0) {
                        return ResponseEntity.internalServerError().build();
                    }
                    
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_PDF);
                    String filename = "fiche-" + prestataire.replaceAll("[^a-zA-Z0-9]", "-") + "-" + lot.replaceAll("[^a-zA-Z0-9]", "-") + "-" + annee + "-T" + trimestre + ".pdf";
                    headers.setContentDispositionFormData("attachment", filename);
                    
                    return ResponseEntity.ok().headers(headers).body(pdfContent);
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de la récupération des fiches pour prestataire: " + e.getMessage());
            }
            
            // Si échec, générer un PDF vide pour ce prestataire
            byte[] pdfContent = fichePdfService.generatePrestataireServiceSheetPdf(lot, annee, trimestre, prestataire, new java.util.ArrayList<>());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = "fiche-" + prestataire.replaceAll("[^a-zA-Z0-9]", "-") + "-" + lot.replaceAll("[^a-zA-Z0-9]", "-") + "-" + annee + "-T" + trimestre + ".pdf";
            headers.setContentDispositionFormData("attachment", filename);
            
            return ResponseEntity.ok().headers(headers).body(pdfContent);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Generate global service sheet PDF showing all items for a lot in a quarter with usage counts
     */
    @GetMapping("/lots/{lot}/fiche-globale/{annee}/{trimestre}")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<byte[]> generateGlobalServiceSheetPdf(
            @PathVariable String lot,
            @PathVariable int annee,
            @PathVariable int trimestre) {
        try {
            // Récupérer les fiches via l'API OrdreCommande qui gère correctement le filtrage par lot et trimestre
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "http://localhost:8085/api/ordres-commande/trimestre/" + trimestre + "/lot/" + lot + "/fiches";
            
            try {
                org.springframework.http.ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> fichesData = (List<Map<String, Object>>) response.getBody().get("fiches");
                    
                    // Convertir les données en objets FichePrestation
                    List<FichePrestation> fiches = new java.util.ArrayList<>();
                    if (fichesData != null) {
                        for (Map<String, Object> ficheData : fichesData) {
                            if (ficheData.get("id") != null) {
                                Long ficheId = Long.valueOf(ficheData.get("id").toString());
                                ficheRepository.findById(ficheId).ifPresent(fiches::add);
                            }
                        }
                    }
                    
                    // Générer le PDF avec les fiches récupérées
                    byte[] pdfContent = fichePdfService.generateGlobalServiceSheetPdf(lot, annee, trimestre, fiches);
                    
                    if (pdfContent == null || pdfContent.length == 0) {
                        return ResponseEntity.internalServerError().build();
                    }
                    
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_PDF);
                    String filename = "fiche-globale-" + lot.replaceAll("[^a-zA-Z0-9]", "-") + "-" + annee + "-T" + trimestre + ".pdf";
                    headers.setContentDispositionFormData("attachment", filename);
                    
                    return ResponseEntity.ok().headers(headers).body(pdfContent);
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de la récupération des fiches: " + e.getMessage());
            }
            
            // Si échec, générer un PDF vide
            byte[] pdfContent = fichePdfService.generateGlobalServiceSheetPdf(lot, annee, trimestre, new java.util.ArrayList<>());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = "fiche-globale-" + lot.replaceAll("[^a-zA-Z0-9]", "-") + "-" + annee + "-T" + trimestre + ".pdf";
            headers.setContentDispositionFormData("attachment", filename);
            
            return ResponseEntity.ok().headers(headers).body(pdfContent);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

}

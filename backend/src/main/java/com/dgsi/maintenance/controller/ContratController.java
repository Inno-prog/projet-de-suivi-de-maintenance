package com.dgsi.maintenance.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.entity.StatutContrat;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.service.FileUploadService;
import com.dgsi.maintenance.service.KeycloakService;
import com.dgsi.maintenance.util.LotUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import org.springframework.web.multipart.MultipartFile;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/contrats")
@CrossOrigin(origins = "*", maxAge = 3600)

public class ContratController {
    
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private com.dgsi.maintenance.repository.LotRepository lotRepository;

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private KeycloakService keycloakService;

    @Autowired
    private com.dgsi.maintenance.repository.UserRepository userRepository;

    @Autowired
    private com.dgsi.maintenance.repository.PrestataireRepository prestataireRepository;

    @GetMapping
    // @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<List<Contrat>> getAllContrats() {
        try {
            log.info("Tentative de récupération de tous les contrats");
            List<Contrat> contrats = contratRepository.findAll();

            // Ensure lotName is populated for each contract
            for (Contrat contrat : contrats) {
                if (contrat.getLotEntity() != null && (contrat.getLot() == null || contrat.getLot().trim().isEmpty())) {
                    contrat.setLot(sanitizeLotName(contrat.getLotEntity().getNomLot()));
                }
            }

            log.info("Nombre de contrats récupérés: {}", contrats.size());
            return ResponseEntity.ok(contrats);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des contrats: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<Contrat> getContratById(@PathVariable Long id) {
        return contratRepository.findById(id)
            .map(contrat -> ResponseEntity.ok().body(contrat))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> createContrat(
            @RequestParam(value = "idContrat", required = false) String idContrat,
            @RequestParam(value = "nomPrestataire", required = false) String nomPrestataire,
            @RequestParam(value = "prestataireId", required = false) String prestataireId,
            @RequestParam(value = "lotId", required = false) Long lotId,
            @RequestParam(value = "regions", required = false) String regions,
            @RequestParam(value = "dateDebut", required = false) String dateDebut,
            @RequestParam(value = "dateFin", required = false) String dateFin,
            @RequestParam(value = "montant", required = false) Double montant,
            @RequestParam(value = "statut", required = false) String statut,
            @RequestParam(value = "typeContrat", required = false) String typeContrat,
            @RequestParam(value = "itemIds", required = false) List<Long> itemIds,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {
            // Generate idContrat if not provided
            if (idContrat == null || idContrat.trim().isEmpty()) {
                idContrat = generateContratId();
            } else if (contratRepository.existsByIdContrat(idContrat)) {
                return ResponseEntity.badRequest().build();
            }

            // Require a prestataire for a contract to avoid orphan contracts
            if (nomPrestataire == null || nomPrestataire.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }

            Contrat contrat = new Contrat();
            contrat.setIdContrat(idContrat);
            contrat.setNomPrestataire(nomPrestataire);
            
            // Définir prestataireId automatiquement en fonction de nomPrestataire
            if (prestataireId != null && !prestataireId.trim().isEmpty()) {
                // Vérifier que le prestataire existe dans la table users avant de définir l'ID
                if (userRepository.existsById(prestataireId)) {
                    contrat.setPrestataireId(prestataireId);
                    log.info("PrestataireId défini et validé: {}", prestataireId);
                } else {
                    log.warn("PrestataireId fourni n'existe pas dans la table users: {}. Tentative de recherche par nom...", prestataireId);
                    // Si l'ID fourni est invalide, essayer de trouver le prestataire par nom
                    java.util.Optional<com.dgsi.maintenance.entity.Prestataire> prestataireOpt = userRepository.findAllPrestataires()
                        .stream()
                        .filter(u -> u instanceof com.dgsi.maintenance.entity.Prestataire)
                        .map(u -> (com.dgsi.maintenance.entity.Prestataire) u)
                        .filter(p -> nomPrestataire.equalsIgnoreCase(p.getStructure()))
                        .findFirst();
                    if (prestataireOpt.isPresent()) {
                        String foundPrestataireId = prestataireOpt.get().getId();
                        contrat.setPrestataireId(foundPrestataireId);
                        log.info("PrestataireId automatiquement défini via nom: {}", foundPrestataireId);
                    } else {
                        log.warn("Aucun prestataire trouvé pour le nom: {}. Le contrat sera créé sans prestataireId.", nomPrestataire);
                    }
                }
            } else {
                // Rechercher le prestataire correspondant au nom_prestataire
                java.util.Optional<com.dgsi.maintenance.entity.Prestataire> prestataireOpt = userRepository.findAllPrestataires()
                    .stream()
                    .filter(u -> u instanceof com.dgsi.maintenance.entity.Prestataire)
                    .map(u -> (com.dgsi.maintenance.entity.Prestataire) u)
                    .filter(p -> nomPrestataire.equalsIgnoreCase(p.getStructure()))
                    .findFirst();
                if (prestataireOpt.isPresent()) {
                    String foundPrestataireId = prestataireOpt.get().getId();
                    contrat.setPrestataireId(foundPrestataireId);
                    log.info("PrestataireId automatiquement défini: {}", foundPrestataireId);
                } else {
                    log.warn("Aucun prestataire trouvé pour le nom: {}. Le contrat sera créé sans prestataireId.", nomPrestataire);
                }
            }
            if (regions != null && !regions.trim().isEmpty()) {
                contrat.setRegions(regions);
            }

            // Set lot entity if lotId is provided
            if (lotId != null) {
                com.dgsi.maintenance.entity.Lot lotEntity = lotRepository.findById(lotId).orElse(null);
                if (lotEntity != null) {
                    contrat.setLotEntity(lotEntity);
                }
            }

            contrat.setDateDebut(dateDebut != null ? LocalDate.parse(dateDebut) : null);
            contrat.setDateFin(dateFin != null ? LocalDate.parse(dateFin) : null);
            contrat.setMontant(montant);
            contrat.setTypeContrat(typeContrat);
            contrat.setStatut(statut != null ? StatutContrat.valueOf(statut) : StatutContrat.ACTIF);

            // Handle file upload
            if (file != null && !file.isEmpty()) {
                List<String> filePaths = fileUploadService.uploadFiles(new MultipartFile[]{file}, "contrats");
                if (!filePaths.isEmpty()) {
                    contrat.setFichierContrat(filePaths.get(0));
                }
            }

            // Note: Direct item association with contracts has been removed
            // Items are now associated via OrdreCommande entities

            Contrat savedContrat = contratRepository.save(contrat);
            log.info("Contrat créé avec succès: {}", savedContrat.getId());
            return ResponseEntity.ok(savedContrat);

        } catch (Exception e) {
            log.error("Erreur lors de la création du contrat: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(consumes = "application/json")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> createContratJson(@Valid @RequestBody Contrat contrat) {
        // Generate idContrat if not provided
        if (contrat.getIdContrat() == null || contrat.getIdContrat().trim().isEmpty()) {
            String generatedId = generateContratId();
            contrat.setIdContrat(generatedId);
        } else if (contratRepository.existsByIdContrat(contrat.getIdContrat())) {
            return ResponseEntity.badRequest().build();
        }
        // Don't allow creating a contract without prestataire
        if (contrat.getNomPrestataire() == null || contrat.getNomPrestataire().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Définir prestataireId automatiquement en fonction de nomPrestataire
        if (contrat.getPrestataireId() == null || contrat.getPrestataireId().trim().isEmpty()) {
            java.util.Optional<com.dgsi.maintenance.entity.Prestataire> prestataireOpt = userRepository.findAllPrestataires()
                .stream()
                .filter(u -> u instanceof com.dgsi.maintenance.entity.Prestataire)
                .map(u -> (com.dgsi.maintenance.entity.Prestataire) u)
                .filter(p -> contrat.getNomPrestataire().equalsIgnoreCase(p.getStructure()))
                .findFirst();
            if (prestataireOpt.isPresent()) {
                String foundPrestataireId = prestataireOpt.get().getId();
                contrat.setPrestataireId(foundPrestataireId);
                log.info("PrestataireId automatiquement défini: {}", foundPrestataireId);
            } else {
                log.warn("Aucun prestataire trouvé pour le nom: {}", contrat.getNomPrestataire());
            }
        } else {
            // Si un prestataireId est déjà fourni, vérifier qu'il existe
            String providedPrestataireId = contrat.getPrestataireId();
            if (!prestataireRepository.existsById(providedPrestataireId) && !userRepository.existsById(providedPrestataireId)) {
                log.warn("PrestataireId fourni n'existe pas: {}. Tentative de recherche par nom...", providedPrestataireId);
                // Si l'ID fourni est invalide, essayer de trouver le prestataire par nom
                java.util.Optional<com.dgsi.maintenance.entity.Prestataire> prestataireOpt = userRepository.findAllPrestataires()
                    .stream()
                    .filter(u -> u instanceof com.dgsi.maintenance.entity.Prestataire)
                    .map(u -> (com.dgsi.maintenance.entity.Prestataire) u)
                    .filter(p -> contrat.getNomPrestataire().equalsIgnoreCase(p.getStructure()))
                    .findFirst();
                if (prestataireOpt.isPresent()) {
                    String foundPrestataireId = prestataireOpt.get().getId();
                    contrat.setPrestataireId(foundPrestataireId);
                    log.info("PrestataireId automatiquement défini via nom: {}", foundPrestataireId);
                } else {
                    log.warn("Aucun prestataire trouvé pour le nom: {}. Le contrat sera créé sans prestataireId.", contrat.getNomPrestataire());
                    contrat.setPrestataireId(null);
                }
            }
        }
        
        // Gérer le lot
        if (contrat.getLot() != null && !contrat.getLot().trim().isEmpty()) {
            // Rechercher le lot par nom
            java.util.Optional<com.dgsi.maintenance.entity.Lot> lotOpt = lotRepository.findAll()
                .stream()
                .filter(l -> contrat.getLot().equalsIgnoreCase(l.getNomLot()))
                .findFirst();
            if (lotOpt.isPresent()) {
                contrat.setLotEntity(lotOpt.get());
            } else {
                log.warn("Aucun lot trouvé pour le nom: {}", contrat.getLot());
            }
        }
        
        return ResponseEntity.ok(contratRepository.save(contrat));
    }

    private String generateContratId() {
        // Generate a unique contract ID
        long count = contratRepository.count() + 1;
        return String.format("CTR-%04d", count);
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> updateContrat(
            @PathVariable Long id,
            @RequestParam(value = "idContrat", required = false) String idContrat,
            @RequestParam(value = "nomPrestataire", required = false) String nomPrestataire,
            @RequestParam(value = "prestataireId", required = false) String prestataireId,
            @RequestParam(value = "lotId", required = false) Long lotId,
            @RequestParam(value = "regions", required = false) String regions,
            @RequestParam(value = "dateDebut", required = false) String dateDebut,
            @RequestParam(value = "dateFin", required = false) String dateFin,
            @RequestParam(value = "montant", required = false) Double montant,
            @RequestParam(value = "statut", required = false) String statut,
            @RequestParam(value = "typeContrat", required = false) String typeContrat,
            @RequestParam(value = "itemIds", required = false) List<Long> itemIds,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Optional<Contrat> contratOpt = contratRepository.findById(id);
        if (contratOpt.isPresent()) {
            Contrat contrat = contratOpt.get();
            try {
                if (idContrat != null) contrat.setIdContrat(idContrat);
                if (nomPrestataire != null) {
                    contrat.setNomPrestataire(nomPrestataire);
                    // Si nomPrestataire change, mettre à jour prestataireId automatiquement
                    java.util.Optional<com.dgsi.maintenance.entity.Prestataire> prestataireOpt = userRepository.findAllPrestataires()
                        .stream()
                        .filter(u -> u instanceof com.dgsi.maintenance.entity.Prestataire)
                        .map(u -> (com.dgsi.maintenance.entity.Prestataire) u)
                        .filter(p -> nomPrestataire.equalsIgnoreCase(p.getStructure()))
                        .findFirst();
                    if (prestataireOpt.isPresent()) {
                        String foundPrestataireId = prestataireOpt.get().getId();
                        // Vérifier que l'ID existe bien dans la table prestataires
                        if (prestataireRepository.existsById(foundPrestataireId)) {
                            contrat.setPrestataireId(foundPrestataireId);
                            log.info("PrestataireId automatiquement mis à jour et validé: {}", foundPrestataireId);
                        } else {
                            log.warn("Prestataire trouvé mais son ID n'existe pas dans la table prestataires: {}. Le prestataireId ne sera pas mis à jour.", foundPrestataireId);
                        }
                    } else {
                        log.warn("Aucun prestataire trouvé pour le nom: {}", nomPrestataire);
                    }
                } else if (prestataireId != null && !prestataireId.trim().isEmpty()) {
                    // Vérifier que le prestataireId fourni existe dans la table prestataires
                    if (prestataireRepository.existsById(prestataireId)) {
                        contrat.setPrestataireId(prestataireId);
                        log.info("PrestataireId mis à jour et validé: {}", prestataireId);
                    } else {
                        log.warn("PrestataireId fourni n'existe pas dans la table prestataires: {}. Le prestataireId ne sera pas mis à jour.", prestataireId);
                    }
                }
                if (regions != null && !regions.trim().isEmpty()) {
                    contrat.setRegions(regions);
                }

                // Set lot entity if lotId is provided
                if (lotId != null) {
                    com.dgsi.maintenance.entity.Lot lotEntity = lotRepository.findById(lotId).orElse(null);
                    if (lotEntity != null) {
                        contrat.setLotEntity(lotEntity);
                    }
                }

                if (dateDebut != null) contrat.setDateDebut(LocalDate.parse(dateDebut));
                if (dateFin != null) contrat.setDateFin(LocalDate.parse(dateFin));
                if (montant != null) contrat.setMontant(montant);
                if (statut != null) contrat.setStatut(StatutContrat.valueOf(statut));
                if (typeContrat != null) contrat.setTypeContrat(typeContrat);

                // Handle file upload
                if (file != null && !file.isEmpty()) {
                    List<String> filePaths = fileUploadService.uploadFiles(new MultipartFile[]{file}, "contrats");
                    if (!filePaths.isEmpty()) {
                        contrat.setFichierContrat(filePaths.get(0));
                    }
                }

                // Handle items
                if (itemIds != null && !itemIds.isEmpty()) {
                    Set<Item> items = itemIds.stream()
                        .map(itemId -> itemRepository.findById(itemId).orElse(null))
                        .filter(item -> item != null)
                        .collect(Collectors.toSet());
                    contrat.setItems(items);
                }

                Contrat savedContrat = contratRepository.save(contrat);
                log.info("Contrat mis à jour avec succès: {}", id);
                return ResponseEntity.ok(savedContrat);

            } catch (Exception e) {
                log.error("Erreur lors de la mise à jour du contrat {}: ", id, e);
                return ResponseEntity.internalServerError().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping(value = "/{id}", consumes = "application/json")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> updateContratJson(@PathVariable Long id, @Valid @RequestBody Contrat contratDetails) {
        return contratRepository.findById(id)
            .map(contrat -> {
                contrat.setDateDebut(contratDetails.getDateDebut());
                contrat.setDateFin(contratDetails.getDateFin());
                
                if (contratDetails.getNomPrestataire() != null) {
                    contrat.setNomPrestataire(contratDetails.getNomPrestataire());
                    // Si nomPrestataire change, mettre à jour prestataireId automatiquement
                    java.util.Optional<com.dgsi.maintenance.entity.Prestataire> prestataireOpt = userRepository.findAllPrestataires()
                        .stream()
                        .filter(u -> u instanceof com.dgsi.maintenance.entity.Prestataire)
                        .map(u -> (com.dgsi.maintenance.entity.Prestataire) u)
                        .filter(p -> contratDetails.getNomPrestataire().equalsIgnoreCase(p.getStructure()))
                        .findFirst();
                    if (prestataireOpt.isPresent()) {
                        String foundPrestataireId = prestataireOpt.get().getId();
                        // Vérifier que l'ID existe bien dans la table prestataires
                        if (prestataireRepository.existsById(foundPrestataireId)) {
                            contrat.setPrestataireId(foundPrestataireId);
                            log.info("PrestataireId automatiquement mis à jour et validé: {}", foundPrestataireId);
                        } else {
                            log.warn("Prestataire trouvé mais son ID n'existe pas dans la table prestataires: {}. Le prestataireId ne sera pas mis à jour.", foundPrestataireId);
                        }
                    } else {
                        log.warn("Aucun prestataire trouvé pour le nom: {}", contratDetails.getNomPrestataire());
                    }
                }
                
                // Si un prestataireId est fourni dans contratDetails, vérifier qu'il existe
                if (contratDetails.getPrestataireId() != null && !contratDetails.getPrestataireId().trim().isEmpty()) {
                    String providedPrestataireId = contratDetails.getPrestataireId();
                    if (prestataireRepository.existsById(providedPrestataireId)) {
                        contrat.setPrestataireId(providedPrestataireId);
                        log.info("PrestataireId mis à jour et validé: {}", providedPrestataireId);
                    } else {
                        log.warn("PrestataireId fourni n'existe pas dans la table prestataires: {}. Le prestataireId ne sera pas mis à jour.", providedPrestataireId);
                    }
                }
                
                contrat.setMontant(contratDetails.getMontant());
                return ResponseEntity.ok(contratRepository.save(contrat));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    @Transactional
    public ResponseEntity<?> deleteContrat(@PathVariable Long id) {
        return contratRepository.findById(id)
            .map(contrat -> {
                // Supprimer les références dans la table contrat_regions (table de jointure Many-to-Many)
                contratRepository.deleteContratRegions(id);
                
                // Supprimer le contrat
                contratRepository.delete(contrat);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/prestataire/{prestataireId}")
    // Compare the path prestataireId to the JWT subject (sub) not the token id (jti).
    @PreAuthorize("hasRole('ADMINISTRATEUR') or (hasRole('PRESTATAIRE') and ( #prestataireId == authentication.principal.subject or #prestataireId == authentication.principal.claims['preferred_username'] or #prestataireId == authentication.principal.claims['email'] or #prestataireId == authentication.name ))")
    public List<Contrat> getContratsByPrestataire(@PathVariable String prestataireId) {
        log.info("Recherche des contrats pour le prestataire ID/Email: {}", prestataireId);
        
        List<Contrat> contrats = new java.util.ArrayList<>();
        
        // PRIORITY STRATEGY: Check if prestataireId is actually an email and search by email
        if (prestataireId != null && prestataireId.contains("@")) {
            log.info("PRIMARY STRATEGY - Treating prestataireId as email: {}", prestataireId);
            
            // Direct search by email in contracts table
            contrats = contratRepository.findByPrestataireEmailIgnoreCase(prestataireId);
            log.info("Email direct search: {} contrats", contrats.size());
            
            // If empty: Find local Prestataire by email and use its structure
            if (contrats.isEmpty()) {
                List<com.dgsi.maintenance.entity.User> allPrestataires = userRepository.findAllPrestataires();
                for (com.dgsi.maintenance.entity.User u : allPrestataires) {
                    if (u instanceof com.dgsi.maintenance.entity.Prestataire) {
                        com.dgsi.maintenance.entity.Prestataire p = (com.dgsi.maintenance.entity.Prestataire) u;
                        if (prestataireId.equalsIgnoreCase(p.getEmail())) {
                            log.info("Found local Prestataire by email: id={}, structure={}", p.getId(), p.getStructure());
                            if (p.getStructure() != null && !p.getStructure().trim().isEmpty()) {
                                contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getStructure());
                                log.info("Search by structure (from email match): {} contrats", contrats.size());
                            }
                            break;
                        }
                    }
                }
            }
            
            // If still empty: Search by email prefix in nomPrestataire
            if (contrats.isEmpty()) {
                String emailPrefix = prestataireId.split("@")[0];
                contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(emailPrefix);
                log.info("Search by email prefix in nomPrestataire: {} contrats", contrats.size());
            }
        }
        
        // SECONDARY STRATEGY: Search by prestataireId (Keycloak ID)
        if (contrats.isEmpty()) {
            log.info("SECONDARY STRATEGY - Trying by prestataireId: {}", prestataireId);
            contrats = contratRepository.findByPrestataireIdAllStatuses(prestataireId);
            log.info("PrestataireId search: {} contrats", contrats.size());
            
            // If empty: Try to find local Prestataire by JWT sub and get structure
            if (contrats.isEmpty()) {
                List<com.dgsi.maintenance.entity.User> allPrestataires = userRepository.findAllPrestataires();
                for (com.dgsi.maintenance.entity.User u : allPrestataires) {
                    if (u instanceof com.dgsi.maintenance.entity.Prestataire) {
                        com.dgsi.maintenance.entity.Prestataire p = (com.dgsi.maintenance.entity.Prestataire) u;
                        if (prestataireId.equals(p.getId())) {
                            log.info("Found local Prestataire by ID: id={}, structure={}", p.getId(), p.getStructure());
                            if (p.getStructure() != null && !p.getStructure().trim().isEmpty()) {
                                contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getStructure());
                                log.info("Search by structure (from ID match): {} contrats", contrats.size());
                            }
                            break;
                        }
                    }
                }
            }
        }
        
        // TERTIARY STRATEGY: Try to find by email/username/contact as fallback
        if (contrats.isEmpty()) {
            log.info("TERTIARY STRATEGY - Trying by email/username/contact: {}", prestataireId);
            List<com.dgsi.maintenance.entity.User> allPrestataires = userRepository.findAllPrestataires();
            for (com.dgsi.maintenance.entity.User u : allPrestataires) {
                if (u instanceof com.dgsi.maintenance.entity.Prestataire) {
                    com.dgsi.maintenance.entity.Prestataire p = (com.dgsi.maintenance.entity.Prestataire) u;
                    if (prestataireId.equalsIgnoreCase(p.getEmail()) || 
                        prestataireId.equalsIgnoreCase(p.getNom()) || 
                        prestataireId.equalsIgnoreCase(p.getContact())) {
                        log.info("Found local Prestataire by email/username/contact: id={}, structure={}", p.getId(), p.getStructure());
                        if (p.getStructure() != null && !p.getStructure().trim().isEmpty()) {
                            contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getStructure());
                            log.info("Search by structure: {} contrats", contrats.size());
                        }
                        break;
                    }
                }
            }
        }
        
        // QUATERNARY STRATEGY: Direct search by nomPrestataire
        if (contrats.isEmpty()) {
            log.info("QUATERNARY STRATEGY - Trying direct nomPrestataire search: {}", prestataireId);
            contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(prestataireId);
            log.info("NomPrestataire search: {} contrats", contrats.size());
        }
        
        // ULTIMATE FALLBACK: Keyword search
        if (contrats.isEmpty()) {
            log.info("ULTIMATE FALLBACK - Keyword search");
            contrats = contratRepository.searchByKeyword(prestataireId);
            log.info("Keyword search: {} contrats", contrats.size());
        }
        
        log.info("Total contrats retournés pour prestataire {}: {}", prestataireId, contrats.size());
        return contrats;
    }

    /**
     * Get contracts for the currently authenticated prestataire.
     * This endpoint tries multiple strategies:
     *  - match contrats.prestataire_id against JWT subject (sub)
     *  - if none found, try to lookup local Prestataire by email or username and use its local id
     *  - Also accepts optional 'nom' parameter from local user database for direct search
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
    public List<Contrat> getMyContrats(
            org.springframework.security.core.Authentication authentication,
            @RequestParam(required = false) String nom) {
        try {
            String jwtSub = null;
            String jwtEmail = null;
            String jwtUsername = null;

            if (authentication instanceof org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken) {
                org.springframework.security.oauth2.jwt.Jwt jwt = ((org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken) authentication).getToken();
                jwtSub = jwt.getClaimAsString("sub");
                jwtEmail = jwt.getClaimAsString("email");
                jwtUsername = jwt.getClaimAsString("preferred_username");
            } else if (authentication != null) {
                // fallback to name
                jwtUsername = authentication.getName();
            }

            String authName = authentication != null ? authentication.getName() : null;
            log.info("Getting contracts for authenticated user: authName={}, sub={}, username={}, email={}, nomParam={}", authName, jwtSub, jwtUsername, jwtEmail, nom);

            List<Contrat> contrats = new java.util.ArrayList<>();

            // PRIORITY STRATEGY 0: If nom parameter is provided (local user name from database), search directly by nomPrestataire
            // This is the most reliable when we have the local user's name
            if (nom != null && !nom.trim().isEmpty()) {
                log.info("STRATEGY 0 - Searching by provided nom parameter: {}", nom);
                contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(nom);
                log.info("Nom parameter search: {} contrats", contrats.size());
                
                // If found, return immediately
                if (!contrats.isEmpty()) {
                    log.info("Returning {} contrats using nom parameter", contrats.size());
                    return contrats;
                }
            }

            // PRIORITY STRATEGY: Search by EMAIL first (most reliable method)
            // Email is unique and doesn't change between Keycloak and local DB
            if (jwtEmail != null && !jwtEmail.trim().isEmpty()) {
                log.info("PRIMARY STRATEGY - Searching by email: {}", jwtEmail);
                
                // First: Direct search by email in contracts table
                contrats = contratRepository.findByPrestataireEmailIgnoreCase(jwtEmail);
                log.info("Email direct search: {} contrats", contrats.size());
                
                // If empty: Find local Prestataire by email and use its structure/nomPrestataire
                if (contrats.isEmpty()) {
                    List<com.dgsi.maintenance.entity.User> allPrestataires = userRepository.findAllPrestataires();
                    for (com.dgsi.maintenance.entity.User u : allPrestataires) {
                        if (u instanceof com.dgsi.maintenance.entity.Prestataire) {
                            com.dgsi.maintenance.entity.Prestataire p = (com.dgsi.maintenance.entity.Prestataire) u;
                            if (jwtEmail.equalsIgnoreCase(p.getEmail())) {
                                log.info("Found local Prestataire by email: id={}, structure={}, nom={}", p.getId(), p.getStructure(), p.getNom());
                                
                                // Try by local nom (user's name in database) - THIS IS IMPORTANT
                                if (p.getNom() != null && !p.getNom().trim().isEmpty()) {
                                    contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getNom());
                                    log.info("Search by local nom (from email match): {} contrats", contrats.size());
                                }
                                
                                // Also try by structure name (nomPrestataire)
                                if (contrats.isEmpty() && p.getStructure() != null && !p.getStructure().trim().isEmpty()) {
                                    contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getStructure());
                                    log.info("Search by structure (from email match): {} contrats", contrats.size());
                                }
                                
                                // If still empty, try by local ID
                                if (contrats.isEmpty()) {
                                    String localId = p.getId();
                                    contrats = contratRepository.findByPrestataireIdAllStatuses(localId);
                                    log.info("Search by local ID (from email match): {} contrats", contrats.size());
                                }
                                break;
                            }
                        }
                    }
                }
                
                // If still empty: Search by email prefix in nomPrestataire
                if (contrats.isEmpty()) {
                    String emailPrefix = jwtEmail.split("@")[0];
                    contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(emailPrefix);
                    log.info("Search by email prefix in nomPrestataire: {} contrats", contrats.size());
                }
            }

            // SECONDARY STRATEGY: If email search failed, try by JWT sub (Keycloak ID)
            if (contrats.isEmpty() && jwtSub != null) {
                log.info("SECONDARY STRATEGY - Trying JWT sub: {}", jwtSub);
                contrats = contratRepository.findByPrestataireIdAllStatuses(jwtSub);
                log.info("JWT sub search: {} contrats", contrats.size());
                
                // If empty: Try to find local Prestataire by JWT sub and get structure/nom
                if (contrats.isEmpty()) {
                    List<com.dgsi.maintenance.entity.User> allPrestataires = userRepository.findAllPrestataires();
                    for (com.dgsi.maintenance.entity.User u : allPrestataires) {
                        if (u instanceof com.dgsi.maintenance.entity.Prestataire) {
                            com.dgsi.maintenance.entity.Prestataire p = (com.dgsi.maintenance.entity.Prestataire) u;
                            if (jwtSub.equals(p.getId())) {
                                log.info("Found local Prestataire by JWT sub: id={}, structure={}, nom={}", p.getId(), p.getStructure(), p.getNom());
                                // Try by local nom first
                                if (p.getNom() != null && !p.getNom().trim().isEmpty()) {
                                    contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getNom());
                                    log.info("Search by local nom (from sub match): {} contrats", contrats.size());
                                }
                                // Then try by structure
                                if (contrats.isEmpty() && p.getStructure() != null && !p.getStructure().trim().isEmpty()) {
                                    contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getStructure());
                                    log.info("Search by structure (from sub match): {} contrats", contrats.size());
                                }
                                break;
                            }
                        }
                    }
                }
            }

            // TERTIARY STRATEGY: Try by authName - also search by local nom
            if (contrats.isEmpty() && authName != null) {
                log.info("TERTIARY STRATEGY - Trying authName: {}", authName);
                contrats = contratRepository.findByPrestataireIdAllStatuses(authName);
                log.info("Auth name search: {} contrats", contrats.size());
                
                if (contrats.isEmpty()) {
                    List<com.dgsi.maintenance.entity.User> allPrestataires = userRepository.findAllPrestataires();
                    for (com.dgsi.maintenance.entity.User u : allPrestataires) {
                        if (u instanceof com.dgsi.maintenance.entity.Prestataire) {
                            com.dgsi.maintenance.entity.Prestataire p = (com.dgsi.maintenance.entity.Prestataire) u;
                            if (authName.equalsIgnoreCase(p.getEmail()) || 
                                authName.equalsIgnoreCase(p.getNom()) || 
                                authName.equalsIgnoreCase(p.getContact())) {
                                log.info("Found local Prestataire by authName match: id={}, structure={}, nom={}", p.getId(), p.getStructure(), p.getNom());
                                // Try by local nom
                                if (p.getNom() != null && !p.getNom().trim().isEmpty()) {
                                    contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getNom());
                                    log.info("Search by local nom (from authName match): {} contrats", contrats.size());
                                }
                                // Then try by structure
                                if (contrats.isEmpty() && p.getStructure() != null && !p.getStructure().trim().isEmpty()) {
                                    contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getStructure());
                                    log.info("Search by structure (from authName match): {} contrats", contrats.size());
                                }
                                break;
                            }
                        }
                    }
                }
            }

            // QUATERNARY STRATEGY: Try by username from JWT - also search by local nom
            if (contrats.isEmpty() && jwtUsername != null && !jwtUsername.trim().isEmpty()) {
                log.info("QUATERNARY STRATEGY - Trying username: {}", jwtUsername);
                List<com.dgsi.maintenance.entity.User> allPrestataires = userRepository.findAllPrestataires();
                for (com.dgsi.maintenance.entity.User u : allPrestataires) {
                    if (u instanceof com.dgsi.maintenance.entity.Prestataire) {
                        com.dgsi.maintenance.entity.Prestataire p = (com.dgsi.maintenance.entity.Prestataire) u;
                        if (jwtUsername.equalsIgnoreCase(p.getNom()) || 
                            jwtUsername.equalsIgnoreCase(p.getEmail()) || 
                            jwtUsername.equalsIgnoreCase(p.getContact())) {
                            log.info("Found local Prestataire by username: id={}, structure={}, nom={}", p.getId(), p.getStructure(), p.getNom());
                            // Try by local nom
                            if (p.getNom() != null && !p.getNom().trim().isEmpty()) {
                                contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getNom());
                                log.info("Search by local nom (from username match): {} contrats", contrats.size());
                            }
                            // Then try by structure
                            if (contrats.isEmpty() && p.getStructure() != null && !p.getStructure().trim().isEmpty()) {
                                contrats = contratRepository.findByNomPrestataireContainingIgnoreCaseAllStatuses(p.getStructure());
                                log.info("Search by structure (from username match): {} contrats", contrats.size());
                            }
                            break;
                        }
                    }
                }
            }

            // ULTIMATE FALLBACK: Keyword search using all available terms
            if (contrats.isEmpty()) {
                log.info("ULTIMATE FALLBACK - Keyword search");
                // Try all possible search terms
                String[] searchTerms = {
                    jwtEmail != null ? jwtEmail.split("@")[0] : null,
                    jwtUsername,
                    authName,
                    nom // Also include the nom parameter if provided
                };
                
                for (String searchTerm : searchTerms) {
                    if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                        List<Contrat> tempResults = contratRepository.searchByKeyword(searchTerm);
                        log.info("Keyword search with '{}': {} contrats", searchTerm, tempResults.size());
                        if (!tempResults.isEmpty()) {
                            contrats = tempResults;
                            break;
                        }
                    }
                }
            }

            log.info("Returning {} contrats for authenticated user", contrats.size());
            return contrats;
        } catch (Exception e) {
            log.error("Error while retrieving contracts for current user: ", e);
            return java.util.Collections.emptyList();
        }
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> updateContratStatut(@PathVariable Long id, @RequestBody String statutStr) {
        try {
            log.info("Tentative de mise à jour du statut du contrat {} vers {}", id, statutStr);
            StatutContrat statut = StatutContrat.valueOf(statutStr);
            return contratRepository.findById(id)
                .map(contrat -> {
                    contrat.setStatut(statut);
                    Contrat savedContrat = contratRepository.save(contrat);
                    log.info("Statut du contrat {} mis à jour avec succès", id);
                    return ResponseEntity.ok(savedContrat);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du statut du contrat {}: ", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Synchronise les contrats avec les prestataires en mettant à jour le prestataireId
     * pour les contrats qui n'en ont pas ou qui ont un prestataireId invalide.
     */
    @PostMapping("/sync-prestataire-ids")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<String> syncContratPrestataireIds() {
        log.info("Début de la synchronisation des contrats avec les prestataires");
        
        try {
            List<Contrat> allContrats = contratRepository.findAll();
            List<com.dgsi.maintenance.entity.Prestataire> allPrestataires = userRepository.findAllPrestataires()
                .stream()
                .filter(u -> u instanceof com.dgsi.maintenance.entity.Prestataire)
                .map(u -> (com.dgsi.maintenance.entity.Prestataire) u)
                .collect(java.util.stream.Collectors.toList());
            
            int updatedCount = 0;
            
            for (Contrat contrat : allContrats) {
                // Vérifier si le contrat a un prestataireId valide
                if (contrat.getPrestataireId() == null || contrat.getPrestataireId().trim().isEmpty() ||
                    !prestataireRepository.existsById(contrat.getPrestataireId())) {
                    
                    // Tentative de trouver le prestataire correspondant par nom de prestataire
                    java.util.Optional<com.dgsi.maintenance.entity.Prestataire> matchingPrestataire = allPrestataires.stream()
                        .filter(p -> contrat.getNomPrestataire().equalsIgnoreCase(p.getStructure()))
                        .findFirst();
                    
                    if (matchingPrestataire.isPresent()) {
                        contrat.setPrestataireId(matchingPrestataire.get().getId());
                        contratRepository.save(contrat);
                        updatedCount++;
                        log.info("Contrat {}: PrestataireId mis à jour avec {}", contrat.getIdContrat(), matchingPrestataire.get().getId());
                    } else {
                        log.warn("Contrat {}: Aucun prestataire correspondant trouvé pour le nom {}", contrat.getIdContrat(), contrat.getNomPrestataire());
                    }
                }
            }
            
            log.info("Synchronisation terminée: {} contrats mis à jour", updatedCount);
            return ResponseEntity.ok("Synchronisation terminée: " + updatedCount + " contrats mis à jour");
        } catch (Exception e) {
            log.error("Erreur lors de la synchronisation des contrats avec les prestataires: ", e);
            return ResponseEntity.internalServerError().body("Erreur lors de la synchronisation: " + e.getMessage());
        }
    }

    /**
     * Supprime les parenthèses autour des lots (ne supprime pas le contenu entre parenthèses,
     * mais retire les caractères '(' et ')' pour afficher le lot sans parenthèses).
     */
    private String sanitizeLotName(String raw) {
        return LotUtils.normalizeLotName(raw);
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public List<Contrat> searchContrats(@RequestParam String keyword) {
        return contratRepository.searchByKeyword(keyword);
    }

}

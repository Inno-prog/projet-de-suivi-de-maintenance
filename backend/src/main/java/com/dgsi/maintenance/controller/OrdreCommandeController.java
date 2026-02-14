package com.dgsi.maintenance.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import com.dgsi.maintenance.service.FichePrestationService;
import com.dgsi.maintenance.util.LotUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/ordres-commande")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class OrdreCommandeController {

    @Autowired
    private OrdreCommandeRepository ordreCommandeRepository;
    
    @Autowired
    private FichePrestationRepository fichePrestationRepository;
    
    @Autowired
    private PrestationRepository prestationRepository;
    
    @Autowired
    private FichePrestationService fichePrestationService;
    
    // Injection optionnelle du ContratRepository
    private com.dgsi.maintenance.repository.ContratRepository contratRepository;
    
    @Autowired(required = false)
    public void setContratRepository(com.dgsi.maintenance.repository.ContratRepository contratRepository) {
        this.contratRepository = contratRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllOrdresCommande() {
        try {
            log.info("📋 Récupération de tous les ordres de commande");

            List<com.dgsi.maintenance.entity.OrdreCommande> ordresCommande = ordreCommandeRepository.findAll();

            // Convert to simple map to avoid lazy loading issues
            List<Map<String, Object>> result = ordresCommande.stream().map(oc -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", oc.getId());
                map.put("idOC", oc.getIdOC());
                map.put("numeroOc", oc.getNumeroOc());
                map.put("prixUnitPrest", oc.getPrixUnitPrest());
                map.put("montantOC", oc.getMontantOC());
                map.put("statut", oc.getStatut());
                map.put("observations", oc.getObservations());
                map.put("numeroCommande", oc.getNumeroCommande());
                map.put("nomItem", oc.getNomItem());
                map.put("trimestre", oc.getTrimestre());
                map.put("annee", oc.getAnnee());
                map.put("lot", sanitizeLotName(oc.getLot()));
                map.put("prestataireItem", oc.getPrestataireItem());
                map.put("montant", oc.getMontant());
                map.put("dateCreation", oc.getDateCreation());
                map.put("contratId", oc.getContratId());
                map.put("penalites", oc.getPenalites());
                return map;
            }).collect(Collectors.toList());

            log.info("✅ Retour de {} ordres de commande", result.size());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des ordres de commande", e);
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/trimestre/{trimestre}/lots")
    public ResponseEntity<?> getLotsByTrimestre(@PathVariable Integer trimestre) {
        try {
            log.info("📊 Récupération des lots pour le trimestre: {}", trimestre);
            
            List<Map<String, Object>> lots = new ArrayList<>();
            
            try {
                // Récupérer les prestations du trimestre
                String trimestreStr = "T" + trimestre;
                List<com.dgsi.maintenance.entity.Prestation> prestations = prestationRepository.findAll().stream()
                    .filter(p -> trimestreStr.equals(p.getTrimestre()))
                    .collect(Collectors.toList());
                
                log.info("🔍 Prestations trouvées pour T{}: {}", trimestre, prestations.size());
                
                if (!prestations.isEmpty()) {
                    // Grouper par prestataire
                    Map<String, List<com.dgsi.maintenance.entity.Prestation>> prestationsParPrestataire = 
                        prestations.stream().collect(Collectors.groupingBy(
                            p -> p.getNomPrestataire() != null ? p.getNomPrestataire() : "Inconnu"
                        ));
                    
                    for (Map.Entry<String, List<com.dgsi.maintenance.entity.Prestation>> entry : prestationsParPrestataire.entrySet()) {
                        final String prestataire = entry.getKey();
                        List<com.dgsi.maintenance.entity.Prestation> prestationsPrestataire = entry.getValue();

                        // Trouver le lot du prestataire
                        String lotNom = "Lot " + prestataire;
                        if (contratRepository != null) {
                            try {
                                lotNom = contratRepository.findAll().stream()
                                    .filter(c -> prestataire.equals(c.getNomPrestataire()))
                                    .map(c -> c.getLot())
                                    .filter(lot -> lot != null && !lot.trim().isEmpty())
                                    .findFirst()
                                    .orElse("Lot " + prestataire);
                            } catch (Exception e) {
                                log.warn("⚠️ Erreur accès contrat pour {}: {}", prestataire, e.getMessage());
                            }
                        }
                        
                        // Compter les fiches - toutes les fiches validées pour ce prestataire et trimestre
                        List<FichePrestation> fiches = fichePrestationRepository.findAll().stream()
                            .filter(f -> f.getStatut() == com.dgsi.maintenance.entity.StatutFiche.VALIDE && 
                                         f.getNomPrestataire() != null && 
                                         f.getNomPrestataire().equals(prestataire) &&
                                         f.getIdPrestation() != null && 
                                         prestationsPrestataire.stream()
                                            .anyMatch(p -> p.getId().toString().equals(f.getIdPrestation())))
                            .collect(Collectors.toList());
                        
                        // Calculer montant
                        double montant = prestationsPrestataire.stream().mapToDouble(p -> {
                            if (p.getMontantIntervention() != null) return p.getMontantIntervention().doubleValue();
                            if (p.getMontantPrest() != null) return p.getMontantPrest().doubleValue();
                            return 0.0;
                        }).sum();
                        
                        Map<String, Object> lot = new HashMap<>();
                        lot.put("id", lotNom.replaceAll("\\s+", "-"));
                        lot.put("nom", lotNom);
                        lot.put("prestataire", prestataire);
                        lot.put("nombreFiches", fiches.size());
                        lot.put("itemsUtilises", 0);
                        lot.put("montantTotal", montant);
                        lot.put("statut", "ACTIF");
                        lots.add(lot);
                        
                        log.info("✅ Lot créé: {} - {} fiches, {} FCFA", lotNom, fiches.size(), montant);
                    }
                }
            } catch (Exception e) {
                log.warn("⚠️ Erreur récupération prestations: {}", e.getMessage());
            }
            
            log.info("✅ Retour de {} lots pour T{}", lots.size(), trimestre);
            return ResponseEntity.ok(lots);
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des lots pour T{}", trimestre, e);
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Normalise un nom de lot pour comparaison :
     * - Supprime les parenthèses
     * - Normalise les espaces
     * - Supprime le préfixe "lot" (insensible à la casse)
     * - Convertit en minuscules
     * - Retourne la valeur exacte après normalisation (pas de substring matching)
     */
    private String normalizeLotForComparison(String lotName) {
        if (lotName == null) return "";
        // Supprimer les parenthèses et leurs contenus pour éviter les "(Zone 1)" etc.
        String normalized = lotName.replaceAll("[()]", " ").trim();
        // Supprimer le préfixe "lot" (insensible à la casse) et les espaces multiples
        normalized = normalized.replaceAll("(?i)^lot\\s*", "").replaceAll("\\s+", " ").trim().toLowerCase();
        return normalized;
    }

    /**
     * Vérifie si deux noms de lots correspondent EXACTEMENT.
     * Ne fait PAS de matching par sous-chaîne pour éviter les faux positifs.
     * Exemple: "Lot 4" ne doit PAS matcher "Lot 14" ou "Lot 24"
     */
    private boolean lotsMatch(String lot1, String lot2) {
        if (lot1 == null || lot2 == null) return false;
        String norm1 = normalizeLotForComparison(lot1);
        String norm2 = normalizeLotForComparison(lot2);
        
        // Si les deux sont vides ou null après normalisation, ils ne correspondent pas
        if (norm1.isEmpty() && norm2.isEmpty()) return false;
        
        // Comparaison EXACTE après normalisation (pas de contains, pas de substring)
        return norm1.equals(norm2);
    }

    @GetMapping("/trimestre/{trimestre}/lot/{lotId}/fiches")
    public ResponseEntity<?> getFichesByLot(@PathVariable Integer trimestre, @PathVariable String lotId) {
        try {
            log.info("📄 Récupération des fiches pour lot {} - T{}", lotId, trimestre);

            if (trimestre == null || lotId == null || lotId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Paramètres invalides");
            }

            List<FichePrestation> fiches = new ArrayList<>();
            final String lotNom = lotId; // Use the lotId directly as passed from frontend
            List<String> prestatairesLot = new ArrayList<>();

            try {
                // Debug: Log all contracts and their lot names
                if (contratRepository != null) {
                    List<com.dgsi.maintenance.entity.Contrat> allContrats = contratRepository.findAll();
                    log.info("🔍 DEBUG - Tous les contrats ({}) :", allContrats.size());
                    allContrats.forEach(c -> {
                        String contractLot = c.getLot();
                        log.info("  - Contrat: {} - Prestataire: {} - Lot: {}",
                            c.getIdContrat(), c.getNomPrestataire(), contractLot);
                    });
                }

                // 1. Trouver tous les prestataires qui ont un contrat pour ce lot
                if (contratRepository != null) {
                    try {
                        prestatairesLot = contratRepository.findAll().stream()
                            .filter(c -> {
                                String contractLotName = c.getLot();
                                if (contractLotName == null && c.getLotEntity() != null) {
                                    contractLotName = c.getLotEntity().getNomLot();
                                }
                                // Use normalized exact matching to avoid false positives (Lot 1 vs Lot 14)
                                return contractLotName != null && lotsMatch(contractLotName, lotNom);
                            })
                            .map(c -> c.getNomPrestataire())
                            .distinct()
                            .collect(Collectors.toList());

                        log.info("🔍 Prestataires trouvés pour le lot {}: {}", lotNom, prestatairesLot);
                    } catch (Exception e) {
                        log.warn("⚠️ Erreur recherche prestataires pour lot {}: {}", lotNom, e.getMessage());
                    }
                }

                // 2. Récupérer les prestations du trimestre pour ces prestataires
                if (!prestatairesLot.isEmpty()) {
                    final List<String> finalPrestatairesLot = prestatairesLot;
                    String trimestreStr = "T" + trimestre;

                    // Debug: Log all prestations
                    List<com.dgsi.maintenance.entity.Prestation> allPrestations = prestationRepository.findAll();
                    log.info("🔍 DEBUG - Toutes les prestations ({}) :", allPrestations.size());
                    allPrestations.forEach(p -> log.info("  - Prestation: {} - Prestataire: {} - Trimestre: {}", p.getId(), p.getNomPrestataire(), p.getTrimestre()));

                    List<com.dgsi.maintenance.entity.Prestation> prestationsTrimestre = prestationRepository.findAll().stream()
                        .filter(p -> p.getTrimestre() != null && (
                            trimestreStr.equals(p.getTrimestre()) ||
                            trimestre.toString().equals(p.getTrimestre()) ||
                            ("T" + trimestre).equals(p.getTrimestre())
                        ) && finalPrestatairesLot.contains(p.getNomPrestataire()))
                        .collect(Collectors.toList());

                    log.info("🔍 Prestations pour trimestre {} et prestataires {}: {}", trimestreStr, finalPrestatairesLot, prestationsTrimestre.size());
                    prestationsTrimestre.forEach(p -> log.info("  - Prestation trouvée: {} - Prestataire: {} - Trimestre: {}", p.getId(), p.getNomPrestataire(), p.getTrimestre()));

                    // 3. Récupérer les fiches liées à ces prestations
                    if (!prestationsTrimestre.isEmpty()) {
                        final List<com.dgsi.maintenance.entity.Prestation> finalPrestationsTrimestre = prestationsTrimestre;

                        // Debug: Log all fiches
                        List<FichePrestation> allFiches = fichePrestationRepository.findAll();
                        log.info("🔍 DEBUG - Toutes les fiches ({}) :", allFiches.size());
                        allFiches.forEach(f -> log.info("  - Fiche: {} - IdPrestation: {} - Statut: {}", f.getId(), f.getIdPrestation(), f.getStatut()));

                        fiches = fichePrestationRepository.findAll().stream()
                            .filter(f -> f.getIdPrestation() != null && finalPrestationsTrimestre.stream()
                                .anyMatch(p -> p.getId() != null && p.getId().toString().equals(f.getIdPrestation())))
                            .collect(Collectors.toList());
                    }

                    log.info("🔍 Fiches trouvées pour le lot {} - T{}: {}", lotNom, trimestre, fiches.size());
                    fiches.forEach(f -> log.info("  - Fiche trouvée: {} - IdPrestation: {} - Statut: {}", f.getId(), f.getIdPrestation(), f.getStatut()));
                } else {
                    log.warn("⚠️ Aucun prestataire trouvé pour le lot {}", lotNom);
                }
            } catch (Exception e) {
                log.warn("⚠️ Erreur récupération fiches: {}", e.getMessage());
            }

            // Formater les numéros de fiche pour l'affichage
            int lotNumber = 1;
            try {
                lotNumber = extractLotNumber(lotNom);
            } catch (Exception e) {
                log.warn("⚠️ Impossible d'extraire le numéro de lot de '{}', utilisant 1 par défaut", lotNom);
            }
            
            List<FichePrestation> formattedFiches = new ArrayList<>();
            for (FichePrestation fiche : fiches) {
                if (fiche.getNumeroFiche() == null) {
                    // Utiliser la logique existante du service pour générer le numéro de fiche
                    String formattedNumber = fichePrestationService.getNextAvailableNumero(trimestre, lotNumber);
                    fiche.setNumeroFiche(formattedNumber);
                    // Enregistrer le numéro généré dans la base de données
                    try {
                        fichePrestationRepository.save(fiche);
                        log.debug("🔧 Numéro de fiche généré et enregistré: {}", formattedNumber);
                    } catch (Exception e) {
                        log.warn("⚠️ Impossible d'enregistrer le numéro de fiche pour l'ID {}", fiche.getId());
                    }
                }
                formattedFiches.add(fiche);
            }

            // Préparer la réponse
            Map<String, Object> response = new HashMap<>();

            Map<String, Object> lotInfo = new HashMap<>();
            lotInfo.put("id", lotId);
            lotInfo.put("nom", lotNom);
            lotInfo.put("prestataires", prestatairesLot);
            lotInfo.put("nombrePrestataires", prestatairesLot.size());

            response.put("lotInfo", lotInfo);
            response.put("fiches", formattedFiches);

            log.info("✅ Retour de {} fiches pour lot {} - T{} ({} prestataires)",
                    formattedFiches.size(), lotId, trimestre, prestatairesLot.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des fiches pour lot {} - T{}", lotId, trimestre, e);
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }
    
    private int trimestreToNumero(String trimestre) {
        switch (trimestre) {
            case "T1": return 1;
            case "T2": return 2;
            case "T3": return 3;
            default: return 4;
        }
    }
    
    /**
     * Extrait le numéro de lot à partir d'un nom de lot normalisé ou brut.
     * @param rawLotName Nom de lot tel que "Lot 1", "LOT01", "lot 2 (test)"
     * @return Numéro de lot sous forme d'entier
     */
    private int extractLotNumber(String rawLotName) {
        if (rawLotName == null) {
            return 1;
        }
        
        // Supprimer les caractères non numériques sauf les chiffres
        String normalized = rawLotName.replaceAll("[^0-9]", "");
        if (normalized.isEmpty()) {
            return 1;
        }
        
        try {
            return Integer.parseInt(normalized);
        } catch (NumberFormatException e) {
            return 1;
        }
    }

    /**
     * Supprime les parenthèses d'un nom de lot (ne supprime pas le contenu entre parenthèses,
     * mais retire les caractères '(' et ')' pour un affichage sans parenthèses).
     */
    private String sanitizeLotName(String raw) {
        return LotUtils.normalizeLotName(raw);
    }
}

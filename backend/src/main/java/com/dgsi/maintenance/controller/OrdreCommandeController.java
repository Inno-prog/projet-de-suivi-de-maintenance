package com.dgsi.maintenance.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
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
                map.put("lot", oc.getLot());
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
                        
                        // Compter les fiches
                        List<FichePrestation> fiches = fichePrestationRepository.findAll().stream()
                            .filter(f -> f.getIdPrestation() != null && prestationsPrestataire.stream()
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

    @GetMapping("/trimestre/{trimestre}/lot/{lotId}/fiches")
    public ResponseEntity<?> getFichesByLot(@PathVariable Integer trimestre, @PathVariable String lotId) {
        try {
            log.info("📄 Récupération des fiches pour lot {} - T{}", lotId, trimestre);

            if (trimestre == null || lotId == null || lotId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Paramètres invalides");
            }

            List<FichePrestation> fiches = new ArrayList<>();
            String tempLotNom = lotId.replaceAll("-", " ");
            // Si c'est juste un numéro, ajouter "Lot " devant
            if (tempLotNom.matches("^\\d+$")) {
                tempLotNom = "Lot " + tempLotNom;
            }
            final String lotNom = tempLotNom;
            List<String> prestatairesLot = new ArrayList<>();

            try {
                // 1. Trouver tous les prestataires qui ont un contrat pour ce lot
                if (contratRepository != null) {
                    try {
                        prestatairesLot = contratRepository.findAll().stream()
                            .filter(c -> lotNom.equals(c.getLot()))
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
                    List<com.dgsi.maintenance.entity.Prestation> prestationsTrimestre = prestationRepository.findAll().stream()
                        .filter(p -> trimestreStr.equals(p.getTrimestre()) &&
                                   finalPrestatairesLot.contains(p.getNomPrestataire()))
                        .collect(Collectors.toList());

                    log.info("🔍 Prestations T{} pour prestataires {}: {}", trimestre, finalPrestatairesLot, prestationsTrimestre.size());

                    // 3. Récupérer les fiches liées à ces prestations du trimestre
                    if (!prestationsTrimestre.isEmpty()) {
                        final List<com.dgsi.maintenance.entity.Prestation> finalPrestationsTrimestre = prestationsTrimestre;
                        fiches = fichePrestationRepository.findAll().stream()
                            .filter(f -> f.getIdPrestation() != null && finalPrestationsTrimestre.stream()
                                .anyMatch(p -> p.getId().toString().equals(f.getIdPrestation())))
                            .collect(Collectors.toList());
                    }

                    log.info("🔍 Fiches trouvées pour le lot {} - T{}: {}", lotNom, trimestre, fiches.size());
                } else {
                    log.warn("⚠️ Aucun prestataire trouvé pour le lot {}", lotNom);
                }
            } catch (Exception e) {
                log.warn("⚠️ Erreur récupération fiches: {}", e.getMessage());
            }

            // Préparer la réponse
            Map<String, Object> response = new HashMap<>();

            Map<String, Object> lotInfo = new HashMap<>();
            lotInfo.put("id", lotId);
            lotInfo.put("nom", lotNom);
            lotInfo.put("prestataires", prestatairesLot);
            lotInfo.put("nombrePrestataires", prestatairesLot.size());

            response.put("lotInfo", lotInfo);
            response.put("fiches", fiches);

            log.info("✅ Retour de {} fiches pour lot {} - T{} ({} prestataires)",
                    fiches.size(), lotId, trimestre, prestatairesLot.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des fiches pour lot {} - T{}", lotId, trimestre, e);
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }
}

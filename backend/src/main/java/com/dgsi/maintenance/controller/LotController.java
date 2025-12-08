package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.stream.Collectors;
import com.dgsi.maintenance.dto.LotWithContractorDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lots")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LotController {

    @Autowired
    private com.dgsi.maintenance.repository.ContratRepository contratRepository;

    @Autowired
    private com.dgsi.maintenance.repository.FichePrestationRepository ficheRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<List<LotWithContractorDto>> getAllLots() {
        try {
            // Get all active contracts
            List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findAllWithItems()
                .stream()
                .filter(contrat -> contrat.getStatut() == com.dgsi.maintenance.entity.StatutContrat.ACTIF)
                .collect(Collectors.toList());

            System.out.println("🔍 Found " + contrats.size() + " active contracts");

            // Group by lot and aggregate villes and contract IDs
            java.util.Map<String, LotWithContractorDto> lotMap = new java.util.HashMap<>();
            java.util.Map<String, java.util.Set<String>> lotToPrestataireNames = new java.util.HashMap<>();

            for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
                if (contrat.getLot() != null && !contrat.getLot().trim().isEmpty()) {
                    String lotName = contrat.getLot();
                    
                    // Get or create DTO for this lot
                    LotWithContractorDto dto = lotMap.computeIfAbsent(lotName, k -> new LotWithContractorDto(lotName));
                    
                    // Add ville if not null
                    if (contrat.getVille() != null && !contrat.getVille().trim().isEmpty()) {
                        dto.addVille(contrat.getVille());
                    }
                    
                    // Add contract ID
                    if (contrat.getIdContrat() != null && !contrat.getIdContrat().trim().isEmpty()) {
                        dto.addContractId(contrat.getIdContrat());
                    }
                    
                    // Track prestataire names for this lot
                    String prestataireName = contrat.getNomPrestataire();
                    if (prestataireName != null && !prestataireName.trim().isEmpty()) {
                        lotToPrestataireNames.computeIfAbsent(lotName, k -> new java.util.HashSet<>())
                            .add(prestataireName.trim());
                    }
                    
                    System.out.println("📄 Contract: " + contrat.getIdContrat() + " - Lot: " + lotName + " - Prestataire: " + prestataireName);
                }
            }

            // Note: Fiches count is set to 0 here because fiches don't have direct lot reference
            // The actual count will be computed when viewing a specific lot+trimestre combination
            for (LotWithContractorDto dto : lotMap.values()) {
                dto.setFichesCount(0);
            }

            // Convert to list and sort
            List<LotWithContractorDto> result = lotMap.values().stream()
                .sorted((a, b) -> {
                    try {
                        String aNum = a.getLot().replaceAll("[^0-9]", "");
                        String bNum = b.getLot().replaceAll("[^0-9]", "");
                        if (!aNum.isEmpty() && !bNum.isEmpty()) {
                            return Integer.compare(Integer.parseInt(aNum), Integer.parseInt(bNum));
                        }
                    } catch (Exception e) {
                        // Fall back to string comparison
                    }
                    return a.getLot().compareTo(b.getLot());
                })
                .collect(Collectors.toList());

            System.out.println("📦 Returning " + result.size() + " lots:");
            for (LotWithContractorDto lot : result) {
                System.out.println("  - Lot: " + lot.getLot() + " - Villes: " + lot.getVilles() + " - Contrats: " + lot.getContractIds() + " - Fiches: " + lot.getFichesCount());
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<List<LotWithContractorDto>> getActiveLots() {
        // Same as getAllLots for now, but could be filtered differently in the future
        return getAllLots();
    }
}

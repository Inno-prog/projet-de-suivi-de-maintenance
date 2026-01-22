package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.dgsi.maintenance.dto.LotWithContractorDto;
import com.dgsi.maintenance.entity.Lot;
import com.dgsi.maintenance.entity.StatutContrat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lots")
public class LotController {

    @Autowired
    private com.dgsi.maintenance.repository.LotRepository lotRepository;

    @Autowired
    private com.dgsi.maintenance.repository.ContratRepository contratRepository;

    @Autowired
    private com.dgsi.maintenance.repository.ItemRepository itemRepository;

    @Autowired
    private com.dgsi.maintenance.repository.StructureMefpRepository structureMefpRepository;



    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<List<LotWithContractorDto>> getAllLots() {
        try {
            // Get all lots from database
            List<Lot> lots = lotRepository.findAll();
            System.out.println("🔍 Found " + lots.size() + " lots in database");

            // Get all active contracts to populate LotWithContractorDto
            List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findAllWithItems()
                .stream()
                .filter(contrat -> contrat.getStatut() == StatutContrat.ACTIF)
                .collect(Collectors.toList());

            System.out.println("🔍 Found " + contrats.size() + " active contracts");

            // Group contracts by lot name - only for lots that exist in database
            java.util.Map<String, LotWithContractorDto> lotMap = new java.util.HashMap<>();

            // Initialize with all lots from database
            for (Lot lot : lots) {
                LotWithContractorDto dto = new LotWithContractorDto(lot.getNomLot());
                // Populate villes from the lot entity if available
                if (lot.getVilles() != null && !lot.getVilles().isEmpty()) {
                    for (String ville : lot.getVilles()) {
                        dto.addVille(ville);
                    }
                }
                lotMap.put(lot.getNomLot(), dto);
            }

            // Populate with contract data - only for existing lots
            for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
                if (contrat.getLot() != null && !contrat.getLot().trim().isEmpty()) {
                    String lotName = contrat.getLot();

                    // Only add contract data if the lot exists in our map (i.e., in database)
                    LotWithContractorDto dto = lotMap.get(lotName);
                    if (dto != null) {
                        // Add ville if not null and not already in the lot's villes
                        if (contrat.getVille() != null && !contrat.getVille().trim().isEmpty()) {
                            dto.addVille(contrat.getVille());
                        }

                        // Add contract ID
                        if (contrat.getIdContrat() != null && !contrat.getIdContrat().trim().isEmpty()) {
                            dto.addContractId(contrat.getIdContrat());
                        }

                        System.out.println("📄 Contract: " + contrat.getIdContrat() + " - Lot: " + lotName + " - Prestataire: " + contrat.getNomPrestataire());
                    } else {
                        System.out.println("⚠️  Contract " + contrat.getIdContrat() + " references non-existent lot: " + lotName);
                    }
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

    @GetMapping("/by-prestataire/{prestataireId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or (hasRole('PRESTATAIRE') and #prestataireId == authentication.principal.id)")
    public ResponseEntity<List<LotWithContractorDto>> getLotsByPrestataire(@PathVariable String prestataireId) {
        try {
            // Get contracts for this prestataire using foreign key
            List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findByPrestataireId(prestataireId)
                .stream()
                .filter(contrat -> contrat.getStatut() == com.dgsi.maintenance.entity.StatutContrat.ACTIF)
                .collect(Collectors.toList());

            // If no contracts found with foreign key, try alternative methods
            if (contrats.isEmpty()) {
                System.out.println("⚠️ No contracts found with prestataire_id=" + prestataireId + ", trying alternative searches...");
                
                // Try finding by contact email (for prestataires registered in the system)
                List<com.dgsi.maintenance.entity.Contrat> contratsByContact = contratRepository.findActiveContratsByContactPrestataire(prestataireId);
                if (!contratsByContact.isEmpty()) {
                    contrats.addAll(contratsByContact);
                    System.out.println("✅ Found " + contratsByContact.size() + " contracts by contact email");
                }
            }

            System.out.println("🔍 Found " + contrats.size() + " active contracts for prestataire " + prestataireId);

            // Group contracts by lot name
            java.util.Map<String, LotWithContractorDto> lotMap = new java.util.HashMap<>();

            // Populate with contract data
            for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
                if (contrat.getLot() != null && !contrat.getLot().trim().isEmpty()) {
                    String lotName = contrat.getLot();

                    // Get or create DTO for this lot
                    LotWithContractorDto dto = lotMap.get(lotName);
                    if (dto == null) {
                        dto = new LotWithContractorDto(lotName);
                        lotMap.put(lotName, dto);
                    }

                    // Add ville if not null
                    if (contrat.getVille() != null && !contrat.getVille().trim().isEmpty()) {
                        dto.addVille(contrat.getVille());
                    }

                    // Add contract ID
                    if (contrat.getIdContrat() != null && !contrat.getIdContrat().trim().isEmpty()) {
                        dto.addContractId(contrat.getIdContrat());
                    }

                    System.out.println("📄 Contract: " + contrat.getIdContrat() + " - Lot: " + lotName + " - Prestataire: " + contrat.getNomPrestataire());
                }
            }

            // Set fiches count to 0 (same as in getAllLots)
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

            System.out.println("📦 Returning " + result.size() + " lots for prestataire " + prestataireId + ":");
            for (LotWithContractorDto lot : result) {
                System.out.println("  - Lot: " + lot.getLot() + " - Villes: " + lot.getVilles() + " - Contrats: " + lot.getContractIds());
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/entities")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<List<Lot>> getAllLotEntities() {
        try {
            List<Lot> lots = lotRepository.findAll();

            // Sanitize lot names for display: remove parentheses characters
            for (Lot lot : lots) {
                if (lot.getNomLot() != null) {
                    lot.setNomLot(com.dgsi.maintenance.util.LotUtils.normalizeLotName(lot.getNomLot()));
                }
            }

            // Get all contracts to populate villes for each lot
            List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findAllWithItems();

            // Group villes by lot name
            java.util.Map<String, java.util.Set<String>> lotVillesMap = new java.util.HashMap<>();

            for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
                if (contrat.getLot() != null && !contrat.getLot().trim().isEmpty() &&
                    contrat.getVille() != null && !contrat.getVille().trim().isEmpty()) {
                    lotVillesMap.computeIfAbsent(contrat.getLot(), k -> new java.util.HashSet<>())
                               .add(contrat.getVille());
                }
            }

            // Populate villes for each lot
            for (Lot lot : lots) {
                java.util.Set<String> villes = lotVillesMap.get(lot.getNomLot());
                if (villes != null && !villes.isEmpty()) {
                    lot.setVilles(new java.util.ArrayList<>(villes));
                } else if (lot.getVilles() == null || lot.getVilles().isEmpty()) {
                    // If no villes from contracts and lot has no villes, set empty list
                    lot.setVilles(new java.util.ArrayList<>());
                }
            }

            return ResponseEntity.ok(lots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Lot> getLotById(@PathVariable Long id) {
        return lotRepository.findById(id)
            .map(lot -> ResponseEntity.ok().body(lot))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Lot> createLot(@Valid @RequestBody Lot lot) {
        try {
            // Check if lot name already exists
            if (lotRepository.findByNomLot(lot.getNomLot()).isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            Lot savedLot = lotRepository.save(lot);
            return ResponseEntity.ok(savedLot);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Lot> updateLot(@PathVariable Long id, @Valid @RequestBody Lot lotDetails) {
        Optional<Lot> lotOpt = lotRepository.findById(id);
        if (lotOpt.isPresent()) {
            Lot lot = lotOpt.get();
            // Check if the new name conflicts with existing lots (excluding current one)
            if (!lot.getNomLot().equals(lotDetails.getNomLot()) &&
                lotRepository.findByNomLot(lotDetails.getNomLot()).isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            lot.setNomLot(lotDetails.getNomLot());
            lot.setVilles(lotDetails.getVilles());
            Lot updatedLot = lotRepository.save(lot);
            return ResponseEntity.ok(updatedLot);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteLot(@PathVariable Long id) {
        return lotRepository.findById(id)
            .map(lot -> {
                try {
                    // Update contracts that reference this lot name to null
                    java.util.List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findByLot(lot.getNomLot());
                    if (contrats != null && !contrats.isEmpty()) {
                        for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
                            contrat.setLot(null);
                            contratRepository.save(contrat);
                        }
                    }

                    // Update items that reference this lot name to null
                    java.util.List<com.dgsi.maintenance.entity.Item> items = itemRepository.findByLot(lot.getNomLot());
                    if (items != null && !items.isEmpty()) {
                        for (com.dgsi.maintenance.entity.Item item : items) {
                            item.setLot(null);
                            itemRepository.save(item);
                        }
                    }

                    // Update structures_mefp that reference this lot ID to null
                    java.util.List<com.dgsi.maintenance.entity.StructureMefp> structures = structureMefpRepository.findByLotId(lot.getId());
                    if (structures != null && !structures.isEmpty()) {
                        for (com.dgsi.maintenance.entity.StructureMefp structure : structures) {
                            structure.setLot(null);
                            structureMefpRepository.save(structure);
                        }
                    }

                    // Safe to delete the lot now
                    lotRepository.delete(lot);
                    return ResponseEntity.ok().build();
                } catch (Exception e) {
                    e.printStackTrace();
                    return ResponseEntity.internalServerError().build();
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

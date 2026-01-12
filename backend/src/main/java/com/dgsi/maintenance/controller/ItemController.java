package com.dgsi.maintenance.controller;

import java.util.List;

import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.ItemRepository;

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

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private com.dgsi.maintenance.repository.ContratRepository contratRepository;

    @Autowired
    private com.dgsi.maintenance.repository.UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemRepository.findById(id)
            .map(item -> ResponseEntity.ok().body(item))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Item> searchItemsByName(@RequestParam String nom) {
        return itemRepository.findByNomItemContainingIgnoreCase(nom);
    }

    @GetMapping("/by-lot")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Item> getItemsByLot(@RequestParam String lot) {
        return itemRepository.findByLot(lot);
    }

    @GetMapping("/search-by-lot")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Item> searchItemsByLotAndName(@RequestParam String lot, @RequestParam String nom) {
        return itemRepository.findByLotAndNomItemContainingIgnoreCase(lot, nom);
    }

    @GetMapping("/by-contract-lot")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Item> getItemsByContractLot(@RequestParam String contractId) {
        System.out.println("🔍 Searching for contract with ID: " + contractId);
        return contratRepository.findByIdWithItems(Long.parseLong(contractId))
            .map(contrat -> {
                System.out.println("📄 Found contract: " + contrat.getId() + " with " + (contrat.getItems() != null ? contrat.getItems().size() : 0) + " items");
                if (contrat.getItems() != null && !contrat.getItems().isEmpty()) {
                    contrat.getItems().forEach(item -> System.out.println("📦 Item: " + item.getIdItem() + " - " + item.getNomItem()));
                    return java.util.List.copyOf(contrat.getItems());
                } else {
                    System.out.println("❌ Contract has no items");
                    return java.util.Collections.<Item>emptyList();
                }
            })
            .orElseGet(() -> {
                System.out.println("❌ Contract not found with ID: " + contractId);
                return java.util.Collections.emptyList();
            });
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public Item createItem(@RequestBody Item item) {
        // Auto-generate idItem if not provided
        if (item.getIdItem() == null) {
            // Find the maximum idItem and increment by 1
            // Use filter to handle null values safely
            Integer maxIdItem = itemRepository.findAll().stream()
                .map(Item::getIdItem)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0);
            item.setIdItem(maxIdItem + 1);
        }
        return itemRepository.save(item);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item item) {
        return itemRepository.findById(id)
            .map(existingItem -> {
                item.setId(id);
                return ResponseEntity.ok(itemRepository.save(item));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('AGENT_DGSI')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        return itemRepository.findById(id)
            .map(item -> {
                itemRepository.delete(item);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private com.dgsi.maintenance.repository.PrestationRepository prestationRepository;

    @GetMapping("/statistiques")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<java.util.Map<String, Object>> getItemsStatistiques() {
        List<Item> items = itemRepository.findAll();
        System.out.println("🔍 Total items: " + items.size());
        
        return items.stream().map(item -> {
            // Calculer le nombre réel d'utilisations depuis les prestations (par nom pour compatibilité)
            long utilisationsReelles = prestationRepository.countByNomPrestation(item.getNomItem());
            System.out.println("📊 Item " + item.getNomItem() + " (ID: " + item.getId() + ") - Utilisations: " + utilisationsReelles);
            
            java.util.Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("id", item.getId());
            stats.put("idItem", item.getIdItem());
            stats.put("nomItem", item.getNomItem());
            stats.put("lot", item.getLot());
            stats.put("quantiteUtilisee", utilisationsReelles);
            stats.put("quantiteMaxTrimestre", item.getQuantiteMaxTrimestre() != null ? item.getQuantiteMaxTrimestre() : 0);
            stats.put("quantiteUtiliseeTrimestre", item.getQuantiteUtiliseeTrimestre() != null ? item.getQuantiteUtiliseeTrimestre() : 0);
            stats.put("prix", item.getPrix());
            return stats;
        }).collect(java.util.stream.Collectors.toList());
    }

    @PostMapping("/synchroniser-compteurs")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> synchroniserCompteursUtilisation() {
        try {
            List<Item> items = itemRepository.findAll();
            int updated = 0;
            
            for (Item item : items) {
                long utilisationsReelles = prestationRepository.countByNomPrestation(item.getNomItem());
                item.setQuantiteUtilisee((int) utilisationsReelles);
                itemRepository.save(item);
                updated++;
                System.out.println("✅ Item " + item.getNomItem() + " synchronisé: " + utilisationsReelles + " utilisations");
            }
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("message", "Compteurs synchronisés avec succès");
            response.put("itemsMisAJour", updated);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/by-prestataire/{prestataireId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or (hasRole('PRESTATAIRE') and #prestataireId == authentication.principal.id)")
    public ResponseEntity<List<Item>> getItemsByPrestataire(@PathVariable String prestataireId) {
        try {
            System.out.println("🔍 Getting items for prestataire: " + prestataireId);

            // Get contracts for this prestataire
            List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findByPrestataireId(prestataireId);
            System.out.println("📄 Found " + contrats.size() + " contracts");

            // Collect unique lot names
            java.util.Set<String> lotNames = new java.util.HashSet<>();
            for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
                String lotName = contrat.getLot();
                if (lotName != null && !lotName.trim().isEmpty()) {
                    String cleanLot = lotName.trim();
                    int parenIndex = cleanLot.indexOf("(");
                    if (parenIndex > 0) {
                        cleanLot = cleanLot.substring(0, parenIndex).trim();
                    }
                    lotNames.add(cleanLot);
                    System.out.println("🏷️ Contract " + contrat.getId() + " -> lot: " + cleanLot);
                }
            }

            System.out.println("🏷️ Total lots: " + lotNames.size());

            // Get items for these lots
            java.util.Set<Item> allItems = new java.util.HashSet<>();
            for (String lotName : lotNames) {
                List<Item> items = itemRepository.findByLot(lotName);
                if (items == null || items.isEmpty()) {
                    items = itemRepository.findByLotContainingIgnoreCase(lotName);
                }
                if (items != null) {
                    allItems.addAll(items);
                    System.out.println("📦 Lot '" + lotName + "': " + items.size() + " items");
                }
            }

            List<Item> result = new java.util.ArrayList<>(allItems);
            System.out.println("✅ Total items: " + result.size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/debug-prestations")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> debugPrestations() {
        try {
            List<com.dgsi.maintenance.entity.Prestation> prestations = prestationRepository.findAll();
            System.out.println("🔍 Total prestations: " + prestations.size());

            java.util.Map<String, Object> debug = new java.util.HashMap<>();
            debug.put("totalPrestations", prestations.size());

            java.util.List<java.util.Map<String, Object>> prestationDetails = new java.util.ArrayList<>();
            for (com.dgsi.maintenance.entity.Prestation prestation : prestations) {
                java.util.Map<String, Object> detail = new java.util.HashMap<>();
                detail.put("id", prestation.getId());
                detail.put("nomPrestataire", prestation.getNomPrestataire());
                detail.put("itemsCount", prestation.getItemsUtilises() != null ? prestation.getItemsUtilises().size() : 0);

                if (prestation.getItemsUtilises() != null) {
                    java.util.List<String> itemNames = new java.util.ArrayList<>();
                    for (Item item : prestation.getItemsUtilises()) {
                        itemNames.add(item.getNomItem() + " (ID: " + item.getId() + ")");
                    }
                    detail.put("items", itemNames);
                }

                prestationDetails.add(detail);
                System.out.println("📊 Prestation " + prestation.getId() + " - Items: " + (prestation.getItemsUtilises() != null ? prestation.getItemsUtilises().size() : 0));
            }

            debug.put("prestations", prestationDetails);
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/debug/all-prestataires")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> debugPrestataires() {
        try {
            System.out.println("🔍 Debugging all prestataires...");
            
            // Get all prestataires using the repository
            List<com.dgsi.maintenance.entity.User> prestataires = userRepository.findByRole("PRESTATAIRE");
            
            System.out.println("📄 Found " + prestataires.size() + " prestataires");
            
            java.util.Map<String, Object> debug = new java.util.HashMap<>();
            debug.put("totalPrestataires", prestataires.size());
            
            java.util.List<java.util.Map<String, Object>> prestataireDetails = new java.util.ArrayList<>();
            for (com.dgsi.maintenance.entity.User user : prestataires) {
                com.dgsi.maintenance.entity.Prestataire prestataire = (com.dgsi.maintenance.entity.Prestataire) user;
                java.util.Map<String, Object> detail = new java.util.HashMap<>();
                detail.put("id", prestataire.getId());
                detail.put("nom", prestataire.getNom());
                detail.put("email", prestataire.getEmail());
                detail.put("structure", prestataire.getStructure());

                prestataireDetails.add(detail);
            }
            
            debug.put("prestataires", prestataireDetails);
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/debug-prestataire-contracts/{prestataireId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> debugPrestataireContracts(@PathVariable String prestataireId) {
        try {
            System.out.println("🔍 Debugging contracts for prestataire ID: " + prestataireId);
            
            // Test different ways to find contracts
            List<com.dgsi.maintenance.entity.Contrat> contrats1 = contratRepository.findByPrestataireId(prestataireId);
            List<com.dgsi.maintenance.entity.Contrat> contrats2 = contratRepository.findByPrestataireIdWithItems(prestataireId);
            
            System.out.println("📄 Method 1 (findByPrestataireId): " + contrats1.size() + " contracts");
            System.out.println("📄 Method 2 (findByPrestataireIdWithItems): " + contrats2.size() + " contracts");
            
            java.util.Map<String, Object> debug = new java.util.HashMap<>();
            debug.put("prestataireId", prestataireId);
            debug.put("contractsMethod1", contrats1.size());
            debug.put("contractsMethod2", contrats2.size());
            
            java.util.List<java.util.Map<String, Object>> contractDetails = new java.util.ArrayList<>();
            for (com.dgsi.maintenance.entity.Contrat contrat : contrats2) {
                java.util.Map<String, Object> detail = new java.util.HashMap<>();
                detail.put("id", contrat.getId());
                detail.put("nomPrestataire", contrat.getNomPrestataire());
                detail.put("statut", contrat.getStatut());
                detail.put("ordresCommandeCount", contrat.getOrdresCommande() != null ? contrat.getOrdresCommande().size() : 0);
                detail.put("itemsCount", contrat.getItems() != null ? contrat.getItems().size() : 0);
                
                contractDetails.add(detail);
            }
            
            debug.put("contracts", contractDetails);
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }
    
    @GetMapping("/debug-prestataire-items/{prestataireId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> debugPrestataireItems(@PathVariable String prestataireId) {
            try {
                System.out.println("🔍 Debugging items for prestataire: " + prestataireId);
                
                // Get contracts
                List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findByPrestataireIdWithItems(prestataireId);
                System.out.println("📄 Found " + contrats.size() + " contracts");
                
                java.util.Map<String, Object> debug = new java.util.HashMap<>();
                debug.put("prestataireId", prestataireId);
                debug.put("contractsCount", contrats.size());
                
                java.util.List<java.util.Map<String, Object>> contractDetails = new java.util.ArrayList<>();
                for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
                    java.util.Map<String, Object> detail = new java.util.HashMap<>();
                    detail.put("id", contrat.getId());
                    detail.put("idContrat", contrat.getIdContrat());
                    detail.put("nomPrestataire", contrat.getNomPrestataire());
                    detail.put("lot", contrat.getLot());
                    detail.put("ordresCommandeCount", contrat.getOrdresCommande() != null ? contrat.getOrdresCommande().size() : 0);
                    
                    // Get items from contract
                    List<Item> items = contrat.getItems();
                    detail.put("itemsCount", items != null ? items.size() : 0);
                    
                    if (items != null && !items.isEmpty()) {
                        java.util.List<java.util.Map<String, Object>> itemDetails = new java.util.ArrayList<>();
                        for (Item item : items) {
                            java.util.Map<String, Object> itemDetail = new java.util.HashMap<>();
                            itemDetail.put("id", item.getId());
                            itemDetail.put("idItem", item.getIdItem());
                            itemDetail.put("nomItem", item.getNomItem());
                            itemDetail.put("lot", item.getLot());
                            itemDetails.add(itemDetail);
                        }
                        detail.put("items", itemDetails);
                    }
                    
                    contractDetails.add(detail);
                }
                
                debug.put("contracts", contractDetails);
                
                // Get items via the API method
                ResponseEntity<List<Item>> itemsResponse = getItemsByPrestataire(prestataireId);
                List<Item> itemsViaApi = itemsResponse.getBody() != null ? itemsResponse.getBody() : new java.util.ArrayList<>();
                debug.put("itemsViaApiCount", itemsViaApi.size());
                
                return ResponseEntity.ok(debug);
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
            }
        }

    @GetMapping("/debug/all-contracts")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> debugAllContracts() {
        try {
            System.out.println("🔍 Debugging all contracts...");
            
            // Get all contracts with their prestataire relationships
            List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findAll();
            
            System.out.println("📄 Found " + contrats.size() + " contracts");
            
            java.util.Map<String, Object> debug = new java.util.HashMap<>();
            debug.put("totalContracts", contrats.size());
            
            java.util.List<java.util.Map<String, Object>> contractDetails = new java.util.ArrayList<>();
            for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
                java.util.Map<String, Object> detail = new java.util.HashMap<>();
                detail.put("id", contrat.getId());
                detail.put("idContrat", contrat.getIdContrat());
                detail.put("nomPrestataire", contrat.getNomPrestataire());
                detail.put("lot", contrat.getLot());
                detail.put("ville", contrat.getVille());
                detail.put("statut", contrat.getStatut());
                
                // Try to get prestataire info
                if (contrat.getPrestataire() != null) {
                    detail.put("prestataireId", contrat.getPrestataire().getId());
                    detail.put("prestataireEmail", contrat.getPrestataire().getEmail());
                    detail.put("prestataireNom", contrat.getPrestataire().getNom());
                } else {
                    detail.put("prestataireId", null);
                    detail.put("prestataireError", "Prestataire relationship is null");
                }
                
                contractDetails.add(detail);
            }
            
            debug.put("contracts", contractDetails);
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }
}

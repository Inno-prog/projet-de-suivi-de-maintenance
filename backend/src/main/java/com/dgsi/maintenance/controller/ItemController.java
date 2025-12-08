
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
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public Item createItem(@RequestBody Item item) {
        // Auto-generate idItem if not provided
        if (item.getIdItem() == null) {
            // Find the maximum idItem and increment by 1
            Integer maxIdItem = itemRepository.findAll().stream()
                .mapToInt(Item::getIdItem)
                .max()
                .orElse(0);
            item.setIdItem(maxIdItem + 1);
        }
        return itemRepository.save(item);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item item) {
        return itemRepository.findById(id)
            .map(existingItem -> {
                item.setId(id);
                return ResponseEntity.ok(itemRepository.save(item));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
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
}

package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.Map;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import com.dgsi.maintenance.service.ItemService;
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

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ItemService itemService;

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private OrdreCommandeRepository ordreCommandeRepository;

    /**
     * Calcule le prochain ID d'item disponible.
     * Utilise le COUNT réel des items existants + 1.
     * Exemple: s'il y a 5 items, le prochain sera ID 6.
     */
    private int getNextAvailableIdItem() {
        return itemService.getNextAvailableIdItem();
    }

    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-name/{nomItem}")
    public ResponseEntity<Item> getItemByName(@PathVariable String nomItem) {
        return itemRepository.findByNomItem(nomItem)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-lot/{lot}")
    public List<Item> getItemsByLot(@PathVariable String lot) {
        return itemRepository.findByLot(lot);
    }

    /**
     * Récupérer tous les items des contrats d'un prestataire.
     * Un prestataire voit les items liés à ses contrats par le biais des lots.
     * Les items sont associés à des lots (champ 'lot' de la table items),
     * et les contrats ont également un champ 'lot'.
     */
    @Transactional(readOnly = true)
    @GetMapping("/by-prestataire/{prestataireId}")
    public List<Item> getItemsByPrestataire(@PathVariable String prestataireId) {
        // Récupérer les contrats du prestataire
        List<com.dgsi.maintenance.entity.Contrat> contrats = 
            contratRepository.findByPrestataireId(prestataireId);
        
        if (contrats.isEmpty()) {
            System.out.println("[DEBUG] Prestataire " + prestataireId + " has no contracts, returning empty list");
            return new java.util.ArrayList<>();
        }
        
        // Extraire les numéros de lots des contrats (formes normalisées)
        java.util.Set<String> lotNumbers = new java.util.HashSet<>();
        for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
            String lot = contrat.getLot();
            if (lot != null && !lot.trim().isEmpty()) {
                String trimmedLot = lot.trim();
                lotNumbers.add(trimmedLot.toLowerCase());
                // Ajouter avec préfixe "Lot " en minuscule
                lotNumbers.add(("Lot " + trimmedLot).toLowerCase());
                // Extraire juste le numéro du lot
                String lotNumber = trimmedLot.replaceAll("(?i)^lot\\s*", "").trim();
                if (!lotNumber.isEmpty()) {
                    lotNumbers.add(lotNumber.toLowerCase());
                    lotNumbers.add(("Lot " + lotNumber).toLowerCase());
                }
            }
        }
        
        if (lotNumbers.isEmpty()) {
            System.out.println("[DEBUG] Prestataire " + prestataireId + " has contracts but no lots, returning empty list");
            return new java.util.ArrayList<>();
        }
        
        // Utiliser la nouvelle méthode optimisée pour trouver les items
        // Créer une liste de tous les noms de lots possibles
        java.util.List<String> allLotNames = new java.util.ArrayList<>(lotNumbers);
        
        // Méthode 1: Essayer avec la requête case-insensitive
        List<Item> items = itemRepository.findByLotNameInIgnoreCase(allLotNames);
        
        // Si aucun résultat, essayer avec des correspondances alternatives
        if (items.isEmpty()) {
            System.out.println("[DEBUG] No items found with exact lot match, trying alternative matching");
            List<Item> allItems = itemRepository.findAll();
            for (Item item : allItems) {
                String itemLot = item.getLot();
                if (itemLot != null && !itemLot.trim().isEmpty()) {
                    String normalizedItemLot = itemLot.trim().toLowerCase();
                    // Vérifier si le lot de l'item correspond à l'un des lots du prestataire
                    boolean matches = lotNumbers.stream().anyMatch(lotNum -> 
                        normalizedItemLot.equals(lotNum) ||
                        normalizedItemLot.equals("lot " + lotNum) ||
                        lotNum.equals("lot " + normalizedItemLot)
                    );
                    if (matches) {
                        items.add(item);
                    }
                }
            }
        }
        
        System.out.println("[DEBUG] Prestataire " + prestataireId + " has " + contrats.size() + " contracts");
        System.out.println("[DEBUG] Looking for items with lots: " + lotNumbers);
        System.out.println("[DEBUG] Found " + items.size() + " items matching the lots");
        
        return items;
    }

    @GetMapping("/search")
    public List<Item> searchItemsByName(@RequestParam String keyword) {
        return itemRepository.findByNomItemContainingIgnoreCase(keyword);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> createItem(@RequestBody Item item) {
        // Vérifier si un item avec le même nom existe déjà
        if (item.getNomItem() != null && itemRepository.existsByNomItem(item.getNomItem())) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("ITEM_EXISTS", "Un item avec ce nom existe déjà"));
        }

        // Assigner un ID séquentiel (réutilise les IDs supprimés)
        if (item.getIdItem() == null) {
            int nextId = getNextAvailableIdItem();
            item.setIdItem(nextId);
            System.out.println("[DEBUG] Assigned idItem: " + nextId);
        }

        Item savedItem = itemRepository.save(item);
        return ResponseEntity.ok(savedItem);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item itemDetails) {
        return itemRepository.findById(id)
            .map(item -> {
                item.setNomItem(itemDetails.getNomItem());
                item.setDescription(itemDetails.getDescription());
                item.setPrix(itemDetails.getPrix());
                item.setLot(itemDetails.getLot());
                item.setQuantiteMinTrimestre(itemDetails.getQuantiteMinTrimestre());
                item.setQuantiteMaxTrimestre(itemDetails.getQuantiteMaxTrimestre());
                return ResponseEntity.ok(itemRepository.save(item));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        return itemRepository.findById(id)
            .map(item -> {
                itemRepository.delete(item);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Endpoint pour obtenir les statistiques des items
     * Remplace l'endpoint /api/rapports-suivi/statistiques pour éviter les conflits
     */
    @GetMapping("/statistiques")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<Map<String, Object>> getStatistiquesItems() {
        try {
            Map<String, Object> stats = new java.util.HashMap<>();

            // Compter les items par lot
            List<Object[]> lotStats = itemRepository.countItemsByLot();
            java.util.Map<String, Long> itemsByLot = new java.util.HashMap<>();
            for (Object[] row : lotStats) {
                String lot = row[0] != null ? row[0].toString() : "null";
                Number countNum = (Number) row[1];
                Long count = countNum.longValue();
                itemsByLot.put(lot, count);
            }
            stats.put("itemsByLot", itemsByLot);

            // Compter les items totaux
            long totalItems = itemRepository.count();
            stats.put("totalItems", totalItems);

            // Compter les items avec limites trimestrielles
            long itemsWithLimits = itemRepository.countItemsWithLimits();
            stats.put("itemsWithLimits", itemsWithLimits);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Erreur lors du calcul des statistiques des items: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Admin endpoint pour réorganiser les IDs d'item après suppression.
     * Réorganise les IDs pour éviter les trous et réutiliser les IDs supprimés.
     */
    @PostMapping("/reorganize-ids")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> reorganizeItemIds() {
        try {
            // Récupérer tous les items existants et les trier par ID
            List<Item> allItems = itemRepository.findAll();
            allItems.sort((a, b) -> {
                if (a.getIdItem() == null && b.getIdItem() == null) return 0;
                if (a.getIdItem() == null) return 1;
                if (b.getIdItem() == null) return -1;
                return a.getIdItem().compareTo(b.getIdItem());
            });

            int nextId = 1;
            int updatedCount = 0;

            for (Item item : allItems) {
                if (item.getIdItem() == null || item.getIdItem() != nextId) {
                    item.setIdItem(nextId);
                    itemRepository.save(item);
                    updatedCount++;
                }
                nextId++;
            }

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("totalRecords", allItems.size());
            result.put("recordsUpdated", updatedCount);
            result.put("message", "Réorganisé les idItem pour éviter les trous");

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ErrorResponse("REORGANIZE_ERROR", e.getMessage()));
        }
    }

    /**
     * Admin endpoint pour initialiser ou régénérer les IDs d'item.
     * Assigne des IDs séquentiels à tous les items qui n'en ont pas.
     * Utile pour la migration initiale.
     */
    @PostMapping("/init-ids")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> initializeIdItems() {
        try {
            List<Item> allItems = itemRepository.findAll();
            int initializedCount = 0;
            int nextId = 1;

            // Trier par ID pour préserver l'ordre de création
            allItems.sort((a, b) -> a.getId().compareTo(b.getId()));

            for (Item item : allItems) {
                if (item.getIdItem() == null) {
                    // Trouver le prochain ID disponible
                    while (itemRepository.existsByIdItem(nextId)) {
                        nextId++;
                    }
                    item.setIdItem(nextId);
                    itemRepository.save(item);
                    initializedCount++;
                    nextId++;
                }
            }

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("totalRecords", allItems.size());
            result.put("recordsUpdated", initializedCount);
            result.put("message", "Initialisé idItem pour " + initializedCount + " items");

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ErrorResponse("INIT_ERROR", e.getMessage()));
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

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}

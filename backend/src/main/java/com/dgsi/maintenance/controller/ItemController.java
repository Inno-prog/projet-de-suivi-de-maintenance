package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.Map;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import com.dgsi.maintenance.service.ItemService;
import com.dgsi.maintenance.service.PrestationService;
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

    @Autowired
    private PrestationService prestationService;

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
     * 
     * Logique fixée: Utiliser une correspondance stricte des lots pour éviter les doublons
     */
    @Transactional(readOnly = true)
    @GetMapping("/by-prestataire/{prestataireId}")
    public List<Item> getItemsByPrestataire(@PathVariable String prestataireId) {
        System.out.println("[DEBUG] Getting items for prestataire: " + prestataireId);
        
        // Récupérer les contrats du prestataire en utilisant d'abord le prestataire_id
        List<com.dgsi.maintenance.entity.Contrat> contrats = contratRepository.findByPrestataireId(prestataireId);

        // Si aucun contrat trouvé avec prestataire_id, essayer avec le contact email
        if (contrats.isEmpty()) {
            System.out.println("[DEBUG] No contracts found with prestataire_id=" + prestataireId + ", trying by contact...");
            List<com.dgsi.maintenance.entity.Contrat> contratsByContact = 
                contratRepository.findActiveContratsByContactPrestataireAndLot(prestataireId, null);
            if (!contratsByContact.isEmpty()) {
                contrats = contratsByContact;
                System.out.println("[DEBUG] Found " + contrats.size() + " contracts by contact");
            }
        }

        // Si toujours vide, essayer de trouver par prestataire_id dans les contrats avec items
        if (contrats.isEmpty()) {
            System.out.println("[DEBUG] Still no contracts, trying findByPrestataireIdWithItems...");
            List<com.dgsi.maintenance.entity.Contrat> contratsWithItems = 
                contratRepository.findByPrestataireIdWithItems(prestataireId);
            if (!contratsWithItems.isEmpty()) {
                contrats = contratsWithItems.stream()
                    .filter(c -> c.getStatut() == com.dgsi.maintenance.entity.StatutContrat.ACTIF)
                    .collect(java.util.stream.Collectors.toList());
                System.out.println("[DEBUG] Found " + contrats.size() + " contracts with items");
            }
        }

        if (contrats.isEmpty()) {
            System.out.println("[DEBUG] Prestataire " + prestataireId + " has no contracts, returning empty list");
            return new java.util.ArrayList<>();
        }

        System.out.println("[DEBUG] Prestataire has " + contrats.size() + " contract(s):");
        for (com.dgsi.maintenance.entity.Contrat c : contrats) {
            System.out.println("[DEBUG] Contract: " + c.getIdContrat() + ", Lot: " + c.getLot() + ", LotEntity: " + (c.getLotEntity() != null ? c.getLotEntity().getNomLot() : "null"));
        }

        // Extraire les noms de lots des contrats (y compris via l'entité Lot)
        java.util.Set<String> uniqueLots = new java.util.HashSet<>();
        
        for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
            // Récupérer le lot depuis lotName (champ string)
            if (contrat.getLot() != null && !contrat.getLot().trim().isEmpty()) {
                uniqueLots.add(contrat.getLot().trim().toLowerCase());
            }
            // Récupérer le lot depuis l'entité Lot si disponible
            if (contrat.getLotEntity() != null && contrat.getLotEntity().getNomLot() != null) {
                uniqueLots.add(contrat.getLotEntity().getNomLot().trim().toLowerCase());
            }
        }

        if (uniqueLots.isEmpty()) {
            System.out.println("[DEBUG] Prestataire " + prestataireId + " has contracts but no lots, returning empty list");
            return new java.util.ArrayList<>();
        }

        System.out.println("[DEBUG] Looking for items with lots: " + uniqueLots);

        // Récupérer tous les items et filtrer par lots (correspondance flexible)
        List<Item> allItems = itemRepository.findAll();
        java.util.List<Item> matchingItems = new java.util.ArrayList<>();

        for (Item item : allItems) {
            if (item.getLot() != null && !item.getLot().trim().isEmpty()) {
                String itemLot = item.getLot().trim().toLowerCase();
                
                // Vérifier si le lot de l'item correspond à l'un des lots du prestataire (correspondance flexible)
                boolean matches = uniqueLots.stream().anyMatch(prestataireLot -> {
                    // Correspondance exacte ou sans préfixe "Lot " (insensible à la casse)
                    String normalizedItemLot = itemLot.replaceAll("(?i)^lot\\s*", "");
                    String normalizedPrestataireLot = prestataireLot.replaceAll("(?i)^lot\\s*", "");
                    return normalizedItemLot.equals(normalizedPrestataireLot);
                });

                if (matches) {
                    matchingItems.add(item);
                    System.out.println("[DEBUG] Found matching item: " + item.getNomItem() + ", Lot: " + item.getLot());
                }
            }
        }

        System.out.println("[DEBUG] Total items found: " + matchingItems.size());

        // Mettre à jour les compteurs d'utilisation pour chaque item
        for (Item item : matchingItems) {
            // Compter le nombre de prestations utilisant cet item (pour quantiteUtilisee)
            Long count = prestationService.countByNomPrestation(item.getNomItem());
            item.setQuantiteUtilisee(count.intValue());
            
            // Pour quantiteUtiliseeTrimestre, on devrait compter par trimestre, mais pour l'instant, on utilise la même valeur
            // TODO: Implémenter un compteur par trimestre
            if (item.getQuantiteUtiliseeTrimestre() == null) {
                item.setQuantiteUtiliseeTrimestre(count.intValue());
            }
            
            System.out.println("[DEBUG] Updated item " + item.getNomItem() + ": quantiteUtilisee=" + count + ", quantiteUtiliseeTrimestre=" + item.getQuantiteUtiliseeTrimestre());
        }

        // Trier les résultats par idItem pour conserver la numérotation correcte
        matchingItems.sort((a, b) -> {
            if (a.getIdItem() == null && b.getIdItem() == null) return 0;
            if (a.getIdItem() == null) return 1;
            if (b.getIdItem() == null) return -1;
            return a.getIdItem().compareTo(b.getIdItem());
        });

        return matchingItems;
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

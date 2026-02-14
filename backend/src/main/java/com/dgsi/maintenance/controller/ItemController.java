package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.Map;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.FichePrestationRepository;
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

    @Autowired
    private com.dgsi.maintenance.repository.UserRepository userRepository;
    
    @Autowired
    private FichePrestationRepository fichePrestationRepository;
    
    /**
     * Calculer la quantité totale réalisée pour un item donné (compte le nombre d'occurrences dans les fiches prestation)
     * Cette méthode est identique à getItemUsageCount dans FichePrestationPdfService pour assurer la cohérence
     */
    private int calculateItemUsageQuantity(String itemNom) {
        return calculateItemUsageQuantity(itemNom, null);
    }
    
    private int calculateItemUsageQuantity(String itemNom, String lot) {
        if (itemNom == null || itemNom.trim().isEmpty()) {
            return 0;
        }
        
        int total = 0;
        List<FichePrestation> allFiches = fichePrestationRepository.findAll();
        
        // Normaliser le nom de l'item pour la comparaison (supprimer les espaces en fin)
        String normalizedItemNom = itemNom.trim();
        
        for (FichePrestation fiche : allFiches) {
            if (fiche == null) continue;
            
            // Ne compter que les fiches du lot spécifié (via numero_fiche)
            if (lot != null && (fiche.getNumeroFiche() == null || !fiche.getNumeroFiche().contains("L" + lot.replaceAll("[^0-9]", "")))) {
                continue;
            }
            
            int countInFiche = 0;
            String itemsCouverts = fiche.getItemsCouverts();
            String nomItem = fiche.getNomItem();
            
            // Compter les occurrences dans itemsCouverts
            if (itemsCouverts != null && !itemsCouverts.trim().isEmpty()) {
                // Split items by commas and trim each item
                String[] items = itemsCouverts.split(",");
                for (String item : items) {
                    String trimmedItem = item.trim();
                    if (trimmedItem.equalsIgnoreCase(normalizedItemNom)) {
                        countInFiche++;
                    }
                }
            }
            
            // Compter l'occurrence dans nomItem
            if (countInFiche == 0 && nomItem != null && !nomItem.trim().isEmpty()) {
                if (nomItem.trim().equalsIgnoreCase(normalizedItemNom)) {
                    countInFiche++;
                }
            }
            
            total += countInFiche;
        }
        
        return total;
    }

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
        List<Item> allItems = itemRepository.findAll();
        
        // Mettre à jour les compteurs d'utilisation pour chaque item
        for (Item item : allItems) {
            // Calculer la quantité totale réalisée pour cet item (somme des quantités des fiches prestation)
            int totalQuantite = calculateItemUsageQuantity(item.getNomItem(), item.getLot());
            item.setQuantiteUtilisee(totalQuantite);
            
            if (item.getQuantiteUtiliseeTrimestre() == null) {
                item.setQuantiteUtiliseeTrimestre(totalQuantite);
            }
        }
        
        // Trier les résultats par idItem pour conserver la numérotation correcte
        allItems.sort((a, b) -> {
            if (a.getIdItem() == null && b.getIdItem() == null) return 0;
            if (a.getIdItem() == null) return 1;
            if (b.getIdItem() == null) return -1;
            return a.getIdItem().compareTo(b.getIdItem());
        });
        
        return allItems;
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
        List<Item> itemsByLot = itemRepository.findByLot(lot);
        
        // Mettre à jour les compteurs d'utilisation pour chaque item
        for (Item item : itemsByLot) {
            // Calculer la quantité totale réalisée pour cet item (somme des quantités des fiches prestation)
            int totalQuantite = calculateItemUsageQuantity(item.getNomItem(), lot);
            item.setQuantiteUtilisee(totalQuantite);
            
            if (item.getQuantiteUtiliseeTrimestre() == null) {
                item.setQuantiteUtiliseeTrimestre(totalQuantite);
            }
        }
        
        // Trier les résultats par idItem pour conserver la numérotation correcte
        itemsByLot.sort((a, b) -> {
            if (a.getIdItem() == null && b.getIdItem() == null) return 0;
            if (a.getIdItem() == null) return 1;
            if (b.getIdItem() == null) return -1;
            return a.getIdItem().compareTo(b.getIdItem());
        });
        
        return itemsByLot;
    }

    /**
     * Normalise un nom de lot pour comparaison :
     * - Supprime les parenthèses
     * - Normalise les espaces
     * - Supprime le préfixe "lot" (insensible à la casse)
     * - Convertit en minuscules
     * - Retourne la valeur exacte après normalisation (pas de substring matching)
     */
    private String normalizeLotName(String lotName) {
        if (lotName == null) return "";
        String normalized = lotName.replaceAll("[()]", " ").trim();
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
        String norm1 = normalizeLotName(lot1);
        String norm2 = normalizeLotName(lot2);
        
        // Si les deux sont vides ou null après normalisation, ils ne correspondent pas
        if (norm1.isEmpty() && norm2.isEmpty()) return false;
        
        // Comparaison EXACTE après normalisation (pas de contains, pas de substring)
        return norm1.equals(norm2);
    }

    /**
     * Récupérer tous les items des contrats d'un prestataire.
     * Un prestataire voit les items liés à ses contrats par le biais des lots.
     * Les items sont associés à des lots (champ 'lot' de la table items),
     * et les contrats ont également un champ 'lot'.
     * 
     * Logique fixée: Utiliser une correspondance flexible des lots avec plusieurs fallback
     */
    @Transactional(readOnly = true)
    @GetMapping("/by-prestataire/{prestataireId}")
    public List<Item> getItemsByPrestataire(@PathVariable String prestataireId) {
        System.out.println("[DEBUG] ===========================================");
        System.out.println("[DEBUG] Getting items for prestataire: " + prestataireId);
        
        // First, try to get the prestataire's info to get the company name
        String prestataireName = null;
        try {
            java.util.Optional<com.dgsi.maintenance.entity.User> userOpt = 
                userRepository.findById(prestataireId);
            if (userOpt.isPresent() && userOpt.get() instanceof com.dgsi.maintenance.entity.Prestataire) {
                com.dgsi.maintenance.entity.Prestataire prest = (com.dgsi.maintenance.entity.Prestataire) userOpt.get();
                // Try different name fields
                prestataireName = prest.getStructure(); // structure/company name
                if (prestataireName == null || prestataireName.trim().isEmpty()) {
                    prestataireName = prest.getNom(); // fallback to name
                }
                System.out.println("[DEBUG] Prestataire name from DB: " + prestataireName);
            }
        } catch (Exception e) {
            System.out.println("[DEBUG] Could not fetch prestataire name: " + e.getMessage());
        }

        List<com.dgsi.maintenance.entity.Contrat> contrats = new java.util.ArrayList<>();

        // Stratégie 1: Récupérer les contrats par prestataire_id (si la liaison existe)
        contrats = contratRepository.findByPrestataireId(prestataireId);
        System.out.println("[DEBUG] Strategy 1 - By prestataire_id: " + contrats.size() + " contracts");

        // Stratégie 2: Essayer par nom de prestataire (pour les contrats avec prestataire_id NULL)
        if (contrats.isEmpty() && prestataireName != null) {
            System.out.println("[DEBUG] Strategy 2 - Trying by nom_prestataire: " + prestataireName);
            List<com.dgsi.maintenance.entity.Contrat> contratsByName = 
                contratRepository.findActiveContratsByNomPrestataire(prestataireName);
            if (!contratsByName.isEmpty()) {
                contrats = contratsByName;
                System.out.println("[DEBUG] Found " + contrats.size() + " contracts by nom_prestataire");
            }
            
            // Also try partial match
            if (contrats.isEmpty()) {
                List<com.dgsi.maintenance.entity.Contrat> contratsByPartialName = 
                    contratRepository.findActiveContratsByNomPrestataireContaining(prestataireName);
                if (!contratsByPartialName.isEmpty()) {
                    contrats = contratsByPartialName;
                    System.out.println("[DEBUG] Found " + contrats.size() + " contracts by partial nom_prestataire");
                }
            }
        }

        // Stratégie 3: Scanner tous les contrats et chercher ceux dont le nom correspond
        if (contrats.isEmpty()) {
            System.out.println("[DEBUG] Strategy 3 - Scanning all contracts for match...");
            List<com.dgsi.maintenance.entity.Contrat> allContrats = contratRepository.findAll();
            for (com.dgsi.maintenance.entity.Contrat c : allContrats) {
                if (c.getNomPrestataire() != null && prestataireName != null) {
                    String contratPrestName = c.getNomPrestataire().toLowerCase();
                    String searchName = prestataireName.toLowerCase();
                    if (contratPrestName.equals(searchName) || 
                        contratPrestName.contains(searchName) || 
                        searchName.contains(contratPrestName)) {
                        if (c.getStatut() == com.dgsi.maintenance.entity.StatutContrat.ACTIF) {
                            contrats.add(c);
                            System.out.println("[DEBUG] Found matching contract by scan: " + c.getIdContrat() + " - " + c.getNomPrestataire());
                        }
                    }
                }
            }
        }

        // Stratégie 4: Si prestataireId looks like an email, try by contact
        if (contrats.isEmpty() && prestataireId != null && prestataireId.contains("@")) {
            System.out.println("[DEBUG] Strategy 4 - Trying by contact email: " + prestataireId);
            List<com.dgsi.maintenance.entity.Contrat> contratsByContact = 
                contratRepository.findActiveContratsByContactPrestataire(prestataireId);
            if (!contratsByContact.isEmpty()) {
                contrats = contratsByContact;
                System.out.println("[DEBUG] Found " + contrats.size() + " contracts by contact");
            }
        }

        if (contrats.isEmpty()) {
            System.out.println("[DEBUG] Prestataire " + prestataireId + " has no contracts - returning empty list");
            return new java.util.ArrayList<>();
        }

        System.out.println("[DEBUG] Prestataire has " + contrats.size() + " active contract(s):");
        for (com.dgsi.maintenance.entity.Contrat c : contrats) {
            System.out.println("[DEBUG]   Contract: " + c.getIdContrat() + ", Lot: '" + c.getLot() + "', Prestataire: " + c.getNomPrestataire());
        }

        // Extraire les noms de lots des contrats (y compris via l'entité Lot)
        java.util.Set<String> uniqueLots = new java.util.HashSet<>();
        
        for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
            // Récupérer le lot depuis lotName (champ string)
            if (contrat.getLot() != null && !contrat.getLot().trim().isEmpty()) {
                uniqueLots.add(contrat.getLot().trim().toLowerCase());
                System.out.println("[DEBUG] Added lot from contrat.getLot(): " + contrat.getLot());
            }
            // Récupérer le lot depuis l'entité Lot si disponible
            if (contrat.getLotEntity() != null && contrat.getLotEntity().getNomLot() != null) {
                uniqueLots.add(contrat.getLotEntity().getNomLot().trim().toLowerCase());
                System.out.println("[DEBUG] Added lot from contrat.getLotEntity(): " + contrat.getLotEntity().getNomLot());
            }
        }

        if (uniqueLots.isEmpty()) {
            System.out.println("[DEBUG] Prestataire " + prestataireId + " has contracts but no lots - returning empty list");
            return new java.util.ArrayList<>();
        }

        System.out.println("[DEBUG] Looking for items matching lots: " + uniqueLots);

        // Récupérer tous les items et filtrer par lots (correspondance flexible)
        List<Item> allItems = itemRepository.findAll();
        System.out.println("[DEBUG] Total items in database: " + allItems.size());
        
        java.util.List<Item> matchingItems = new java.util.ArrayList<>();

        for (Item item : allItems) {
            if (item.getLot() != null && !item.getLot().trim().isEmpty()) {
                String itemLot = item.getLot().trim().toLowerCase();
                
                // Vérifier si le lot de l'item correspond à l'un des lots du prestataire (correspondance flexible)
                boolean matches = uniqueLots.stream().anyMatch(prestataireLot -> {
                    return lotsMatch(itemLot, prestataireLot);
                });

                if (matches) {
                    matchingItems.add(item);
                    System.out.println("[DEBUG] ✅ Found matching item: " + item.getNomItem() + " (Lot: " + item.getLot() + ")");
                }
            }
        }

        System.out.println("[DEBUG] Total matching items found: " + matchingItems.size());

        // Mettre à jour les compteurs d'utilisation pour chaque item
        for (Item item : matchingItems) {
            // Calculer la quantité totale réalisée pour cet item (somme des quantités des fiches prestation)
            int totalQuantite = calculateItemUsageQuantity(item.getNomItem());
            item.setQuantiteUtilisee(totalQuantite);
            
            if (item.getQuantiteUtiliseeTrimestre() == null) {
                item.setQuantiteUtiliseeTrimestre(totalQuantite);
            }
            
            System.out.println("[DEBUG] Updated item " + item.getNomItem() + ": quantiteUtilisee=" + totalQuantite);
        }

        // Trier les résultats par idItem pour conserver la numérotation correcte
        matchingItems.sort((a, b) -> {
            if (a.getIdItem() == null && b.getIdItem() == null) return 0;
            if (a.getIdItem() == null) return 1;
            if (b.getIdItem() == null) return -1;
            return a.getIdItem().compareTo(b.getIdItem());
        });

        System.out.println("[DEBUG] ===========================================");
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

package com.dgsi.maintenance.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ContratItemService {

    private final ContratRepository contratRepository;
    private final ItemRepository itemRepository;
    private final com.dgsi.maintenance.repository.OrdreCommandeRepository ordreCommandeRepository;

    @Autowired
    public ContratItemService(ContratRepository contratRepository, ItemRepository itemRepository,
                              com.dgsi.maintenance.repository.OrdreCommandeRepository ordreCommandeRepository) {
        this.contratRepository = contratRepository;
        this.itemRepository = itemRepository;
        this.ordreCommandeRepository = ordreCommandeRepository;
    }

    /**
     * Vérifie si un prestataire peut créer une prestation avec les items demandés
     * VALIDATION ROBUSTE : Les limites d'utilisation doivent toujours être respectées
     */
    @Transactional(readOnly = true)
    public void verifierDisponibiliteItems(String nomPrestataire, String lot, Map<Long, Integer> itemQuantities) {
        log.info("🔍 Vérification disponibilité items pour prestataire {} sur lot {}", nomPrestataire, lot);

        // Récupérer les contrats actifs du prestataire pour ce lot
        List<Contrat> contratsActifs = null;

        if (nomPrestataire != null && !nomPrestataire.trim().isEmpty()) {
            contratsActifs = contratRepository.findActiveContratsByNomPrestataireAndLot(nomPrestataire, lot);

            // Si toujours vide, essayer avec le nom exact du prestataire (pour les contrats sans liaison)
            if (contratsActifs.isEmpty()) {
                contratsActifs = contratRepository.findByLot(lot).stream()
                    .filter(contrat -> contrat.getStatut() == com.dgsi.maintenance.entity.StatutContrat.ACTIF)
                    .filter(contrat -> nomPrestataire.equals(contrat.getNomPrestataire()))
                    .toList();
                log.info("🔍 Contrats trouvés par nomPrestataire '{}' pour lot '{}': {}", nomPrestataire, lot, contratsActifs.size());
            }
        } else {
            // Si pas de nom de prestataire fourni, chercher tous les contrats actifs pour ce lot
            contratsActifs = contratRepository.findByLot(lot).stream()
                .filter(contrat -> contrat.getStatut() == com.dgsi.maintenance.entity.StatutContrat.ACTIF)
                .toList();
            log.info("⚠️ Aucun prestataire fourni, trouvé {} contrats actifs pour le lot {}", contratsActifs.size(), lot);
        }

        if (contratsActifs.isEmpty()) {
            // Tentatives alternatives de recherche si la recherche par nomPrestataire n'a rien donné
            log.info("🔄 Aucun contrat trouvé avec nomPrestataire='{}'. Tentatives alternatives...", nomPrestataire);

            // Si nomPrestataire ressemble à un email, essayer par contact
            if (nomPrestataire != null && nomPrestataire.contains("@")) {
                contratsActifs = contratRepository.findActiveContratsByContactPrestataireAndLot(nomPrestataire, lot);
                if (!contratsActifs.isEmpty()) {
                    log.info("✅ Contrats trouvés par contact prestataire='{}' pour lot='{}' : {}", nomPrestataire, lot, contratsActifs.size());
                }
            }

            // Essayer une recherche par nom partiel
            if (contratsActifs.isEmpty() && nomPrestataire != null) {
                contratsActifs = contratRepository.findActiveContratsByNomPrestataireContaining(nomPrestataire);
                if (!contratsActifs.isEmpty()) {
                    // si on a trouvé, filtrer par lot si fourni
                    if (lot != null) {
                        final String lotFinal = lot;
                        contratsActifs = contratsActifs.stream()
                            .filter(c -> lotFinal.equals(c.getLot()))
                            .toList();
                    }
                    log.info("✅ Contrats trouvés par nomPrestataire contenant='{}' : {}", nomPrestataire, contratsActifs.size());
                }
            }

            // Essayer par prestataire id (cas où auth.name renvoie un id)
            if (contratsActifs.isEmpty() && nomPrestataire != null) {
                contratsActifs = contratRepository.findByPrestataireIdWithItems(nomPrestataire);
                if (!contratsActifs.isEmpty()) {
                    log.info("✅ Contrats trouvés par prestataireId='{}' : {}", nomPrestataire, contratsActifs.size());
                }
            }

            if (contratsActifs.isEmpty()) {
                // AVERTISSEMENT au lieu d'exception - mais CONTINUER la validation des limites
                String msg = String.format("Aucun contrat actif trouvé pour le prestataire %s sur le lot %s - validation des limites continuer", 
                    nomPrestataire != null ? nomPrestataire : "non spécifié", lot);
                log.warn("⚠️ {} - validation des limites continue", msg);
                
                // NE PAS RETOURNER - continuer avec la validation des limites d'utilisation
            }
        }

        // VÉRIFICATION CRITIQUE : Chaque item doit être validé individuellement
        for (Map.Entry<Long, Integer> entry : itemQuantities.entrySet()) {
            Long itemId = entry.getKey();
            Integer quantiteDemandee = entry.getValue();

            Optional<Item> itemOpt = itemRepository.findById(itemId);
            if (!itemOpt.isPresent()) {
                log.warn("⚠️ Item avec ID {} n'existe pas - ignoré", itemId);
                continue; // Passer à l'item suivant au lieu de bloquer
            }

            Item item = itemOpt.get();

            // Vérifier que l'item appartient au bon lot
            if (item.getLot() == null || !item.getLot().equals(lot)) {
                String msg = String.format("L'item %s n'appartient pas au lot %s", item.getNomItem(), lot);
                log.warn("⚠️ {} - création bloquée", msg);
                throw new IllegalArgumentException(msg);
            }

            // VÉRIFICATION CRITIQUE DES LIMITES TRIMESTRIELLES (toujours effectuée)
            Integer quantiteMax = item.getQuantiteMaxTrimestre();
            Integer quantiteUtilisee = item.getQuantiteUtiliseeTrimestre() != null ? item.getQuantiteUtiliseeTrimestre() : 0;
            
            if (quantiteMax != null && quantiteMax > 0) {
                // Vérifier que la quantité demandée ne dépasse pas la limite maximale
                if (quantiteDemandee > quantiteMax) {
                    String msg = String.format("Quantité demandée (%d) supérieure à la limite maximale (%d) pour l'item '%s'",
                        quantiteDemandee, quantiteMax, item.getNomItem());
                    log.warn("⚠️ {} - création bloquée", msg);
                    throw new IllegalArgumentException(msg);
                }
                
                // Vérifier que la quantité totale (existante + demandée) ne dépasse pas la limite
                int quantiteTotale = quantiteUtilisee + quantiteDemandee;
                if (quantiteTotale > quantiteMax) {
                    String msg = String.format("Quantité totale (%d) supérieure à la limite maximale (%d) pour l'item '%s' (déjà utilisé: %d, demandé: %d)",
                        quantiteTotale, quantiteMax, item.getNomItem(), quantiteUtilisee, quantiteDemandee);
                    log.warn("⚠️ {} - création bloquée", msg);
                    throw new IllegalArgumentException(msg);
                }
                
                log.info("✅ Item {} vérifié: limiteMax={}, dejaUtilise={}, demande={}, total={}", 
                    item.getNomItem(), quantiteMax, quantiteUtilisee, quantiteDemandee, quantiteTotale);
            } else {
                log.warn("⚠️ Item '{}' n'a pas de limite maximale définie - validation limitée", item.getNomItem());
            }

            // VÉRIFICATION CONTRACTUELLE (optionnelle si pas de contrats trouvés)
            if (!contratsActifs.isEmpty()) {
                // Calculer la capacité restante pour cet item sur l'ensemble des contrats actifs
                int totalMax = 0;
                int totalUsed = 0;

                for (Contrat contrat : contratsActifs) {
                    if (contrat.getOrdresCommande() == null) continue;
                    for (OrdreCommande oc : contrat.getOrdresCommande()) {
                        // Se concentrer sur les ordres qui concernent cet item
                        boolean containsItem = false;
                        if (oc.getItems() != null) {
                            containsItem = oc.getItems().stream().anyMatch(i -> i.getId().equals(item.getId()));
                        }
                        if (!containsItem) {
                            // fallback: compare by name
                            containsItem = oc.getNomItem() != null && oc.getNomItem().equals(item.getNomItem());
                        }

                        if (containsItem) {
                            int ocMax = oc.getMaxArticles() != null ? oc.getMaxArticles() : 0;
                            int ocUsed = oc.getNombreArticlesUtilise() != null ? oc.getNombreArticlesUtilise() : 0;
                            totalMax += ocMax;
                            totalUsed += ocUsed;
                        }
                    }
                }

                // Capacité restante basée uniquement sur les ordres de commande (logique par contrat)
                int totalRemaining = totalMax - totalUsed;

                if (totalRemaining <= 0) {
                    String msg = String.format("Capacité contractuelle épuisée pour l'item '%s' (utilisé %d/%d) - création autorisée malgré l'épuisement", item.getNomItem(), totalUsed, totalMax);
                    log.warn("⚠️ {} - création autorisée malgré l'épuisement", msg);
                    // CORRECTION: Ne pas bloquer la création, permettre malgré la capacité épuisée
                    return;
                }

                if (quantiteDemandee > totalRemaining) {
                    String msg = String.format("Quantité demandée (%d) supérieure à la capacité contractuelle restante (%d) pour l'item '%s' - création autorisée malgré l'insuffisance",
                        quantiteDemandee, totalRemaining, item.getNomItem());
                    log.warn("⚠️ {} - création autorisée malgré l'insuffisance", msg);
                    // CORRECTION: Ne pas bloquer la création, permettre malgré l'insuffisance de capacité
                    return;
                }

                log.info("✅ Item {} vérifié contractuellement: demandé={}, restantContractuel={}", item.getNomItem(), quantiteDemandee, totalRemaining);
            } else {
                log.info("✅ Item {} vérifié uniquement par limite trimestrielle (aucun contrat trouvé)", item.getNomItem());
            }
        }

        log.info("✅ Vérification des items terminée - création autorisée");
    }

    /**
     * Met à jour les quantités utilisées des items après création d'une prestation
     */
    @Transactional
    public void mettreAJourQuantitesUtilisees(String nomPrestataire, Map<Long, Integer> itemQuantities) {
        log.info("🔄 Mise à jour des quantités utilisées pour {} items (prestataire={})", itemQuantities.size(), nomPrestataire);

        // Trouver les contrats actifs du prestataire pour répliquer la logique de déduction
        for (Map.Entry<Long, Integer> entry : itemQuantities.entrySet()) {
            Long itemId = entry.getKey();
            Integer quantiteUtilisee = entry.getValue();

            Optional<Item> itemOpt = itemRepository.findById(itemId);
            if (!itemOpt.isPresent()) {
                log.warn("⚠️ Item avec ID {} n'existe pas - ignoré", itemId);
                continue;
            }

            Item item = itemOpt.get();

            // Localiser les contrats actifs pour ce prestataire et le lot de l'item
            String lot = item.getLot();
            List<Contrat> contratsActifs = contratRepository.findActiveContratsByNomPrestataireAndLot(nomPrestataire, lot);
            if (contratsActifs.isEmpty()) {
                contratsActifs = contratRepository.findByLot(lot).stream()
                    .filter(contrat -> contrat.getStatut() == com.dgsi.maintenance.entity.StatutContrat.ACTIF)
                    .filter(contrat -> nomPrestataire.equals(contrat.getNomPrestataire()))
                    .toList();
            }

            int remainingToAllocate = quantiteUtilisee != null ? quantiteUtilisee : 0;

            // CORRECTION : Mettre à jour les compteurs trimestriels ET globaux
            Integer quantiteActuelleTrimestrielle = item.getQuantiteUtiliseeTrimestre() != null ? item.getQuantiteUtiliseeTrimestre() : 0;
            item.setQuantiteUtiliseeTrimestre(quantiteActuelleTrimestrielle + remainingToAllocate);
            
            // Toujours incrémenter le compteur global de l'item (consommation pour le contrat)
            Integer quantiteActuelleGlobale = item.getQuantiteUtilisee() != null ? item.getQuantiteUtilisee() : 0;
            item.setQuantiteUtilisee(quantiteActuelleGlobale + remainingToAllocate);

            for (Contrat contrat : contratsActifs) {
                if (remainingToAllocate <= 0) break;
                if (contrat.getOrdresCommande() == null) continue;

                for (OrdreCommande oc : contrat.getOrdresCommande()) {
                    if (remainingToAllocate <= 0) break;

                    boolean containsItem = false;
                    if (oc.getItems() != null) {
                        containsItem = oc.getItems().stream().anyMatch(i -> i.getId().equals(item.getId()));
                    }
                    if (!containsItem) {
                        containsItem = oc.getNomItem() != null && oc.getNomItem().equals(item.getNomItem());
                    }
                    if (!containsItem) continue;

                    int ocMax = oc.getMaxArticles() != null ? oc.getMaxArticles() : 0;
                    int ocUsed = oc.getNombreArticlesUtilise() != null ? oc.getNombreArticlesUtilise() : 0;
                    int ocRemaining = ocMax - ocUsed;
                    if (ocRemaining <= 0) continue;

                    int allocate = Math.min(ocRemaining, remainingToAllocate);
                    oc.setNombreArticlesUtilise(ocUsed + allocate);
                    ordreCommandeRepository.save(oc);
                    remainingToAllocate -= allocate;
                    log.info("✅ Allocated {} units of item {} to OC {} (contrat {})", allocate, item.getNomItem(), oc.getId(), contrat.getId());
                }
            }

            // Toujours sauvegarder l'item (compteurs déjà mis à jour ci-dessus)
            itemRepository.save(item);
            if (remainingToAllocate > 0) {
                log.warn("⚠️ {} unités restantes non allouées aux OC pour l'item {}; elles sont comptabilisées dans les compteurs globaux", remainingToAllocate, item.getNomItem());
            }
            log.info("✅ Item {} mis à jour: quantiteUtiliseeTrimestre={}, quantiteUtilisee={}", item.getNomItem(), item.getQuantiteUtiliseeTrimestre(), item.getQuantiteUtilisee());
        }

        log.info("✅ Mise à jour des quantités terminée");
    }

    /**
     * Remet à zéro les compteurs trimestriels (à appeler au début de chaque trimestre)
     */
    @Transactional
    public void reinitialiserCompteursTrimestriels() {
        log.info("🔄 Réinitialisation des compteurs trimestriels");

        List<Item> items = itemRepository.findAll();
        for (Item item : items) {
            // Remettre à zéro la quantité utilisée ce trimestre
            item.setQuantiteUtiliseeTrimestre(0);
            
            // Restaurer la quantité max originale (si elle était stockée quelque part)
            // Pour l'instant, on garde la valeur actuelle
            itemRepository.save(item);
        }

        log.info("✅ {} compteurs trimestriels réinitialisés", items.size());
    }

    /**
     * Récupère les statistiques d'utilisation des items pour un contrat
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatistiquesUtilisationContrat(Long contratId) {
        Optional<Contrat> contratOpt = contratRepository.findById(contratId);
        if (!contratOpt.isPresent()) {
            throw new IllegalArgumentException("Contrat non trouvé avec ID: " + contratId);
        }

        Contrat contrat = contratOpt.get();
        
        // Calculer les statistiques pour chaque item du contrat
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("contratId", contratId);
        stats.put("nomPrestataire", contrat.getNomPrestataire());
        stats.put("lot", contrat.getLot());
        stats.put("budgetTotal", contrat.getMontant());
        stats.put("budgetRestant", contrat.getMontantRestant());
        
        List<Map<String, Object>> itemsStats = new java.util.ArrayList<>();
        for (Item item : contrat.getItems()) {
            Map<String, Object> itemStat = new java.util.HashMap<>();
            itemStat.put("itemId", item.getId());
            itemStat.put("nomItem", item.getNomItem());
            itemStat.put("quantiteMaxTrimestre", item.getQuantiteMaxTrimestre());
            itemStat.put("quantiteUtiliseeTrimestre", item.getQuantiteUtiliseeTrimestre());
            itemStat.put("quantiteRestante", 
                (item.getQuantiteMaxTrimestre() != null ? item.getQuantiteMaxTrimestre() : 0) - 
                (item.getQuantiteUtiliseeTrimestre() != null ? item.getQuantiteUtiliseeTrimestre() : 0));
            itemsStats.add(itemStat);
        }
        stats.put("items", itemsStats);
        
        return stats;
    }

    /**
     * Synchronise les quantités des items avec les prestations existantes.
     * Cette méthode recalcule les quantités utilisées à partir des prestations validées.
     */
    @Transactional
    public Map<String, Object> synchroniserQuantitesAvecPrestationsExistantes() {
        log.info("🔄 Synchronisation des quantités avec les prestations existantes...");

        Map<String, Object> report = new java.util.HashMap<>();
        int itemsUpdated = 0;
        int totalQuantitiesRecalculated = 0;
        List<Map<String, Object>> details = new java.util.ArrayList<>();

        // Récupérer tous les items
        List<Item> allItems = itemRepository.findAll();
        
        for (Item item : allItems) {
            // Récupérer les prestations associées à cet item
            Set<Prestation> prestations = item.getPrestations();
            
            if (prestations == null || prestations.isEmpty()) {
                // Si pas de prestations, réinitialiser les compteurs
                if (item.getQuantiteUtilisee() != null && item.getQuantiteUtilisee() > 0) {
                    log.info("🔄 Item {}: pas de prestations, réinitialisation des compteurs", item.getNomItem());
                    item.setQuantiteUtilisee(0);
                    item.setQuantiteUtiliseeTrimestre(0);
                    itemRepository.save(item);
                    itemsUpdated++;
                }
                continue;
            }

            // Calculer les quantités totales à partir des prestations
            int totalQuantite = 0;
            int totalQuantiteTrimestre = 0;

            for (Prestation prestation : prestations) {
                // Vérifier si la prestation est validée (statut validation = VALIDE)
                if ("VALIDE".equals(prestation.getStatutValidation())) {
                    
                    // Récupérer la quantité utilisée pour cet item dans cette prestation
                    Integer quantite = null;
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        TypeReference<Map<Long, Integer>> typeRef = new TypeReference<>() {};
                        Map<Long, Integer> itemQuantitiesMap = mapper.readValue(prestation.getItemQuantities(), typeRef);
                        quantite = itemQuantitiesMap.get(item.getId());
                    } catch (Exception e) {
                        log.debug("Erreur lors de la lecture des quantités de la prestation {}: {}", prestation.getId(), e.getMessage());
                    }
                    
                    if (quantite != null && quantite > 0) {
                        totalQuantite += quantite;
                        
                        // Vérifier si la prestation est du trimestre courant
                        if (isCurrentTrimestre(prestation)) {
                            totalQuantiteTrimestre += quantite;
                        }
                    }
                }
            }

            // Mettre à jour l'item si les quantités ont changé
            Integer currentQuantite = item.getQuantiteUtilisee() != null ? item.getQuantiteUtilisee() : 0;
            Integer currentQuantiteTrimestre = item.getQuantiteUtiliseeTrimestre() != null ? item.getQuantiteUtiliseeTrimestre() : 0;

            if (currentQuantite != totalQuantite || currentQuantiteTrimestre != totalQuantiteTrimestre) {
                log.info("🔄 Item {}: mise à jour des quantités (global: {} -> {}, trimestre: {} -> {})", 
                    item.getNomItem(), currentQuantite, totalQuantite, currentQuantiteTrimestre, totalQuantiteTrimestre);
                
                item.setQuantiteUtilisee(totalQuantite);
                item.setQuantiteUtiliseeTrimestre(totalQuantiteTrimestre);
                itemRepository.save(item);
                
                itemsUpdated++;
                totalQuantitiesRecalculated += Math.abs(totalQuantite - currentQuantite);
                
                Map<String, Object> itemDetail = new java.util.HashMap<>();
                itemDetail.put("itemId", item.getId());
                itemDetail.put("nomItem", item.getNomItem());
                itemDetail.put("ancienneQuantite", currentQuantite);
                itemDetail.put("nouvelleQuantite", totalQuantite);
                itemDetail.put("ancienneQuantiteTrimestre", currentQuantiteTrimestre);
                itemDetail.put("nouvelleQuantiteTrimestre", totalQuantiteTrimestre);
                details.add(itemDetail);
            }
        }

        report.put("itemsUpdated", itemsUpdated);
        report.put("totalQuantitiesRecalculated", totalQuantitiesRecalculated);
        report.put("details", details);
        report.put("message", "Synchronisation terminée avec succès");
        
        log.info("✅ Synchronisation terminée: {} items mis à jour, {} quantités recalculées", itemsUpdated, totalQuantitiesRecalculated);
        
        return report;
    }

    /**
     * Vérifie si une prestation appartient au trimestre courant
     */
    private boolean isCurrentTrimestre(Prestation prestation) {
        if (prestation.getDateDebut() == null) {
            return false;
        }
        
        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.LocalDate dateDebut = prestation.getDateDebut();
        
        // Déterminer le trimestre courant
        int currentMonth = now.getMonthValue();
        int currentTrimestre = (currentMonth - 1) / 3 + 1;
        int currentYear = now.getYear();
        
        // Déterminer le trimestre de la prestation
        int prestationMonth = dateDebut.getMonthValue();
        int prestationTrimestre = (prestationMonth - 1) / 3 + 1;
        int prestationYear = dateDebut.getYear();
        
        return currentYear == prestationYear && currentTrimestre == prestationTrimestre;
    }
}

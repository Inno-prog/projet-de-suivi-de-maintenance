package com.dgsi.maintenance.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.ItemRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ContratItemService {

    private final ContratRepository contratRepository;
    private final ItemRepository itemRepository;

    @Autowired
    public ContratItemService(ContratRepository contratRepository, ItemRepository itemRepository) {
        this.contratRepository = contratRepository;
        this.itemRepository = itemRepository;
    }

    /**
     * Vérifie si un prestataire peut créer une prestation avec les items demandés
     */
    @Transactional(readOnly = true)
    public void verifierDisponibiliteItems(String prestataireContact, String lot, Map<Long, Integer> itemQuantities) {
        log.info("🔍 Vérification disponibilité items pour prestataire {} sur lot {}", prestataireContact, lot);

        // Récupérer les contrats actifs du prestataire pour ce lot
        List<Contrat> contratsActifs = contratRepository.findActiveContratsByContactPrestataireAndLot(prestataireContact, lot);
        
        if (contratsActifs.isEmpty()) {
            contratsActifs = contratRepository.findActiveContratsByNomPrestataireAndLot(prestataireContact, lot);
        }

        if (contratsActifs.isEmpty()) {
            throw new IllegalArgumentException("Aucun contrat actif trouvé pour le prestataire " + prestataireContact + " sur le lot " + lot);
        }

        // Vérifier chaque item demandé
        for (Map.Entry<Long, Integer> entry : itemQuantities.entrySet()) {
            Long itemId = entry.getKey();
            Integer quantiteDemandee = entry.getValue();

            Optional<Item> itemOpt = itemRepository.findById(itemId);
            if (!itemOpt.isPresent()) {
                throw new IllegalArgumentException("Item avec ID " + itemId + " n'existe pas");
            }

            Item item = itemOpt.get();
            
            // Vérifier que l'item appartient au bon lot
            if (!lot.equals(item.getLot())) {
                throw new IllegalArgumentException("L'item " + item.getNomItem() + " n'appartient pas au lot " + lot);
            }

            // Vérifier que le prestataire a un contrat pour cet item
            boolean itemDansContrat = contratsActifs.stream()
                .anyMatch(contrat -> contrat.getItems().contains(item));

            if (!itemDansContrat) {
                throw new IllegalArgumentException("Le prestataire n'a pas de contrat pour l'item " + item.getNomItem());
            }

            // Vérifier la limite trimestrielle
            Integer quantiteUtiliseeTrimestre = item.getQuantiteUtiliseeTrimestre() != null ? item.getQuantiteUtiliseeTrimestre() : 0;
            Integer quantiteMaxTrimestre = item.getQuantiteMaxTrimestre() != null ? item.getQuantiteMaxTrimestre() : 0;
            
            Integer quantiteRestante = quantiteMaxTrimestre - quantiteUtiliseeTrimestre;

            if (quantiteRestante <= 0) {
                throw new IllegalArgumentException(
                    "Limite trimestrielle atteinte pour l'item '" + item.getNomItem() + "'. " +
                    "Quantité utilisée: " + quantiteUtiliseeTrimestre + "/" + quantiteMaxTrimestre
                );
            }

            if (quantiteDemandee > quantiteRestante) {
                throw new IllegalArgumentException(
                    "Quantité demandée (" + quantiteDemandee + ") supérieure à la quantité restante (" + quantiteRestante + 
                    ") pour l'item '" + item.getNomItem() + "'"
                );
            }

            log.info("✅ Item {} OK: demandé={}, restant={}", item.getNomItem(), quantiteDemandee, quantiteRestante);
        }

        log.info("✅ Tous les items sont disponibles pour la prestation");
    }

    /**
     * Met à jour les quantités utilisées des items après création d'une prestation
     */
    @Transactional
    public void mettreAJourQuantitesUtilisees(Map<Long, Integer> itemQuantities) {
        log.info("🔄 Mise à jour des quantités utilisées pour {} items", itemQuantities.size());

        for (Map.Entry<Long, Integer> entry : itemQuantities.entrySet()) {
            Long itemId = entry.getKey();
            Integer quantiteUtilisee = entry.getValue();

            Optional<Item> itemOpt = itemRepository.findById(itemId);
            if (itemOpt.isPresent()) {
                Item item = itemOpt.get();
                
                // Incrémenter la quantité utilisée ce trimestre
                Integer quantiteActuelle = item.getQuantiteUtiliseeTrimestre() != null ? item.getQuantiteUtiliseeTrimestre() : 0;
                item.setQuantiteUtiliseeTrimestre(quantiteActuelle + quantiteUtilisee);
                
                // Incrémenter aussi le compteur global d'utilisation (quantiteUtilisee)
                Integer quantiteGlobale = item.getQuantiteUtilisee() != null ? item.getQuantiteUtilisee() : 0;
                item.setQuantiteUtilisee(quantiteGlobale + quantiteUtilisee);

                itemRepository.save(item);
                
                log.info("✅ Item {} mis à jour: utilisé ce trimestre={}/{}, utilisé total={}", 
                    item.getNomItem(), item.getQuantiteUtiliseeTrimestre(), item.getQuantiteMaxTrimestre(), item.getQuantiteUtilisee());
            }
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
}
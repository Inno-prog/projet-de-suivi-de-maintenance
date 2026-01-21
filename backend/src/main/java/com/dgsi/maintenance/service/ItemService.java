package com.dgsi.maintenance.service;

import java.util.List;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    /**
     * Calcule le prochain ID d'item disponible.
     * Utilise le COUNT réel des items existants + 1.
     * Exemple: s'il y a 5 items, le prochain sera ID 6.
     * Si des IDs ont été supprimés, réutilise le plus petit ID disponible.
     */
    public int getNextAvailableIdItem() {
        // Récupérer tous les IDs utilisés
        List<Integer> usedIds = itemRepository.findAllUsedIdItems();
        
        if (usedIds.isEmpty()) {
            return 1; // Premier item
        }
        
        // Le prochain ID est le premier trou dans la séquence
        // Exemple: si les IDs utilisés sont [1, 2, 4, 5], le prochain sera 3
        int nextId = 1;
        while (usedIds.contains(nextId)) {
            nextId++;
        }
        return nextId;
    }

    /**
     * Récupérer tous les items
     */
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    /**
     * Récupérer un item par ID
     */
    public Item getItemById(Long id) {
        return itemRepository.findById(id).orElse(null);
    }

    /**
     * Récupérer un item par nom
     */
    public Item getItemByNomItem(String nomItem) {
        return itemRepository.findByNomItem(nomItem).orElse(null);
    }

    /**
     * Récupérer les items par lot
     */
    public List<Item> getItemsByLot(String lot) {
        return itemRepository.findByLot(lot);
    }

    /**
     * Rechercher des items par nom (insensible à la casse)
     */
    public List<Item> searchItemsByName(String keyword) {
        return itemRepository.findByNomItemContainingIgnoreCase(keyword);
    }

    /**
     * Vérifier si un item existe par nom
     */
    public boolean existsByNomItem(String nomItem) {
        return itemRepository.existsByNomItem(nomItem);
    }

    /**
     * Compter les items par lot
     */
    public long countByLot(String lot) {
        return itemRepository.countByLot(lot);
    }
}


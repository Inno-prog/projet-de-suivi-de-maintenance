package com.dgsi.maintenance.config;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(3)
public class ItemDataInitializer implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(ItemDataInitializer.class.getName());

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ContratRepository contratRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing Item data...");
        if (itemRepository.count() == 0) {
            logger.info("No items found, creating sample data...");
            createSampleItems();
        } else {
            logger.info("Items already exist, skipping sample data creation");
        }
        logger.info("Item data initialized");
    }

    private void createSampleItems() {
        try {
            logger.info("=== DÉBUT DE LA CRÉATION DES ITEMS ===");

            // Créer des items d'exemple
            List<Item> items = Arrays.asList(
                // Items pour Lot 9 (Ouagadougou) - contrat CT-001-2025
                createItem("1.1", "Installation ou réinstallation des logiciels bureautiques", 3000, "Ordinateur de bureau"),
                createItem("1.2", "Installation complète des logiciels système", 4000, "Ordinateur de bureau"),
                createItem("1.9", "Mise en service d'un nouvel ordinateur", 2000, "Ordinateur de bureau"),

                // Items pour Lot 6 (Bobo-Dioulasso) - contrat CT-002-2025
                createItem("2.1", "Installation logiciels bureautiques portable", 4000, "Ordinateur portable"),
                createItem("2.8", "Mise en service ordinateur portable", 2000, "Ordinateur portable"),

                // Items pour Lot 5 (Koudougou) - contrat CT-004-2025
                createItem("1.15", "Disque dur 500 Go", 15000, "Ordinateur de bureau"),
                createItem("1.20", "Processeur Intel core i3", 5000, "Ordinateur de bureau")
            );

            // Sauvegarder les items
            itemRepository.saveAll(items);
            logger.info("Created " + items.size() + " sample items");

            // Associer les items aux contrats
            associateItemsWithContracts();

            logger.info("=== FIN DE LA CRÉATION DES ITEMS ===");

        } catch (Exception e) {
            logger.severe("ERREUR CRITIQUE lors de la création des items: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private Item createItem(String idItem, String nom, Integer prix, String type) {
        Item item = new Item();
        item.setIdItem(Integer.parseInt(idItem.replace(".", ""))); // Convert "1.1" to 11, "2.1" to 21, etc.
        item.setNomItem(nom);
        item.setPrix(Float.valueOf(prix));
        item.setDescription("Description pour " + nom);
        item.setQuantiteMaxTrimestre(10); // Quantité par défaut
        item.setLot(type); // Type d'équipement
        return item;
    }

    private void associateItemsWithContracts() {
        // Trouver les contrats par leur numéro de lot
        List<Contrat> contratsLot9 = contratRepository.findByLot("Lot 9");
        List<Contrat> contratsLot6 = contratRepository.findByLot("Lot 6");
        List<Contrat> contratsLot5 = contratRepository.findByLot("Lot 5");

        logger.info("Found " + contratsLot9.size() + " contracts for Lot 9");
        logger.info("Found " + contratsLot6.size() + " contracts for Lot 6");
        logger.info("Found " + contratsLot5.size() + " contracts for Lot 5");

        // Associer les items aux contrats Lot 9
        if (!contratsLot9.isEmpty()) {
            Set<Item> itemsLot9 = new HashSet<>();
            // Trouver les items pour ordinateurs de bureau
            itemRepository.findByLot("Ordinateur de bureau").forEach(itemsLot9::add);

            for (Contrat contrat : contratsLot9) {
                contrat.setItems(itemsLot9);
                contratRepository.save(contrat);
                logger.info("Associated " + itemsLot9.size() + " items with contract " + contrat.getIdContrat());
            }
        }

        // Associer les items aux contrats Lot 6
        if (!contratsLot6.isEmpty()) {
            Set<Item> itemsLot6 = new HashSet<>();
            // Trouver les items pour ordinateurs portables
            itemRepository.findByLot("Ordinateur portable").forEach(itemsLot6::add);

            for (Contrat contrat : contratsLot6) {
                contrat.setItems(itemsLot6);
                contratRepository.save(contrat);
                logger.info("Associated " + itemsLot6.size() + " items with contract " + contrat.getIdContrat());
            }
        }

        // Associer les items aux contrats Lot 5
        if (!contratsLot5.isEmpty()) {
            Set<Item> itemsLot5 = new HashSet<>();
            // Mélanger les items pour Lot 5 - prendre tous les items disponibles
            itemRepository.findAll().forEach(itemsLot5::add);

            for (Contrat contrat : contratsLot5) {
                contrat.setItems(itemsLot5);
                contratRepository.save(contrat);
                logger.info("Associated " + itemsLot5.size() + " items with contract " + contrat.getIdContrat());
            }
        }
    }
}

package com.dgsi.maintenance.config;

import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.Item;
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

            // Les items sont déjà présents dans la base de données
            // Ne pas créer d'items d'exemple
            List<Item> items = Arrays.asList();

            // Sauvegarder les items
            itemRepository.saveAll(items);
            logger.info("Created " + items.size() + " sample items");

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


}

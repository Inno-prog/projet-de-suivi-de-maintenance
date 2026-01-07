package com.dgsi.maintenance.config;

import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.Lot;
import com.dgsi.maintenance.repository.LotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class LotDataInitializer implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(LotDataInitializer.class.getName());

    @Autowired
    private LotRepository lotRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing Lot data...");
        if (lotRepository.count() == 0) {
            logger.info("No lots found, creating sample data...");
            createSampleLots();
        } else {
            logger.info("Lots already exist, skipping sample data creation");
        }
        logger.info("Lot data initialized");
    }

    private void createSampleLots() {
        try {
            logger.info("=== DÉBUT DE LA CRÉATION DES LOTS ===");

            List<Lot> lots = Arrays.asList(
                // Lots are already in the database
            );

            // Sauvegarder les lots
            lotRepository.saveAll(lots);
            logger.info("Created " + lots.size() + " sample lots");

            logger.info("=== FIN DE LA CRÉATION DES LOTS ===");

        } catch (Exception e) {
            logger.severe("ERREUR CRITIQUE lors de la création des lots: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private Lot createLot(String nomLot, List<String> villes) {
        Lot lot = new Lot();
        lot.setNomLot(nomLot);
        lot.setVilles(villes);
        return lot;
    }
}

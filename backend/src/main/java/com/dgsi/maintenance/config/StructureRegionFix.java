package com.dgsi.maintenance.config;

import java.util.List;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.StructureMefp;
import com.dgsi.maintenance.repository.StructureMefpRepository;
import com.dgsi.maintenance.service.ReferenceDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Component to fix structures with null region field by inferring region from ville
 * This will run automatically on application startup
 */
@Component
public class StructureRegionFix implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(StructureRegionFix.class.getName());

    @Autowired
    private StructureMefpRepository structureMefpRepository;

    @Autowired
    private ReferenceDataService referenceDataService;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Running StructureRegionFix to update structures with null region");

        // Find all structures with null or empty region
        List<StructureMefp> structures = structureMefpRepository.findAll();
        int updatedCount = 0;

        for (StructureMefp structure : structures) {
            if (structure.getRegion() == null || structure.getRegion().isEmpty()) {
                String ville = structure.getVille();
                if (ville != null && !ville.isEmpty()) {
                    String region = referenceDataService.assignRegionFromVille(ville);
                    if (region != null) {
                        structure.setRegion(region);
                        structureMefpRepository.save(structure);
                        logger.info("Updated structure '" + structure.getNom() + "' with region '" + region + "' (inferred from ville '" + ville + "')");
                        updatedCount++;
                    } else {
                        logger.warning("Could not infer region for structure '" + structure.getNom() + "' with ville '" + ville + "'");
                    }
                }
            }
        }

        logger.info("StructureRegionFix completed. Updated " + updatedCount + " structures.");
    }
}

package com.dgsi.maintenance.config;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.Prestataire;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Data fix for Softlink Technologies and Digital Solutions issues.
 * Run this to fix:
 * 1. Softlink Technologies - ensure correct lot assignment
 * 2. Digital Solutions - ensure contract is linked to prestataire
 */
@Component
@Order(16)
public class SoftlinkDigitalSolutionsFix implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(SoftlinkDigitalSolutionsFix.class.getName());

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("🔧 Running Softlink Technologies & Digital Solutions data fixes...");
            
            fixDigitalSolutionsContractLink();
            fixSoftlinkTechnologiesLot();
            
            logger.info("✅ Softlink Technologies & Digital Solutions data fixes completed!");
        } catch (Exception e) {
            logger.severe("❌ Error running data fixes: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Fix Digital Solutions contract linkage to prestataire.
     * Digital Solutions items don't show because its contract may not be linked.
     */
    private void fixDigitalSolutionsContractLink() {
        logger.info("📋 Fixing Digital Solutions contract linkage...");
        
        // Find Digital Solutions prestataire
        Optional<Prestataire> digitalSolutionsOpt = Optional.empty();
        
        // Try different ways to find Digital Solutions
        // First by structure/company name
        try {
            List<Prestataire> allPrestataires = userRepository.findAll().stream()
                .filter(u -> u instanceof Prestataire)
                .map(u -> (Prestataire) u)
                .toList();
            
            digitalSolutionsOpt = allPrestataires.stream()
                .filter(p -> p.getStructure() != null && 
                    (p.getStructure().toLowerCase().contains("digital") || 
                     p.getStructure().toLowerCase().contains("solutions")))
                .findFirst();
        } catch (Exception e) {
            logger.warning("Could not find Digital Solutions by structure: " + e.getMessage());
        }
        
        if (digitalSolutionsOpt.isEmpty()) {
            logger.warning("⚠️ Digital Solutions prestataire not found in database");
            return;
        }
        
        Prestataire digitalSolutions = digitalSolutionsOpt.get();
        logger.info("✅ Found Digital Solutions prestataire: " + digitalSolutions.getId() + 
                   " (structure: " + digitalSolutions.getStructure() + ")");
        
        // Find Digital Solutions contract(s)
        List<Contrat> contrats = contratRepository.findAll().stream()
            .filter(c -> c.getNomPrestataire() != null &&
                (c.getNomPrestataire().toLowerCase().contains("digital") ||
                 c.getNomPrestataire().toLowerCase().contains("solutions")))
            .toList();
        
        if (contrats.isEmpty()) {
            logger.warning("⚠️ No contracts found for Digital Solutions");
            return;
        }
        
        logger.info("Found " + contrats.size() + " contract(s) for Digital Solutions:");
        
        for (Contrat contrat : contrats) {
            logger.info("  - Contract: " + contrat.getIdContrat() + 
                       ", Lot: " + contrat.getLot() + 
                       ", Current prestataire_id: " + contrat.getPrestataire());
            
            // Link contract to prestataire if not already linked
            if (contrat.getPrestataire() == null || 
                !contrat.getPrestataire().getId().equals(digitalSolutions.getId())) {
                
                contrat.setPrestataire(digitalSolutions);
                contratRepository.save(contrat);
                logger.info("  ✅ Linked contract " + contrat.getIdContrat() + " to Digital Solutions");
            } else {
                logger.info("  ✅ Contract already linked to Digital Solutions");
            }
        }
    }

    /**
     * Fix Softlink Technologies lot assignment.
     * Softlink may have wrong lot or contract may not be properly associated.
     */
    private void fixSoftlinkTechnologiesLot() {
        logger.info("📋 Fixing Softlink Technologies lot assignment...");
        
        // Find Softlink Technologies prestataire
        Optional<Prestataire> softlinkOpt = Optional.empty();
        
        try {
            List<Prestataire> allPrestataires = userRepository.findAll().stream()
                .filter(u -> u instanceof Prestataire)
                .map(u -> (Prestataire) u)
                .toList();
            
            softlinkOpt = allPrestataires.stream()
                .filter(p -> p.getStructure() != null && 
                    (p.getStructure().toLowerCase().contains("softlink") ||
                     p.getStructure().toLowerCase().contains("soft link")))
                .findFirst();
        } catch (Exception e) {
            logger.warning("Could not find Softlink Technologies by structure: " + e.getMessage());
        }
        
        if (softlinkOpt.isEmpty()) {
            logger.warning("⚠️ Softlink Technologies prestataire not found in database");
            return;
        }
        
        Prestataire softlink = softlinkOpt.get();
        logger.info("✅ Found Softlink Technologies prestataire: " + softlink.getId() + 
                   " (structure: " + softlink.getStructure() + ")");
        
        // Find Softlink contract(s)
        List<Contrat> contrats = contratRepository.findAll().stream()
            .filter(c -> c.getNomPrestataire() != null &&
                (c.getNomPrestataire().toLowerCase().contains("softlink") ||
                 c.getNomPrestataire().toLowerCase().contains("soft link")))
            .toList();
        
        if (contrats.isEmpty()) {
            logger.warning("⚠️ No contracts found for Softlink Technologies");
            return;
        }
        
        logger.info("Found " + contrats.size() + " contract(s) for Softlink Technologies:");
        
        for (Contrat contrat : contrats) {
            logger.info("  - Contract: " + contrat.getIdContrat() + 
                       ", Lot: " + contrat.getLot() + 
                       ", Current prestataire_id: " + contrat.getPrestataire());
            
            // Ensure contract is linked to prestataire
            if (contrat.getPrestataire() == null || 
                !contrat.getPrestataire().getId().equals(softlink.getId())) {
                
                contrat.setPrestataire(softlink);
                contratRepository.save(contrat);
                logger.info("  ✅ Linked contract " + contrat.getIdContrat() + " to Softlink Technologies");
            }
            
            // Check if lot is correct (should be "Lot 4" based on the issue)
            String lot = contrat.getLot();
            if (lot == null || lot.trim().isEmpty()) {
                logger.warning("  ⚠️ Contract " + contrat.getIdContrat() + " has no lot assigned!");
            } else if (!lot.toLowerCase().contains("4") && !lot.toLowerCase().contains("lot")) {
                logger.warning("  ⚠️ Contract " + contrat.getIdContrat() + " lot may be incorrect: " + lot);
            } else {
                logger.info("  ✅ Contract lot looks correct: " + lot);
            }
        }
    }
}


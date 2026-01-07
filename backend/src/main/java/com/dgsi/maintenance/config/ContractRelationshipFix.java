package com.dgsi.maintenance.config;

import java.util.logging.Logger;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(15)
public class ContractRelationshipFix implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(ContractRelationshipFix.class.getName());

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("Fixing contract-prestataire relationships...");
            
            // Find NetCom Afrique prestataire
            var netComOpt = userRepository.findByEmail("netcom@gmail.com");
            // Find SoftLink Technologies prestataire  
            var softLinkOpt = userRepository.findByEmail("softlink@gmail.com");
            
            if (netComOpt.isPresent() && softLinkOpt.isPresent()) {
                var netComUser = netComOpt.get();
                var softLinkUser = softLinkOpt.get();

                if (!(netComUser instanceof com.dgsi.maintenance.entity.Prestataire) ||
                    !(softLinkUser instanceof com.dgsi.maintenance.entity.Prestataire)) {
                    logger.warning("Users found are not Prestataire instances");
                    return;
                }

                var netCom = (com.dgsi.maintenance.entity.Prestataire) netComUser;
                var softLink = (com.dgsi.maintenance.entity.Prestataire) softLinkUser;
                
                logger.info("Found NetCom: " + netCom.getId() + " and SoftLink: " + softLink.getId());
                
                // Update CT-001-2025 to link to NetCom
                var contrat1Opt = contratRepository.findByIdContrat("CT-001-2025");
                if (contrat1Opt.isPresent()) {
                    var contrat1 = contrat1Opt.get();
                    contrat1.setPrestataire(netCom);
                    contratRepository.save(contrat1);
                    logger.info("Updated CT-001-2025 to link to NetCom");
                }
                
                // Update CT-002-2025 to link to SoftLink
                var contrat2Opt = contratRepository.findByIdContrat("CT-002-2025");
                if (contrat2Opt.isPresent()) {
                    var contrat2 = contrat2Opt.get();
                    contrat2.setPrestataire(softLink);
                    contratRepository.save(contrat2);
                    logger.info("Updated CT-002-2025 to link to SoftLink");
                }
                
                logger.info("Contract-prestataire relationships fixed successfully!");
            } else {
                logger.warning("Could not find NetCom or SoftLink prestataires");
            }
            
        } catch (Exception e) {
            logger.severe("Error fixing contract relationships: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

package com.dgsi.maintenance.config;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.Prestataire;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class ContratDataInitializer implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(ContratDataInitializer.class.getName());

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Créer les données d'exemple seulement si aucun contrat n'existe
        logger.info("Initializing Contrat data...");
        if (contratRepository.count() == 0) {
            logger.info("No contracts found, creating sample data...");
            recreateAllContracts();
        } else {
            logger.info("Contracts already exist, skipping sample data creation");
        }
        logger.info("Contrat data initialized");
    }

    private void recreateAllContracts() {
        try {
            logger.info("=== DÉBUT DE LA RECRÉATION DES CONTRATS ===");

            // Supprimer tous les contrats existants
            contratRepository.deleteAll();
            logger.info("Tous les contrats existants ont été supprimés");

            // Créer des prestataires d'exemple s'ils n'existent pas
            List<Prestataire> prestataires = createSamplePrestataires();

            // Créer des contrats associés aux prestataires
            createSampleContrats(prestataires);

            logger.info("=== FIN DE LA RECRÉATION DES CONTRATS ===");
            logger.info("Sample contracts and prestataires recreated successfully!");

        } catch (Exception e) {
            logger.severe("ERREUR CRITIQUE lors de la recréation des contrats: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void initializeSampleData() {
        // Créer des prestataires d'exemple s'ils n'existent pas
        List<Prestataire> prestataires = createSamplePrestataires();

        // Créer des contrats associés aux prestataires
        createSampleContrats(prestataires);

        logger.info("Sample contracts and prestataires initialized successfully!");
    }

    @SuppressWarnings("null")
    private List<Prestataire> createSamplePrestataires() {
        List<Prestataire> prestataires = Arrays.asList(
            createPrestataire("TechServe SARL", "techserve@gmail.com", "TechServe SARL", "Maintenance informatique spécialisée"),
            createPrestataire("NetCom Afrique", "netcom@gmail.com", "NetCom Afrique", "Services réseau et télécommunications"),
            createPrestataire("IT Solutions Burkina", "itsolutions@gmail.com", "IT Solutions Burkina", "Solutions informatiques intégrées"),
            createPrestataire("SoftLink Technologies", "softlink@gmail.com", "SoftLink Technologies", "Développement logiciel et maintenance"),
            createPrestataire("InfoTech Burkina", "infotech@gmail.com", "InfoTech Burkina", "Technologies de l'information"),
            createPrestataire("Digital Solutions", "digitalsolutions@gmail.com", "Digital Solutions", "Solutions numériques"),
            createPrestataire("CyberTech SARL", "cybertech@gmail.com", "CyberTech SARL", "Sécurité informatique"),
            createPrestataire("TechPro Services", "techpro@gmail.com", "TechPro Services", "Services techniques professionnels")
        );

        userRepository.saveAll(prestataires);
        return prestataires;
    }

    private Prestataire createPrestataire(String nom, String email, String nomEntreprise, String specialite) {
        // Vérifier si le prestataire existe déjà
        if (userRepository.findByEmail(email).isPresent()) {
            logger.info("Prestataire already exists: " + email);
            return (Prestataire) userRepository.findByEmail(email).get();
        }

        logger.info("Creating new prestataire: " + email);
        Prestataire prestataire = new Prestataire();
        prestataire.setNom(nom);
        prestataire.setEmail(email);
        // Use PasswordEncoder if available, otherwise store plain (for dev only)
        if (passwordEncoder != null) {
            prestataire.setPassword(passwordEncoder.encode("prestataire123"));
        } else {
            prestataire.setPassword("prestataire123");
        }
        prestataire.setContact(String.valueOf(22600000000L + (long)(Math.random() * 99999999))); // Numéro aléatoire
        prestataire.setAdresse("Ouagadougou, Burkina Faso");
        prestataire.setQualification(specialite);
        prestataire.setStructure(nomEntreprise); // Set structure to company name
        prestataire.setDirection("Direction Technique"); // Default direction
        logger.info("Set structure: " + nomEntreprise + " and direction: Direction Technique for " + email);

        return prestataire;
    }

    @SuppressWarnings("null")
    private void createSampleContrats(List<Prestataire> prestataires) {
        // Contrats d'exemple
        Contrat[] contrats = {
            createContrat("CT-001-2025", LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31),
                          prestataires.get(0), 2500000.0, "Lot 9", "Ouagadougou"),
            createContrat("CT-002-2025", LocalDate.of(2025, 2, 1), LocalDate.of(2025, 7, 31),
                          prestataires.get(1), 1800000.0, "Lot 6", "Bobo-Dioulasso"),
            createContrat("CT-003-2025", LocalDate.of(2025, 3, 1), LocalDate.of(2025, 8, 31),
                          prestataires.get(2), 3200000.0, "Lot 9", "Ouagadougou"),
            createContrat("CT-004-2025", LocalDate.of(2025, 4, 1), LocalDate.of(2025, 9, 30),
                          prestataires.get(3), 4500000.0, "Lot 5", "Koudougou"),
            createContrat("CT-005-2025", LocalDate.of(2025, 5, 1), LocalDate.of(2025, 10, 31),
                          prestataires.get(6), 2800000.0, "Lot 9", "Ouagadougou"),
            createContrat("CT-006-2025", LocalDate.of(2025, 6, 1), LocalDate.of(2025, 11, 30),
                          prestataires.get(4), 1500000.0, "Lot 3", "Banfora"),
            createContrat("CT-007-2025", LocalDate.of(2025, 7, 1), LocalDate.of(2025, 12, 31),
                          prestataires.get(5), 2200000.0, "Lot 9", "Ouagadougou"),
            createContrat("CT-008-2025", LocalDate.of(2025, 8, 1), LocalDate.of(2026, 1, 31),
                          prestataires.get(7), 3800000.0, "Lot 4", "Dédougou")
        };

        java.util.List<Contrat> contratsList = Arrays.asList(contrats);
        contratRepository.saveAll(contratsList);
        for (Contrat contrat : contrats) {
            logger.info("Created contract: " + contrat.getIdContrat() + " for prestataire: " + contrat.getPrestataire().getNom());
        }
    }

    private Contrat createContrat(String idContrat, LocalDate dateDebut, LocalDate dateFin,
                                  Prestataire prestataire, Double montant, String lot, String ville) {
        Contrat contrat = new Contrat();
        contrat.setIdContrat(idContrat);
        contrat.setDateDebut(dateDebut);
        contrat.setDateFin(dateFin);
        contrat.setNomPrestataire(prestataire.getNom());
        contrat.setMontant(montant);
        contrat.setLot(lot);
        contrat.setVille(ville);
        contrat.setTypeContrat("Maintenance");
        contrat.setPrestataire(prestataire);

        return contrat;
    }
}

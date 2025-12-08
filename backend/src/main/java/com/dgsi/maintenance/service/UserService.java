package com.dgsi.maintenance.service;

import java.util.List;
import java.util.logging.Logger;
import com.dgsi.maintenance.dto.RegisterRequest;
import com.dgsi.maintenance.entity.User;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final Logger logger = Logger.getLogger(UserService.class.getName());

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User createUser(RegisterRequest registerRequest) {
        User user;
        String role = registerRequest.getRole();

        // Create appropriate subclass based on role
        switch (role) {
            case "PRESTATAIRE":
                user = new com.dgsi.maintenance.entity.Prestataire();
                break;
            case "ADMINISTRATEUR":
                user = new com.dgsi.maintenance.entity.Administrator();
                break;
            case "AGENT_DGSI":
                user = new com.dgsi.maintenance.entity.AgentDGSI();
                break;
            default:
                throw new IllegalArgumentException("Unknown role: " + role);
        }

        user.setNom(registerRequest.getNom());
        user.setEmail(registerRequest.getEmail());

        // Avec Keycloak, les mots de passe sont gérés par Keycloak
        if (passwordEncoder != null) {
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        } else {
            // Pour Keycloak, on peut stocker le mot de passe en clair ou le laisser null
            user.setPassword(registerRequest.getPassword());
        }

        user.setContact(registerRequest.getContact());
        user.setAdresse(registerRequest.getAdresse());
        user.setRole(role);

        // Handle role-specific fields
        if (user instanceof com.dgsi.maintenance.entity.Prestataire) {
            com.dgsi.maintenance.entity.Prestataire prestataire = (com.dgsi.maintenance.entity.Prestataire) user;
            prestataire.setQualification(registerRequest.getQualification());
        } else if (user instanceof com.dgsi.maintenance.entity.Administrator) {
            com.dgsi.maintenance.entity.Administrator admin = (com.dgsi.maintenance.entity.Administrator) user;
            admin.setPoste(registerRequest.getPoste());
        } else if (user instanceof com.dgsi.maintenance.entity.AgentDGSI) {
            com.dgsi.maintenance.entity.AgentDGSI agent = (com.dgsi.maintenance.entity.AgentDGSI) user;
            agent.setStructure(registerRequest.getStructure());
        }

        return userRepository.save(user);
    }

    @Transactional
    public int fixUserData() {
        logger.info("=== DÉBUT DE LA MISE À JOUR DES UTILISATEURS ===");
        List<User> allUsers = userRepository.findAll();
        logger.info("Nombre total d'utilisateurs trouvés : " + allUsers.size());

        int updated = 0;

        for (User user : allUsers) {
            boolean needsUpdate = false;

            // Handle prestataire-specific fields
            if (user instanceof com.dgsi.maintenance.entity.Prestataire) {
                com.dgsi.maintenance.entity.Prestataire prestataire = (com.dgsi.maintenance.entity.Prestataire) user;

                // Set qualification if null or empty
                if (prestataire.getQualification() == null || prestataire.getQualification().trim().isEmpty()) {
                    prestataire.setQualification("Technicien Informatique");
                    needsUpdate = true;
                    logger.info("Mise à jour de la qualification pour " + prestataire.getEmail() + " : Technicien Informatique");
                }

                // Set structure if null or empty
                if (prestataire.getStructure() == null || prestataire.getStructure().trim().isEmpty()) {
                    prestataire.setStructure("Direction Générale du Budget");
                    needsUpdate = true;
                    logger.info("Mise à jour de la structure pour " + prestataire.getEmail() + " : Direction Générale du Budget");
                }

                // Set direction if null or empty
                if (prestataire.getDirection() == null || prestataire.getDirection().trim().isEmpty()) {
                    prestataire.setDirection("Direction du Matériel et de la Documentation Informatique");
                    needsUpdate = true;
                    logger.info("Mise à jour de la direction pour " + prestataire.getEmail() + " : Direction du Matériel et de la Documentation Informatique");
                }
            }

            // Set default contact if null or empty for all users
            if (user.getContact() == null || user.getContact().trim().isEmpty()) {
                user.setContact("22500000000");
                needsUpdate = true;
                logger.info("Mise à jour du contact pour " + user.getEmail() + " : 22500000000");
            }

            // Set default address if null or empty for all users
            if (user.getAdresse() == null || user.getAdresse().trim().isEmpty()) {
                user.setAdresse("Ouagadougou, Burkina Faso");
                needsUpdate = true;
                logger.info("Mise à jour de l'adresse pour " + user.getEmail() + " : Ouagadougou, Burkina Faso");
            }

            if (needsUpdate) {
                try {
                    userRepository.save(user);
                    updated++;
                    logger.info("Utilisateur mis à jour avec succès : " + user.getEmail());
                } catch (Exception e) {
                    logger.severe("Erreur lors de la mise à jour de l'utilisateur " + user.getEmail() + ": " + e.getMessage());
                }
            }
        }

        logger.info("=== FIN DE LA MISE À JOUR ===");
        logger.info("Nombre total d'utilisateurs mis à jour : " + updated);

        return updated;
    }
}
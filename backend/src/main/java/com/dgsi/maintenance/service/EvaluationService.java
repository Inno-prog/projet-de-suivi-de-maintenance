package com.dgsi.maintenance.service;

import com.dgsi.maintenance.entity.EvaluationTrimestrielle;
import com.dgsi.maintenance.entity.Prestataire;
import com.dgsi.maintenance.repository.EvaluationTrimestrielleRepository;
import com.dgsi.maintenance.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class EvaluationService {

    private static final Logger logger = LoggerFactory.getLogger(EvaluationService.class);

    @Autowired
    private EvaluationTrimestrielleRepository evaluationRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserRepository userRepository;

    public List<EvaluationTrimestrielle> getAllEvaluations() {
        return evaluationRepository.findAll();
    }

    public Optional<EvaluationTrimestrielle> getEvaluationById(Long id) {
        return evaluationRepository.findById(id);
    }

    @Transactional
    public EvaluationTrimestrielle saveEvaluation(EvaluationTrimestrielle evaluation) {
        try {
            logger.info("Sauvegarde de l'évaluation pour le prestataire: {}", evaluation.getPrestataireNom());
            logger.info("Trimestre: {}, Lot: {}", evaluation.getTrimestre(), evaluation.getLot());
            
            // Définir le statut par défaut si non spécifié
            if (evaluation.getStatut() == null || evaluation.getStatut().isEmpty()) {
                evaluation.setStatut("BROUILLON");
            }
            
            EvaluationTrimestrielle saved = evaluationRepository.save(evaluation);
            logger.info("Évaluation sauvegardée avec succès. ID: {}", saved.getId());
            
            return saved;
            
        } catch (Exception e) {
            logger.error("Erreur lors de la sauvegarde de l'évaluation: ", e);
            throw new RuntimeException("Erreur lors de la sauvegarde de l'évaluation: " + e.getMessage(), e);
        }
    }

    public void deleteEvaluation(Long id) {
        evaluationRepository.deleteById(id);
    }

    public List<EvaluationTrimestrielle> getEvaluationsByPrestataire() {
        // Cette méthode sera implémentée pour filtrer par prestataire connecté
        // Pour l'instant, retourne toutes les évaluations
        return evaluationRepository.findAll();
    }
    
    public List<EvaluationTrimestrielle> getEvaluationsByPrestataireNom(String prestataireNom) {
        return evaluationRepository.findByPrestataireNom(prestataireNom);
    }

    /**
     * Récupère le nom du prestataire à partir de son username (email ou ID)
     * Utilise le UserRepository pour trouver le prestataire correspondant
     */
    public String getPrestataireNomFromUsername(String username) {
        logger.info("Recherche du nom prestataire pour username: {}", username);
        
        if (username == null || username.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Essayer de trouver par email d'abord (le username est souvent un email)
            Optional<com.dgsi.maintenance.entity.User> userOpt = userRepository.findByEmail(username);
            
            if (userOpt.isEmpty()) {
                // Essayer par ID
                userOpt = userRepository.findById(username);
            }
            
            if (userOpt.isEmpty()) {
                // Essayer par nom
                userOpt = userRepository.findByNom(username);
            }
            
            if (userOpt.isPresent()) {
                com.dgsi.maintenance.entity.User user = userOpt.get();
                if (user instanceof Prestataire) {
                    String nom = user.getNom();
                    logger.info("Prestataire trouvé: {}", nom);
                    return nom;
                } else {
                    // Pour les non-prestataires, retourner le nom
                    String nom = user.getNom();
                    logger.info("Utilisateur (non-prestataire) trouvé: {}", nom);
                    return nom;
                }
            }
            
            logger.warn("Aucun utilisateur trouvé pour username: {}", username);
            return null;
            
        } catch (Exception e) {
            logger.error("Erreur lors de la recherche du prestataire pour {}: {}", username, e.getMessage());
            return null;
        }
    }

    public List<EvaluationTrimestrielle> getEvaluationsByStatut(String statut) {
        return evaluationRepository.findByStatut(statut);
    }


    
    /**
     * Envoie un email de notification à un prestataire concernant son évaluation
     */
    public void sendEvaluationEmail(EvaluationTrimestrielle evaluation) {
        logger.info("📧 Envoi d'email d'évaluation au prestataire: {}", evaluation.getPrestataireNom());
        
        try {
            String subject = String.format("Évaluation trimestrielle - %s - %s - %s", 
                evaluation.getPrestataireNom(), 
                evaluation.getTrimestre(), 
                evaluation.getLot());
                
            String message = String.format(
                "Bonjour %s,\n\n" +
                "Votre évaluation trimestrielle pour le %s (Lot: %s) est disponible.\n\n" +
                "Détails de l'évaluation:\n" +
                "- Note finale: %.0f%%\n" +
                "- Pénalités calculées: %.0f FCFA\n" +
                "- Statut: %s\n\n" +
                "Cordialement,\n" +
                "L'équipe DGSI",
                evaluation.getPrestataireNom(),
                evaluation.getTrimestre(),
                evaluation.getLot(),
                evaluation.getNoteFinale() != null ? evaluation.getNoteFinale().doubleValue() : 0,
                evaluation.getPenalitesCalcul() != null ? evaluation.getPenalitesCalcul().doubleValue() : 0,
                evaluation.getStatut() != null ? evaluation.getStatut() : "Brouillon"
            );
            
            notificationService.envoyerNotificationEvaluationTerminee(evaluation.getPrestataireNom(), 
                evaluation.getNoteFinale() != null && evaluation.getNoteFinale().compareTo(new BigDecimal("25")) < 0 ? "DECLASSER" : "VALIDER");
                
            logger.info("✅ Email d'évaluation envoyé avec succès à: {}", evaluation.getPrestataireNom());
            
        } catch (Exception e) {
            logger.error("❌ Erreur lors de l'envoi de l'email d'évaluation à {}: {}", 
                evaluation.getPrestataireNom(), e.getMessage());
        }
    }
}

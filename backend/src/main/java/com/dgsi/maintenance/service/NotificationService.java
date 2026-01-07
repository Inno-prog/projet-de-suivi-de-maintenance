package com.dgsi.maintenance.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import com.dgsi.maintenance.entity.Notification;
import com.dgsi.maintenance.entity.User;
import com.dgsi.maintenance.repository.NotificationRepository;
import com.dgsi.maintenance.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // Map destinataire -> list of emitters (thread-safe)
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final Logger log = LoggerFactory.getLogger(NotificationService.class);

    // JavaMailSender is optional. If SMTP is configured in application.properties, emails will be sent.
    @Autowired(required = false)
    private JavaMailSender mailSender;

    private void sendEmailIfPossible(String to, String subject, String text) {
        try {
            if (mailSender == null) {
                log.debug("Mail sender not configured - skipping email to {}", to);
                return;
            }
            if (to == null || to.trim().isEmpty()) {
                log.debug("No recipient email provided - skipping email (subject={})", subject);
                return;
            }
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject != null ? subject : "Notification");
            msg.setText(text != null ? text : "");
            // From will be taken from spring.mail.username if configured
            mailSender.send(msg);
            log.debug("Email sent to {} (subject={})", to, subject);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void envoyerNotificationPrestationTerminee(String prestataire, Long prestationId, String nomItem) {
        // Trouver l'utilisateur par nom pour obtenir l'email
        Optional<User> userOpt = userRepository.findByNom(prestataire);
        if (userOpt.isPresent()) {
            Notification notification = new Notification();
            notification.setDestinataire(userOpt.get().getEmail());
            notification.setTitre("Prestation terminée - Rapport requis");
            notification.setMessage(String.format(
                "Votre prestation '%s' est terminée. Veuillez soumettre votre rapport trimestriel et vos fiches de prestations.",
                nomItem
            ));
            notification.setType("WARNING");
            notification.setPrestationId(prestationId);

            notificationRepository.save(notification);
            // push realtime
            sendEventToDestinataire(notification.getDestinataire(), notification);
            // Send email if mail sender configured
            sendEmailIfPossible(notification.getDestinataire(), notification.getTitre(), notification.getMessage());
        }
    }

    public void envoyerNotificationEvaluationTerminee(String prestataire, String resultat) {
        // Trouver l'utilisateur par nom pour obtenir l'email
        Optional<User> userOpt = userRepository.findByNom(prestataire);
        if (userOpt.isPresent()) {
            Notification notification = new Notification();
            notification.setDestinataire(userOpt.get().getEmail());
            notification.setTitre("Évaluation terminée");
            notification.setMessage(String.format("Votre évaluation est terminée. Résultat: %s", resultat));
            notification.setType(resultat != null && resultat.equals("DECLASSER") ? "ERROR" : "SUCCESS");

            notificationRepository.save(notification);
            sendEventToDestinataire(notification.getDestinataire(), notification);
            sendEmailIfPossible(notification.getDestinataire(), notification.getTitre(), notification.getMessage());
        }
    }

    public List<Notification> getNotificationsByDestinataire(String destinataire) {
        return notificationRepository.findByDestinataireOrderByDateCreationDesc(destinataire);
    }

    public void marquerCommeLu(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setLu(true);
            notificationRepository.save(notification);
        });
    }

    public void envoyerNotificationLimitAtteint(String prestataire, String nomItem) {
        // Trouver l'utilisateur par nom pour obtenir l'email
        Optional<User> userOpt = userRepository.findByNom(prestataire);
        if (userOpt.isPresent()) {
            Notification notification = new Notification();
            notification.setDestinataire(userOpt.get().getEmail());
            notification.setTitre("Limite de prestations atteinte");
            notification.setMessage(String.format("Le nombre limite de prestations pour l'item '%s' est atteint.", nomItem));
            notification.setType("ERROR");

            notificationRepository.save(notification);
            sendEventToDestinataire(notification.getDestinataire(), notification);
            sendEmailIfPossible(notification.getDestinataire(), notification.getTitre(), notification.getMessage());
        }
    }

    /**
     * Notifie les administrateurs qu'un prestataire a soumis une fiche
     */
    public void envoyerNotificationFicheSoumise(String prestataire, String idPrestation, String nomItem) {
        log.info("📧 Envoi notification fiche soumise - Prestataire: {}, ID: {}, Item: {}", prestataire, idPrestation, nomItem);
        
        // Notifier tous les administrateurs
        List<User> admins = userRepository.findByRole("ADMINISTRATEUR");
        log.info("📧 Nombre d'administrateurs trouvés: {}", admins.size());
        
        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setDestinataire(admin.getEmail());
            notification.setTitre("Nouvelle fiche de prestation soumise");
            notification.setMessage(String.format(
                "Le prestataire '%s' a soumis une nouvelle fiche de prestation (ID: %s) pour l'item '%s'. Veuillez la traiter.",
                prestataire, idPrestation, nomItem != null ? nomItem : "N/A"
            ));
            notification.setType("INFO");

            notificationRepository.save(notification);
            log.info("📧 Notification sauvegardée pour admin: {}", admin.getEmail());
            
            // push realtime to admin if connected
            sendEventToDestinataire(notification.getDestinataire(), notification);
            // send email to admin if configured
            sendEmailIfPossible(notification.getDestinataire(), notification.getTitre(), notification.getMessage());
        }
        
        log.info("✅ Notifications fiche soumise envoyées à {} administrateurs", admins.size());
    }

    /**
     * Notifie le prestataire que sa fiche a été validée
     */
    public void envoyerNotificationFicheValidee(String prestataire, String idPrestation) {
        log.info("📧 Envoi notification fiche validée - Prestataire: {}, ID: {}", prestataire, idPrestation);
        
        // Trouver l'utilisateur prestataire par nom pour obtenir l'email
        Optional<User> userOpt = userRepository.findByNom(prestataire);
        if (userOpt.isPresent()) {
            Notification notification = new Notification();
            notification.setDestinataire(userOpt.get().getEmail());
            notification.setTitre("Fiche de prestation validée");
            notification.setMessage(String.format("Votre fiche de prestation (ID: %s) a été validée par l'administrateur.", idPrestation));
            notification.setType("SUCCESS");

            notificationRepository.save(notification);
            log.info("📧 Notification validation sauvegardée pour: {}", userOpt.get().getEmail());
            
            sendEventToDestinataire(notification.getDestinataire(), notification);
            sendEmailIfPossible(notification.getDestinataire(), notification.getTitre(), notification.getMessage());
            
            log.info("✅ Notification fiche validée envoyée à: {}", userOpt.get().getEmail());
        } else {
            log.warn("⚠️ Prestataire non trouvé pour notification validation: {}", prestataire);
        }
    }

    /**
     * Notifie le prestataire que sa fiche a été rejetée
     */
    public void envoyerNotificationFicheRejetee(String prestataire, String idPrestation, String commentaires) {
        log.info("📧 Envoi notification fiche rejetée - Prestataire: {}, ID: {}", prestataire, idPrestation);
        
        // Trouver l'utilisateur prestataire par nom pour obtenir l'email
        Optional<User> userOpt = userRepository.findByNom(prestataire);
        if (userOpt.isPresent()) {
            Notification notification = new Notification();
            notification.setDestinataire(userOpt.get().getEmail());
            notification.setTitre("Fiche de prestation rejetée");
            String message = String.format("Votre fiche de prestation (ID: %s) a été rejetée par l'administrateur.", idPrestation);
            if (commentaires != null && !commentaires.trim().isEmpty()) {
                message += " Commentaires: " + commentaires;
            }
            notification.setMessage(message);
            notification.setType("ERROR");

            notificationRepository.save(notification);
            log.info("📧 Notification rejet sauvegardée pour: {}", userOpt.get().getEmail());
            
            sendEventToDestinataire(notification.getDestinataire(), notification);
            sendEmailIfPossible(notification.getDestinataire(), notification.getTitre(), notification.getMessage());
            
            log.info("✅ Notification fiche rejetée envoyée à: {}", userOpt.get().getEmail());
        } else {
            log.warn("⚠️ Prestataire non trouvé pour notification rejet: {}", prestataire);
        }
    }

    /**
     * Notifie les administrateurs de la création d'un nouvel ordre de commande
     */
    public void envoyerNotificationOrdreCommandeCree(String prestataire, String trimestre, String numeroCommande, int nombrePrestations) {
        // Notifier tous les administrateurs
        List<User> admins = userRepository.findByRole("ADMINISTRATEUR");
        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setDestinataire(admin.getEmail());
            notification.setTitre("Nouvel ordre de commande initialisé");
            notification.setMessage(String.format(
                "Un nouvel ordre de commande a été initialisé pour le prestataire '%s' pour le trimestre '%s' (N°: %s). Nombre de prestations: %d.",
                prestataire, trimestre, numeroCommande, nombrePrestations
            ));
            notification.setType("INFO");

            notificationRepository.save(notification);
            // push realtime to admin if connected
            sendEventToDestinataire(notification.getDestinataire(), notification);
            sendEmailIfPossible(notification.getDestinataire(), notification.getTitre(), notification.getMessage());
        }
    }

    /**
     * Notifie les administrateurs de la création d'une prestation et mise à jour d'ordre
     */
    public void envoyerNotificationPrestationAjouteeOrdre(String prestataire, String trimestre, String numeroCommande, int totalPrestations) {
        // Notifier tous les administrateurs
        List<User> admins = userRepository.findByRole("ADMINISTRATEUR");
        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setDestinataire(admin.getEmail());
            notification.setTitre("Prestation ajoutée à l'ordre de commande");
            notification.setMessage(String.format(
                "Une nouvelle prestation a été ajoutée à l'ordre '%s' du prestataire '%s' pour le trimestre '%s'. Total prestations: %d.",
                numeroCommande, prestataire, trimestre, totalPrestations
            ));
            notification.setType("INFO");

            notificationRepository.save(notification);
            // push realtime to admin if connected
            sendEventToDestinataire(notification.getDestinataire(), notification);
            sendEmailIfPossible(notification.getDestinataire(), notification.getTitre(), notification.getMessage());
        }
    }

    /**
     * Subscribe to realtime notifications for a given destinataire (email).
     */
    public SseEmitter subscribe(String destinataire) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        emitters.computeIfAbsent(destinataire, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(destinataire, emitter));
        emitter.onTimeout(() -> removeEmitter(destinataire, emitter));
        emitter.onError((ex) -> removeEmitter(destinataire, emitter));

        // Send initial payload: recent notifications so the client has persisted ones
        try {
            List<Notification> recent = notificationRepository.findByDestinataireOrderByDateCreationDesc(destinataire);
            emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event()
                    .name("initial_notifications")
                    .data(recent));
        } catch (IOException e) {
            // ignore send failure for initial batch
        }

        return emitter;
    }

    private void removeEmitter(String destinataire, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(destinataire);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) emitters.remove(destinataire);
        }
    }

    private void sendEventToDestinataire(String destinataire, Notification notification) {
        List<SseEmitter> list = emitters.get(destinataire);
        if (list == null || list.isEmpty()) return;

        for (SseEmitter emitter : new CopyOnWriteArrayList<>(list)) {
            try {
                // send as default (unnamed) SSE event so EventSource.onmessage receives it
                emitter.send(notification);
                log.debug("Sent SSE notification to {} (id={})", destinataire, notification.getId());
            } catch (IOException | IllegalStateException e) {
                log.warn("Failed to send SSE to {}: {}", destinataire, e.getMessage());
                // remove failed emitter
                removeEmitter(destinataire, emitter);
            }
        }
    }

    /**
     * Envoie une notification personnalisée à un destinataire
     */
    public void envoyerNotificationPersonnalisee(String destinataire, String titre, String message) {
        try {
            log.info("📧 Envoi notification personnalisée à: {} - Titre: {}", destinataire, titre);

            Notification notification = new Notification();
            notification.setDestinataire(destinataire);
            notification.setTitre(titre);
            notification.setMessage(message);
            notification.setType("WARNING"); // Type par défaut pour les notifications de budget

            notificationRepository.save(notification);
            sendEventToDestinataire(destinataire, notification);
            // send email as well if configured
            sendEmailIfPossible(destinataire, titre, message);

            log.info("✅ Notification personnalisée envoyée avec succès à: {}", destinataire);
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de la notification personnalisée à {}: {}", destinataire, e.getMessage());
        }
    }
}

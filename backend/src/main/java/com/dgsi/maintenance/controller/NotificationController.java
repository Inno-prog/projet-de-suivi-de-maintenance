package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.entity.Notification;
import com.dgsi.maintenance.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{destinataire}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public List<Notification> getNotifications(@PathVariable String destinataire) {
        return notificationService.getNotificationsByDestinataire(destinataire);
    }

    @GetMapping("/stream/{destinataire}")
    // For development convenience the stream endpoint is open; in production consider securing it
    public SseEmitter streamNotifications(@PathVariable String destinataire) {
        return notificationService.subscribe(destinataire);
    }

    @PutMapping("/{id}/marquer-lu")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<?> marquerCommeLu(@PathVariable Long id) {
        notificationService.marquerCommeLu(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/prestation-terminee")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> notifierPrestationTerminee(
            @RequestParam String prestataire,
            @RequestParam Long prestationId,
            @RequestParam String nomItem) {
        
        notificationService.envoyerNotificationPrestationTerminee(prestataire, prestationId, nomItem);
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint de test pour vérifier le système de notifications
     * Permet de tester l'envoi de notifications aux administrateurs
     */
    @PostMapping("/test-admin-notification")
    public ResponseEntity<?> testAdminNotification() {
        try {
            // Envoyer une notification de test aux administrateurs
            notificationService.envoyerNotificationFicheSoumise(
                "Prestataire Test",
                "TEST-001",
                "Item de test"
            );
            return ResponseEntity.ok("Notification de test envoyée aux administrateurs. Vérifiez les logs.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Erreur lors de l'envoi de la notification de test: " + e.getMessage());
        }
    }

    /**
     * Endpoint pour vérifier le nombre d'administrateurs dans le système
     */
    @GetMapping("/admin-count")
    public ResponseEntity<?> getAdminCount() {
        try {
            return ResponseEntity.ok("Endpoint de vérification - consultez les logs du backend");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Endpoint pour envoyer des notifications pour toutes les prestations en attente
     * Utile pour corriger les prestations qui n'ont pas déclenché de notification
     */
    @PostMapping("/notify-pending-prestations")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> notifyPendingPrestations() {
        try {
            int count = notificationService.envoyerNotificationsPrestationsEnAttente();
            return ResponseEntity.ok("Notifications envoyées pour " + count + " prestations en attente");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Erreur: " + e.getMessage());
        }
    }
}

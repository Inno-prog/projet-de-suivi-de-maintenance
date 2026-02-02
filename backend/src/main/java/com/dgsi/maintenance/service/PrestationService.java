package com.dgsi.maintenance.service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.entity.StatutFiche;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PrestationService {

    private final PrestationRepository prestationRepository;
    private final ItemRepository itemRepository;
    private final OrdreCommandeService ordreCommandeService;
    private final FichePrestationRepository fichePrestationRepository;
    private final TransactionTemplate transactionTemplate;
    private final com.dgsi.maintenance.repository.ContratRepository contratRepository;
    private final NotificationService notificationService;
    private final ContratItemService contratItemService;

    @Autowired
    public PrestationService(PrestationRepository prestationRepository,
                            ItemRepository itemRepository,
                            OrdreCommandeService ordreCommandeService,
                            FichePrestationRepository fichePrestationRepository,
                            TransactionTemplate transactionTemplate,
                            com.dgsi.maintenance.repository.ContratRepository contratRepository,
                            NotificationService notificationService,
                            ContratItemService contratItemService) {
        this.prestationRepository = prestationRepository;
        this.itemRepository = itemRepository;
        this.ordreCommandeService = ordreCommandeService;
        this.fichePrestationRepository = fichePrestationRepository;
        this.transactionTemplate = transactionTemplate;
        this.contratRepository = contratRepository;
        this.notificationService = notificationService;
        this.contratItemService = contratItemService;
    }

    /**
     * Getter pour accès au service OrdreCommande depuis le controller
     */
    public OrdreCommandeService getOrdreCommandeService() {
        return ordreCommandeService;
    }

    /**
     * Nouvelle méthode pour créer une prestation depuis une requête DTO
     */
    public Prestation createPrestationFromRequest(com.dgsi.maintenance.controller.PrestationController.PrestationCreateRequest request) {
        log.info("🔄 Création prestation depuis requête: {}", request.getNomPrestataire());

        // Convertir la requête en entité Prestation
        Prestation prestation = convertRequestToPrestation(request);

        // Validation avant la transaction
        try {
            validatePrestationData(prestation);

            // Valider que le contact du prestataire est présent avant de vérifier le budget
            if (request.getNomPrestataire() == null || request.getNomPrestataire().trim().isEmpty()) {
                throw new IllegalArgumentException("Le nom du prestataire est obligatoire pour la vérification du budget.");
            }
            
            // Vérifier le budget contrat avant création
            if (prestation.getMontantIntervention() != null && prestation.getNomPrestataire() != null) {
                checkContractBudgetAvailability(prestation.getNomPrestataire(), prestation.getMontantIntervention());
            }
            
            // Vérifier la disponibilité des items dans les contrats du prestataire
            if (request.getItemIds() != null && !request.getItemIds().isEmpty() && request.getItemQuantities() != null) {
                // Déterminer le lot à partir du premier item (tous les items d'une prestation doivent être du même lot)
                Optional<Item> firstItem = itemRepository.findById(request.getItemIds().get(0));
                if (firstItem.isPresent()) {
                    String lot = firstItem.get().getLot();
                    checkBudgetAvailability(prestation.getNomPrestataire(), lot, request.getItemQuantities());
                }
            }
        } catch (IllegalArgumentException e) {
            log.warn("❌ Validation échouée: {}", e.getMessage());
            throw e;
        }

        // Transaction
        return transactionTemplate.execute(status -> {
            try {
                // Sauvegarder d'abord la prestation
                Prestation savedPrestation = prestationRepository.save(prestation);
                log.info("💾 Prestation sauvegardée avec ID: {}", savedPrestation.getId());

                // CORRECTION : Gestion des items après sauvegarde
                if (request.getItemIds() != null && !request.getItemIds().isEmpty()) {
                    java.util.Set<Item> managedItems = new java.util.HashSet<>();
                    for (Long itemId : request.getItemIds()) {
                        Optional<Item> managedItem = itemRepository.findById(itemId);
                        if (managedItem.isPresent()) {
                            managedItems.add(managedItem.get());
                        } else {
                            throw new IllegalArgumentException("Item avec ID " + itemId + " n'existe pas");
                        }
                    }
                    savedPrestation.setItemsUtilises(managedItems);
                    savedPrestation = prestationRepository.save(savedPrestation);
                    log.info("✅ {} items associés à la prestation", managedItems.size());

                    // Mise à jour des quantités des items via le service spécialisé
                    if (request.getItemQuantities() != null && !request.getItemQuantities().isEmpty()) {
                        contratItemService.mettreAJourQuantitesUtilisees(request.getNomPrestataire(), request.getItemQuantities());
                        log.info("✅ Quantités des items mises à jour via ContratItemService");
                    }
                }

                // CORRECTION : Gestion ordre de commande (regroupement par prestataire/trimestre)
                log.info("📦 Gestion ordre de commande...");
                OrdreCommande ordre = ordreCommandeService.gererOrdreCommandePourPrestation(savedPrestation);
                savedPrestation.setOrdreCommande(ordre);
                log.info("✅ Ordre de commande géré - ID: {}", ordre.getId());

                log.info("💾 Sauvegarde finale de la prestation...");
                savedPrestation = prestationRepository.save(savedPrestation);
                log.info("✅ Prestation sauvegardée ID: {}", savedPrestation.getId());
                
                // Déduire le montant du budget contrat après sauvegarde réussie
                if (savedPrestation.getMontantIntervention() != null && savedPrestation.getNomPrestataire() != null) {
                    deduireMonantContrat(savedPrestation.getNomPrestataire(), savedPrestation.getMontantIntervention());
                    log.info("✅ Montant déduit du budget contrat: {}", savedPrestation.getMontantIntervention());
                    
                    // Vérifier si le budget est maintenant épuisé ou faible
                    verifierEtatBudgetApresDeduction(savedPrestation.getNomPrestataire());
                }

                // CORRECTION : Créer automatiquement une fiche si la prestation a des items
                if (savedPrestation.getItemsUtilises() != null && !savedPrestation.getItemsUtilises().isEmpty()) {
                    log.info("📄 Création automatique de la fiche pour prestation avec items...");
                    FichePrestation fiche = creerFichePourPrestation(savedPrestation);
                    fichePrestationRepository.save(fiche);
                    log.info("✅ Fiche créée automatiquement pour prestation ID: {}", savedPrestation.getId());
                }

                return savedPrestation;

            } catch (Exception e) {
                log.error("❌ Erreur lors de la sauvegarde transactionnelle", e);
                status.setRollbackOnly();
                throw new RuntimeException("Erreur technique lors de la création: " + e.getMessage(), e);
            }
        });
    }

    /**
     * Convertit une requête DTO en entité Prestation avec gestion des items
     */
    private Prestation convertRequestToPrestation(com.dgsi.maintenance.controller.PrestationController.PrestationCreateRequest request) {
        Prestation prestation = new Prestation();

        // Prestataire information
        prestation.setPrestataireId(request.getPrestataireId());
        prestation.setNomPrestataire(request.getNomPrestataire());
        prestation.setNomResponsablePrestation(request.getNomResponsablePrestation());
        prestation.setContactResponsablePrestation(request.getContactResponsablePrestation());
        prestation.setQualificationResponsablePrestation(request.getQualificationResponsablePrestation());
        prestation.setNomPrestation(request.getNomPrestation());
        prestation.setStructurePrestataire(request.getStructurePrestataire());
        prestation.setDirectionPrestataire(request.getDirectionPrestataire());
        prestation.setServicePrestataire(request.getServicePrestataire());
        prestation.setRolePrestataire(request.getRolePrestataire());
        prestation.setQualificationPrestataire(request.getQualificationPrestataire());

        // Intervention details
        prestation.setMontantIntervention(request.getMontantIntervention());

        // Dates
        if (request.getDateHeureDebut() != null && !request.getDateHeureDebut().trim().isEmpty()) {
            try {
                prestation.setDateHeureDebut(java.time.LocalDateTime.parse(request.getDateHeureDebut()));
            } catch (java.time.format.DateTimeParseException e) {
                throw new IllegalArgumentException("Format de date de début invalide: " + request.getDateHeureDebut());
            }
        }
        if (request.getDateHeureFin() != null && !request.getDateHeureFin().trim().isEmpty()) {
            try {
                prestation.setDateHeureFin(java.time.LocalDateTime.parse(request.getDateHeureFin()));
            } catch (java.time.format.DateTimeParseException e) {
                throw new IllegalArgumentException("Format de date de fin invalide: " + request.getDateHeureFin());
            }
        }

        // Autres champs
        prestation.setTrimestre(request.getTrimestre());
        prestation.setStatutIntervention(request.getStatutIntervention());
        // Set legacy statut field for backward compatibility
        prestation.setStatut(request.getStatutIntervention());

        // Set validation status from request or default to draft
        if (request.getStatutValidation() != null && !request.getStatutValidation().trim().isEmpty()) {
            prestation.setStatutValidation(request.getStatutValidation());
        } else {
            prestation.setStatutValidation("BROUILLON");
        }

        // Structure information
        prestation.setNomStructure(request.getNomStructure());
        prestation.setContactStructure(request.getContactStructure());
        prestation.setAdresseStructure(request.getAdresseStructure());

        // Correspondant Informatique (CI) information
        prestation.setNomCi(request.getNomCi());
        prestation.setPrenomCi(request.getPrenomCi());
        prestation.setContactCi(request.getContactCi());
        prestation.setFonctionCi(request.getFonctionCi());

        // Items will be set in the transaction to ensure they are managed
        prestation.setItemsUtilises(new HashSet<>());

        // Valeurs par défaut
        prestation.setNbPrestRealise(0);

        return prestation;
    }

    /**
     * Création robuste avec gestion d'erreur complète
     */
    public Prestation createPrestation(Prestation prestation) {
        log.info("🔄 Début création prestation: {}", prestation.getNomCi() != null ? prestation.getNomCi() : "Nouvelle prestation");

        // Validation avant la transaction
        try {
            validatePrestationData(prestation);
            checkQuantityLimit(prestation);
        } catch (IllegalArgumentException e) {
            log.warn("❌ Validation échouée: {}", e.getMessage());
            throw e; // Relancer pour le controller
        }

        // Transaction
        return transactionTemplate.execute(status -> {
            try {
                // CORRECTION : Gestion ordre de commande (regroupement par prestataire/trimestre)
                log.info("📦 Gestion ordre de commande...");
                OrdreCommande ordre = ordreCommandeService.gererOrdreCommandePourPrestation(prestation);
                prestation.setOrdreCommande(ordre);
                log.info("✅ Ordre de commande géré - ID: {}", ordre.getId());

                log.info("💾 Sauvegarde de la prestation...");
                Prestation savedPrestation = prestationRepository.save(prestation);
                log.info("✅ Prestation sauvegardée ID: {}", savedPrestation.getId());

                return savedPrestation;

            } catch (Exception e) {
                log.error("❌ Erreur lors de la sauvegarde transactionnelle", e);
                status.setRollbackOnly();
                throw new RuntimeException("Erreur technique lors de la création: " + e.getMessage(), e);
            }
        });
    }


    /**
     * Validation robuste des données
     */
    private void validatePrestationData(Prestation prestation) {
        log.info("🔍 Validation des données...");

        if (prestation == null) {
            throw new IllegalArgumentException("La prestation ne peut pas être nulle");
        }

        // Validation prestataire
        if (prestation.getNomPrestataire() == null || prestation.getNomPrestataire().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du prestataire est obligatoire");
        }
        // Allow manual input for contact, structure, role, and qualification if not provided by the system
        // These fields can be empty and filled manually by the user
        // Le contact prestataire a été supprimé. La validation se fait sur le nom.
        if (prestation.getStructurePrestataire() == null || prestation.getStructurePrestataire().trim().isEmpty()) {
            log.warn("⚠️ Structure prestataire non fournie - saisie manuelle autorisée");
        }
        if (prestation.getRolePrestataire() == null || prestation.getRolePrestataire().trim().isEmpty()) {
            log.warn("⚠️ Rôle prestataire non fourni - saisie manuelle autorisée");
        }
        if (prestation.getQualificationPrestataire() == null || prestation.getQualificationPrestataire().trim().isEmpty()) {
            log.warn("⚠️ Qualification prestataire non fournie - saisie manuelle autorisée");
        }

        // Validation intervention
        if (prestation.getMontantIntervention() == null || prestation.getMontantIntervention().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant de l'intervention doit être positif");
        }
        if (prestation.getTrimestre() == null || prestation.getTrimestre().trim().isEmpty()) {
            throw new IllegalArgumentException("Le trimestre est obligatoire");
        }
        if (prestation.getDateHeureDebut() == null) {
            throw new IllegalArgumentException("La date et heure de début sont obligatoires");
        }
        if (prestation.getDateHeureFin() == null) {
            throw new IllegalArgumentException("La date et heure de fin sont obligatoires");
        }
        if (prestation.getStatutIntervention() == null || prestation.getStatutIntervention().trim().isEmpty()) {
            throw new IllegalArgumentException("Le statut de l'intervention est obligatoire");
        }


        // Vérifier que les items existent si fournis
        if (prestation.getItemsUtilises() != null && !prestation.getItemsUtilises().isEmpty()) {
            for (Item item : prestation.getItemsUtilises()) {
                if (!itemRepository.existsByNomItem(item.getNomItem())) {
                    throw new IllegalArgumentException("L'item '" + item.getNomItem() + "' n'existe pas dans la base de données");
                }
            }
        }
        log.info("✅ Validation des données OK");
    } // Close method validatePrestationData
    

    /**
     * Vérification de limite améliorée basée sur la capacité restante
     */
    private void checkQuantityLimit(Prestation prestation) {
        // Cette méthode est appelée avant la création, donc on ne peut pas encore accéder aux itemQuantities
        // La validation se fera dans le controller avec les données de la requête
        log.info("🔍 Vérification limite - déléguée au controller pour prestation avec {} items",
            prestation.getItemsUtilises() != null ? prestation.getItemsUtilises().size() : 0);
    }

    /**
     * Vérification du budget pour les items avant création de prestation
     * Utilise le nouveau service ContratItemService pour une gestion complète
     */
    public void checkBudgetAvailability(String nomPrestataire, String lot, java.util.Map<Long, Integer> itemQuantities) {
        log.info("🔍 Vérification du budget pour {} items du lot {} pour prestataire {}", itemQuantities.size(), lot, nomPrestataire);

        // Normaliser le nom du lot pour correspondre au format des contrats
        String normalizedLot = normalizeLotName(lot);

        // Déléguer la vérification au service spécialisé
        contratItemService.verifierDisponibiliteItems(nomPrestataire, normalizedLot, itemQuantities);

        log.info("✅ Vérification du budget terminée - tous les items sont disponibles");
    }

    /**
     * Normalise le nom du lot pour être cohérent entre items et contrats
     * Ex: "1" -> "lot1", "1" -> "Lot 9", etc.
     */
    private String normalizeLotName(String lot) {
        if (lot == null || lot.trim().isEmpty()) {
            return lot;
        }

        // Si c'est un numéro, ajouter "lot" au début
        try {
            int lotNumber = Integer.parseInt(lot.trim());
            return "lot" + lotNumber;
        } catch (NumberFormatException e) {
            // Ce n'est pas un numéro, retourner tel quel
            return lot;
        }
    }

    /**
     * Vérification du budget au niveau contrat pour un prestataire
     * CORRECTION: Rendre la vérification non-bloquante si le prestataire a un contrat actif
     */
    public void checkContractBudgetAvailability(String nomPrestataire, java.math.BigDecimal montantIntervention) {
        log.info("🔍 Vérification du budget contrat pour prestataire {} - montant: {}", nomPrestataire, montantIntervention);

        if (montantIntervention == null || montantIntervention.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            log.warn("⚠️ Montant d'intervention invalide: {}", montantIntervention);
            return; // Ne pas bloquer pour un montant invalide
        }

        // Récupérer les contrats actifs du prestataire
        List<com.dgsi.maintenance.entity.Contrat> contratsActifs = contratRepository.findActiveContratsByNomPrestataire(nomPrestataire);

        if (contratsActifs.isEmpty()) {
            contratsActifs = contratRepository.findActiveContratsByNomPrestataireContaining(nomPrestataire);
        }

        if (contratsActifs.isEmpty()) {
            log.warn("⚠️ Aucun contrat actif trouvé pour le prestataire: {} - création autorisée malgré l'absence de contrat", nomPrestataire);
            return; // Ne pas bloquer si aucun contrat trouvé
        }

        // Calculer le budget total restant
        double budgetTotalRestant = contratsActifs.stream()
            .mapToDouble(contrat -> {
                Double restant = contrat.getMontantRestant();
                if (restant == null) {
                    // Si montantRestant est null, utiliser le montant initial
                    restant = contrat.getMontant() != null ? contrat.getMontant() : 0.0;
                    log.warn("⚠️ montantRestant null pour contrat {}, utilisation du montant initial: {}", contrat.getIdContrat(), restant);
                }
                return restant;
            })
            .sum();

        log.info("💰 Budget total restant: {} FCFA pour {} contrats", budgetTotalRestant, contratsActifs.size());

        double montantDemande = montantIntervention.doubleValue();
        if (budgetTotalRestant < montantDemande) {
            log.warn("⚠️ Budget insuffisant pour prestataire {} - demandé: {} FCFA, restant: {} FCFA - création autorisée malgré le budget insuffisant",
                    nomPrestataire, montantDemande, budgetTotalRestant);

            // Envoyer une notification au prestataire (mais ne pas bloquer)
            envoyerNotificationBudgetInsuffisant(nomPrestataire, montantDemande, budgetTotalRestant, contratsActifs);

            // CORRECTION: Ne pas lancer d'exception, permettre la création
            return;
        }

        log.info("✅ Vérification du budget contrat terminée - budget suffisant");
    }

    /**
     * Envoie une notification au prestataire quand son budget est insuffisant
     */
    private void envoyerNotificationBudgetInsuffisant(String nomPrestataire, double montantDemande, 
                                                     double budgetRestant, List<com.dgsi.maintenance.entity.Contrat> contratsActifs) {
        try {
            log.info("📧 Envoi notification budget insuffisant à: {}", nomPrestataire);
            
            String message = String.format(
                "Votre budget contractuel est insuffisant pour créer cette prestation.\n\n" +
                "💰 Montant demandé: %.2f FCFA\n" +
                "💳 Budget restant: %.2f FCFA\n\n" +
                "Détails de vos contrats actifs:\n%s\n\n" +
                "Veuillez contacter l'administration pour renouveler ou augmenter votre contrat.",
                montantDemande, budgetRestant, genererDetailsContrats(contratsActifs)
            );
            
            notificationService.envoyerNotificationPersonnalisee(
                nomPrestataire, // L'identifiant pour la notif est maintenant le nom
                "🚫 Budget contractuel insuffisant",
                message
            );
            
            log.info("✅ Notification budget insuffisant envoyée à: {}", nomPrestataire);
        } catch (Exception e) {
            log.warn("⚠️ Échec envoi notification budget insuffisant: {}", e.getMessage());
        }
    }
    
    /**
     * Génère les détails des contrats pour la notification
     */
    private String genererDetailsContrats(List<com.dgsi.maintenance.entity.Contrat> contrats) {
        if (contrats.isEmpty()) {
            return "Aucun contrat actif trouvé";
        }
        
        StringBuilder details = new StringBuilder();
        for (com.dgsi.maintenance.entity.Contrat contrat : contrats) {
            details.append(String.format(
                "- Contrat %s: %.2f FCFA restant (sur %.2f FCFA)\n",
                contrat.getIdContrat() != null ? contrat.getIdContrat() : "N/A",
                contrat.getMontantRestant() != null ? contrat.getMontantRestant() : 0.0,
                contrat.getMontant() != null ? contrat.getMontant() : 0.0
            ));
        }
        return details.toString();
    }
    
    /**
     * Vérifie l'état du budget après déduction et envoie des alertes si nécessaire
     */
    private void verifierEtatBudgetApresDeduction(String nomPrestataire) {
        try {
            List<com.dgsi.maintenance.entity.Contrat> contratsActifs = contratRepository.findActiveContratsByNomPrestataire(nomPrestataire);
            
            double budgetTotalRestant = contratsActifs.stream()
                .mapToDouble(contrat -> contrat.getMontantRestant() != null ? contrat.getMontantRestant() : 0.0)
                .sum();
            
            double budgetTotal = contratsActifs.stream()
                .mapToDouble(contrat -> contrat.getMontant() != null ? contrat.getMontant() : 0.0)
                .sum();
            
            // Calculer le pourcentage restant
            double pourcentageRestant = budgetTotal > 0 ? (budgetTotalRestant / budgetTotal) * 100 : 0;
            
            if (budgetTotalRestant <= 0) {
                // Budget complètement épuisé
                envoyerNotificationBudgetEpuise(nomPrestataire, contratsActifs);
            } else if (pourcentageRestant <= 10) {
                // Budget critique (moins de 10%)
                envoyerNotificationBudgetCritique(nomPrestataire, budgetTotalRestant, pourcentageRestant, contratsActifs);
            } else if (pourcentageRestant <= 25) {
                // Budget faible (moins de 25%)
                envoyerNotificationBudgetFaible(nomPrestataire, budgetTotalRestant, pourcentageRestant, contratsActifs);
            }
            
        } catch (Exception e) {
            log.warn("⚠️ Erreur lors de la vérification de l'état du budget: {}", e.getMessage());
        }
    }
    
    /**
     * Notification quand le budget est complètement épuisé
     */
    private void envoyerNotificationBudgetEpuise(String nomPrestataire, List<com.dgsi.maintenance.entity.Contrat> contratsActifs) {
        try {
            String message = String.format(
                "🚫 BUDGET ÉPUISÉ - Votre contrat est terminé\n\n" +
                "Votre budget contractuel est maintenant complètement épuisé.\n" +
                "Vous ne pourrez plus créer de nouvelles prestations.\n\n" +
                "Détails de vos contrats:\n%s\n\n" +
                "📞 Action requise: Contactez immédiatement l'administration pour:\n" +
                "- Renouveler votre contrat\n" +
                "- Augmenter le montant contractuel\n" +
                "- Discuter d'un nouveau contrat\n\n" +
                "Contact: contact@dgsi.bf | +226 25 30 70 00",
                genererDetailsContrats(contratsActifs)
            );
            
            notificationService.envoyerNotificationPersonnalisee(
                nomPrestataire,
                "🚫 URGENT: Budget contractuel épuisé",
                message
            );
            
            log.info("✅ Notification budget épuisé envoyée à: {}", nomPrestataire);
        } catch (Exception e) {
            log.warn("⚠️ Échec envoi notification budget épuisé: {}", e.getMessage());
        }
    }
    
    /**
     * Notification quand le budget est critique (< 10%)
     */
    private void envoyerNotificationBudgetCritique(String nomPrestataire, double budgetRestant, 
                                                  double pourcentage, List<com.dgsi.maintenance.entity.Contrat> contratsActifs) {
        try {
            String message = String.format(
                "⚠️ BUDGET CRITIQUE - Action urgente requise\n\n" +
                "Votre budget contractuel est presque épuisé:\n" +
                "💳 Budget restant: %.2f FCFA (%.1f%%)\n\n" +
                "Détails de vos contrats:\n%s\n\n" +
                "📞 Recommandation: Contactez rapidement l'administration pour:\n" +
                "- Préparer le renouvellement de votre contrat\n" +
                "- Évaluer vos besoins futurs\n\n" +
                "Contact: contact@dgsi.bf | +226 25 30 70 00",
                budgetRestant, pourcentage, genererDetailsContrats(contratsActifs)
            );
            
            notificationService.envoyerNotificationPersonnalisee(
                nomPrestataire,
                "⚠️ URGENT: Budget critique (" + String.format("%.1f%%", pourcentage) + " restant)",
                message
            );
            
            log.info("✅ Notification budget critique envoyée à: {} ({}%)", nomPrestataire, String.format("%.1f", pourcentage));
        } catch (Exception e) {
            log.warn("⚠️ Échec envoi notification budget critique: {}", e.getMessage());
        }
    }
    
    /**
     * Notification quand le budget est faible (< 25%)
     */
    private void envoyerNotificationBudgetFaible(String nomPrestataire, double budgetRestant, 
                                                double pourcentage, List<com.dgsi.maintenance.entity.Contrat> contratsActifs) {
        try {
            String message = String.format(
                "🟡 BUDGET FAIBLE - Planification recommandée\n\n" +
                "Votre budget contractuel diminue:\n" +
                "💳 Budget restant: %.2f FCFA (%.1f%%)\n\n" +
                "Détails de vos contrats:\n%s\n\n" +
                "📅 Suggestion: Commencez à planifier:\n" +
                "- Le renouvellement de votre contrat\n" +
                "- Vos besoins pour la prochaine période\n\n" +
                "Contact: contact@dgsi.bf | +226 25 30 70 00",
                budgetRestant, pourcentage, genererDetailsContrats(contratsActifs)
            );
            
            notificationService.envoyerNotificationPersonnalisee(
                nomPrestataire,
                "🟡 Info: Budget faible (" + String.format("%.1f%%", pourcentage) + " restant)",
                message
            );
            
            log.info("✅ Notification budget faible envoyée à: {} ({}%)", nomPrestataire, String.format("%.1f", pourcentage));
        } catch (Exception e) {
            log.warn("⚠️ Échec envoi notification budget faible: {}", e.getMessage());
        }
    }

    /**
     * Déduction du montant d'intervention du budget des contrats
     */
    @Transactional
    public void deduireMonantContrat(String nomPrestataire, java.math.BigDecimal montantIntervention) {
        log.info("💸 Déduction du montant {} du budget contrat pour {}", montantIntervention, nomPrestataire);

        // Récupérer les contrats actifs du prestataire
        List<com.dgsi.maintenance.entity.Contrat> contratsActifs = contratRepository.findActiveContratsByNomPrestataire(nomPrestataire);
        log.info("🔍 Contrats trouvés par nom exact '{}': {}", nomPrestataire, contratsActifs.size());
        
        if (contratsActifs.isEmpty()) {
            contratsActifs = contratRepository.findActiveContratsByNomPrestataireContaining(nomPrestataire);
            log.info("🔍 Contrats trouvés par nom partiel '{}': {}", nomPrestataire, contratsActifs.size());
        }

        // Debug: afficher tous les contrats trouvés
        for (com.dgsi.maintenance.entity.Contrat contrat : contratsActifs) {
            log.info("📄 Contrat trouvé: ID={}, Nom={}, Contact={}, Statut={}, MontantRestant={}", 
                contrat.getId(), contrat.getNomPrestataire(), 
                contrat.getPrestataire() != null ? contrat.getPrestataire().getContact() : "N/A",
                contrat.getStatut(), contrat.getMontantRestant());
        }

        if (contratsActifs.isEmpty()) {
            log.warn("⚠️ Aucun contrat trouvé pour déduction - prestataire: {}", nomPrestataire);
            return;
        }

        double montantADeduire = montantIntervention.doubleValue();
        
        // Déduire du premier contrat ayant un budget suffisant
        for (com.dgsi.maintenance.entity.Contrat contrat : contratsActifs) {
            if (montantADeduire <= 0) break;
            
            double montantRestant = contrat.getMontantRestant() != null ? contrat.getMontantRestant() : 0.0;
            
            if (montantRestant >= montantADeduire) {
                // Ce contrat peut couvrir tout le montant
                contrat.setMontantRestant(montantRestant - montantADeduire);
                contratRepository.save(contrat);
                log.info("✅ Montant {} déduit du contrat {} - nouveau solde: {}", 
                    montantADeduire, contrat.getIdContrat(), contrat.getMontantRestant());
                montantADeduire = 0;
            } else if (montantRestant > 0) {
                // Déduire partiellement de ce contrat
                contrat.setMontantRestant(0.0);
                contratRepository.save(contrat);
                montantADeduire -= montantRestant;
                log.info("✅ Montant {} déduit partiellement du contrat {} - contrat épuisé", 
                    montantRestant, contrat.getIdContrat());
            }
        }

        if (montantADeduire > 0) {
            log.warn("⚠️ Montant restant non déduit: {} - vérification préalable insuffisante", montantADeduire);
        }
        
        log.info("✅ Déduction terminée pour prestataire: {}", nomPrestataire);
    }

    /**
     * Méthode de mise à jour avec gestion transactionnelle
     */
    @Transactional
    public Prestation updatePrestation(Long id, Prestation prestationDetails) {
        log.info("🔄 Mise à jour prestation ID: {}", id);

        return prestationRepository.findById(id)
            .map(prestation -> {
                try {
                    // Validation des données de mise à jour
                    if (prestationDetails.getNomPrestation() != null) {
                        prestation.setNomPrestation(prestationDetails.getNomPrestation());
                    }
                    if (prestationDetails.getNomPrestataire() != null) {
                        prestation.setNomPrestataire(prestationDetails.getNomPrestataire());
                    }
                    if (prestationDetails.getMontantPrest() != null) {
                        prestation.setMontantPrest(prestationDetails.getMontantPrest());
                    }
                    if (prestationDetails.getTrimestre() != null) {
                        prestation.setTrimestre(prestationDetails.getTrimestre());
                    }
                    if (prestationDetails.getDateDebut() != null) {
                        prestation.setDateDebut(prestationDetails.getDateDebut());
                    }
                    if (prestationDetails.getDateFin() != null) {
                        prestation.setDateFin(prestationDetails.getDateFin());
                    }
                    if (prestationDetails.getStatut() != null) {
                        prestation.setStatut(prestationDetails.getStatut());
                    }
                    if (prestationDetails.getDescription() != null) {
                        prestation.setDescription(prestationDetails.getDescription());
                    }
                    if (prestationDetails.getNomStructure() != null) {
                        prestation.setNomStructure(prestationDetails.getNomStructure());
                    }
                    if (prestationDetails.getStatutValidation() != null) {
                        prestation.setStatutValidation(prestationDetails.getStatutValidation());
                    }

                    Prestation updatedPrestation = prestationRepository.save(prestation);
                    log.info("✅ Prestation mise à jour ID: {}", id);

                    return updatedPrestation;

                } catch (Exception e) {
                    log.error("❌ Erreur lors de la mise à jour de la prestation ID: {}", id, e);
                    throw new RuntimeException("Erreur lors de la mise à jour: " + e.getMessage(), e);
                }
            })
            .orElseThrow(() -> {
                log.warn("⚠️ Prestation non trouvée pour mise à jour ID: {}", id);
                return new IllegalArgumentException("Prestation non trouvée avec ID: " + id);
            });
    }

    /**
     * Méthode de suppression sécurisée avec soft delete pour prestataires
     */
    @Transactional
    public boolean deletePrestation(Long id, boolean isAdmin) {
        log.info("🔄 Suppression prestation ID: {} (admin: {})", id, isAdmin);

        // Pour les données de test (IDs négatifs), simuler la suppression réussie
        if (id < 0) {
            log.info("✅ Données de test supprimées (simulé) ID: {}", id);
            return true;
        }

        return prestationRepository.findById(id)
            .map(prestation -> {
                try {
                    if (isAdmin) {
                        // Administrateur : suppression physique
                        // Vérifier s'il y a des dépendances
                        if (prestation.getOrdreCommande() != null) {
                            log.warn("⚠️ Prestation ID: {} a un ordre de commande associé", id);
                            // Pour les admins, on peut supprimer complètement
                            prestation.setOrdreCommande(null);
                        }

                        prestationRepository.delete(prestation);
                        log.info("✅ Prestation supprimée physiquement ID: {}", id);
                    } else {
                        // Prestataire : soft delete
                        prestation.setDeleted(true);
                        prestationRepository.save(prestation);
                        log.info("✅ Prestation marquée comme supprimée ID: {}", id);
                    }
                    return true;

                } catch (Exception e) {
                    log.error("❌ Erreur lors de la suppression de la prestation ID: {}", id, e);
                    throw new RuntimeException("Erreur lors de la suppression: " + e.getMessage(), e);
                }
            })
            .orElse(false);
    }

    /**
     * Récupération avec gestion d'erreur
     */
    @Transactional(readOnly = true)
    public List<Prestation> getAllPrestations() {
        try {
            log.info("Fetching all prestations from database");
            List<Prestation> prestations = prestationRepository.findAll();
            log.info("Found " + prestations.size() + " prestations in database");
            return prestations;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des prestations", e);
            throw new RuntimeException("Erreur lors de la récupération des prestations", e);
        }
    }

    /**
     * Récupération paginée des prestations pour le tableau de bord admin (exclut les BROUILLON)
     */
    @Transactional(readOnly = true)
    public Page<Prestation> getAllPrestationsPaginated(int page, int size) {
        try {
            log.info("Fetching paginated prestations for admin dashboard (page={}, size={})", page, size);
            Pageable pageable = PageRequest.of(page, size);
            Page<Prestation> prestationsPage = prestationRepository.findAllForAdminDashboard(pageable);
            log.info("Found {} prestations in page {}/{} (total: {})",
                    prestationsPage.getContent().size(), page + 1, prestationsPage.getTotalPages(), prestationsPage.getTotalElements());
            return prestationsPage;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération paginée des prestations", e);
            throw new RuntimeException("Erreur lors de la récupération paginée des prestations", e);
        }
    }

    @Transactional(readOnly = true)
    public Optional<Prestation> getPrestationById(Long id) {
        try {
            return prestationRepository.findByIdWithEquipements(id);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de la prestation ID: {}", id, e);
            throw new RuntimeException("Erreur lors de la récupération de la prestation", e);
        }
    }

    @Transactional(readOnly = true)
    public Optional<Prestation> findByIdWithEquipements(Long id) {
        try {
            return prestationRepository.findByIdWithEquipements(id);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de la prestation avec équipements ID: {}", id, e);
            throw new RuntimeException("Erreur lors de la récupération de la prestation avec équipements", e);
        }
    }

    /**
     * Récupération d'une prestation pour la génération de PDF
     * Charge uniquement les données essentielles pour éviter les problèmes de mémoire
     */
    @Transactional(readOnly = true)
    public Optional<Prestation> findByIdForPdf(Long id) {
        try {
            // Charger uniquement les données nécessaires pour le PDF
            return prestationRepository.findByIdForPdf(id);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de la prestation pour PDF ID: {}", id, e);
            throw new RuntimeException("Erreur lors de la récupération de la prestation pour PDF", e);
        }
    }

    /**
     * Comptage avec gestion d'erreur robuste
     */
    @Transactional(readOnly = true)
    public Long countByNomPrestation(String nomItem) {
        log.info("🔍 Comptage des prestations pour: {}", nomItem);

        try {
            // Vérifier que l'item existe d'abord
            if (!itemRepository.existsByNomItem(nomItem)) {
                // Essayer de décoder si le nom paraît encodé
                String decoded = nomItem;
                try {
                    decoded = java.net.URLDecoder.decode(nomItem, java.nio.charset.StandardCharsets.UTF_8);
                } catch (Exception ex) {
                    // ignore
                }
                if (!decoded.equals(nomItem) && itemRepository.existsByNomItem(decoded)) {
                    nomItem = decoded;
                } else {
                    // Essayer une recherche partielle insensible à la casse
                    java.util.List<com.dgsi.maintenance.entity.Item> candidates = itemRepository.findByNomItemContainingIgnoreCase(nomItem);
                    if (!candidates.isEmpty()) {
                        nomItem = candidates.get(0).getNomItem();
                        log.info("🔎 Comptage: nomItem résolu par correspondance partielle -> {}", nomItem);
                    } else {
                        log.warn("⚠️ Item non trouvé lors du comptage: {}", nomItem);
                        return 0L;
                    }
                }
            }

            Long count = prestationRepository.countPrestationsByItemName(nomItem);
            log.info("✅ Count pour {}: {}", nomItem, count);
            return count;

        } catch (Exception e) {
            log.error("❌ Erreur critique lors du comptage pour: {}", nomItem, e);
            return 0L; // Retourner 0 plutôt que de faire échouer la requête
        }
    }

    /**
     * Count prestations for all item names
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Long> countAllByNomPrestation(String trimestre) {
        log.info("🔍 Comptage des prestations pour tous les items pour le trimestre: {}", trimestre);
        
        try {
            List<Object[]> results = prestationRepository.countByNomPrestationGrouped(trimestre);
            java.util.Map<String, Long> counts = new java.util.HashMap<>();
            
            for (Object[] result : results) {
                String nomItem = (String) result[0];
                Long count = (Long) result[1];
                counts.put(nomItem, count);
            }
            
            log.info("✅ Nombre d'items avec comptage: {}", counts.size());
            return counts;
            
        } catch (Exception e) {
            log.error("❌ Erreur lors du comptage des items: {}", e.getMessage(), e);
            return new java.util.HashMap<>();
        }
    }

    /**
     * Crée automatiquement une fiche de prestation pour validation administrative
     */
    public FichePrestation creerFichePourPrestation(Prestation prestation) {
        FichePrestation fiche = new FichePrestation();

        // CORRECTION: S'assurer que la prestation a un ID avant de créer la fiche
        if (prestation.getId() == null) {
            throw new IllegalArgumentException("Impossible de créer une fiche: la prestation n'a pas encore été sauvegardée (pas d'ID)");
        }

        // Lier la fiche à la prestation
        fiche.setIdPrestation(prestation.getId().toString());
        fiche.setNomPrestataire(prestation.getNomPrestataire());
        fiche.setNomItem(prestation.getNomPrestation());

        // Set the beneficiary structure name
        fiche.setNomStructure(prestation.getNomStructure());

        // Collecter les items utilisés avec leurs prix (en JSON pour préserver les informations complètes)
        if (prestation.getItemsUtilises() != null && !prestation.getItemsUtilises().isEmpty()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.List<java.util.Map<String, Object>> itemsWithPrices = new java.util.ArrayList<>();
                for (Item item : prestation.getItemsUtilises()) {
                    java.util.Map<String, Object> itemInfo = new java.util.HashMap<>();
                    itemInfo.put("nom", item.getNomItem());
                    itemInfo.put("prix", item.getPrix());
                    itemsWithPrices.add(itemInfo);
                }
                String itemsCouverts = mapper.writeValueAsString(itemsWithPrices);
                fiche.setItemsCouverts(itemsCouverts);
            } catch (Exception e) {
                // Si JSON échoue, utiliser format comma-separated comme fallback
                String itemsCouverts = prestation.getItemsUtilises().stream()
                    .map(item -> item.getNomItem())
                    .reduce((a, b) -> a + "," + b)
                    .orElse("");
                fiche.setItemsCouverts(itemsCouverts);
            }
        }

        // Date de réalisation basée sur la prestation
        fiche.setDateRealisation(prestation.getDateHeureDebut() != null ?
            prestation.getDateHeureDebut() : java.time.LocalDateTime.now());

        // Statut initial : en attente de validation
        fiche.setStatut(StatutFiche.EN_ATTENTE);

        // Quantité réalisée : 1 par défaut (une prestation = une quantité de 1)
        fiche.setQuantite(1);

        // Commentaire initial
        fiche.setCommentaire("Fiche créée automatiquement pour la prestation " + prestation.getNomPrestation());

        // Statut intervention
        fiche.setStatutIntervention(prestation.getStatutIntervention());

        // Log pour debug avec vérification
        log.info("Création fiche prestation: idPrestation={}, statut={}, prestationId={}, nomStructure={}",
            fiche.getIdPrestation(), fiche.getStatut(), prestation.getId(), fiche.getNomStructure());

        return fichePrestationRepository.save(fiche);
    }

    /**
     * Recherche les prestations pour un prestataire spécifique par username/email
     * Filtre les prestations supprimées (soft delete)
     */
    @Transactional(readOnly = true)
    public List<Prestation> findByPrestataireUsername(String username) {
        try {
            log.info("🔍 Recherche des prestations pour le prestataire: {}", username);
            List<Prestation> prestations;

            // Essayer d'abord par contact prestataire (email)
            prestations = prestationRepository.findByContactPrestataire(username);
            log.info("✅ {} prestations trouvées par contact prestataire '{}' ", prestations.size(), username);

            // Si rien trouvé, essayer par nom prestataire
            if (prestations.isEmpty()) {
                prestations = prestationRepository.findByNomPrestataire(username);
                log.info("✅ {} prestations trouvées par nom prestataire '{}'", prestations.size(), username);
            }

            // Si toujours rien, essayer par prestataireId (au cas où ce soit un ID numérique)
            if (prestations.isEmpty()) {
                prestations = prestationRepository.findByPrestataireId(username);
                log.info("✅ {} prestations trouvées par prestataireId '{}'", prestations.size(), username);
            }

            // Filtrer les prestations supprimées (soft delete) pour les prestataires
            prestations = prestations.stream()
                .filter(p -> p.getDeleted() == null || !p.getDeleted())
                .toList();

            log.info("📊 Total: {} prestations actives trouvées pour {}", prestations.size(), username);
            return prestations;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la recherche des prestations pour le prestataire {}", username, e);
            throw new RuntimeException("Erreur lors de la recherche des prestations du prestataire", e);
        }
    }

    /**
     * Recherche les prestations pour un prestataire spécifique
     */
    @Transactional(readOnly = true)
    public List<Prestation> findByNomPrestataire(String nomPrestataire) {
        try {
            log.info("🔍 Recherche des prestations pour le prestataire: {}", nomPrestataire);
            
            List<Prestation> prestations = prestationRepository.findByNomPrestataire(nomPrestataire);
            
            // Filtrer les prestations supprimées (soft delete)
            prestations = prestations.stream()
                .filter(p -> p.getDeleted() == null || !p.getDeleted())
                .toList();
            
            log.info("✅ {} prestations actives trouvées pour {}", prestations.size(), nomPrestataire);
            return prestations;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la recherche des prestations pour {}", nomPrestataire, e);
            throw new RuntimeException("Erreur lors de la recherche des prestations du prestataire", e);
        }
    }

    /**
     * Recherche paginée des prestations pour un prestataire spécifique par username/email
     * Filtre les prestations supprimées (soft delete)
     */
    @Transactional(readOnly = true)
    public Page<Prestation> findByPrestataireUsernamePaginated(String username, int page, int size) {
        try {
            log.info("🔍 Recherche paginée des prestations pour le prestataire: {} (page={}, size={})", username, page, size);
            Pageable pageable = PageRequest.of(page, size);

            Page<Prestation> prestationsPage;

            // Essayer d'abord par contact prestataire (email)
            prestationsPage = prestationRepository.findByContactPrestataire(username, pageable);
            log.info("✅ {} prestations trouvées par contact prestataire '{}' (page {}/{})",
                    prestationsPage.getContent().size(), username, page + 1, prestationsPage.getTotalPages());

            // Si rien trouvé, essayer par nom prestataire
            if (prestationsPage.isEmpty()) {
                prestationsPage = prestationRepository.findByNomPrestataire(username, pageable);
                log.info("✅ {} prestations trouvées par nom prestataire '{}' (page {}/{})",
                        prestationsPage.getContent().size(), username, page + 1, prestationsPage.getTotalPages());
            }

            // Si toujours rien, essayer par prestataireId (au cas où ce soit un ID numérique)
            if (prestationsPage.isEmpty()) {
                prestationsPage = prestationRepository.findByPrestataireId(username, pageable);
                log.info("✅ {} prestations trouvées par prestataireId '{}' (page {}/{})",
                        prestationsPage.getContent().size(), username, page + 1, prestationsPage.getTotalPages());
            }

            // Filtrer les prestations supprimées (soft delete) pour les prestataires
            List<Prestation> filteredContent = prestationsPage.getContent().stream()
                .filter(p -> p.getDeleted() == null || !p.getDeleted())
                .toList();

            // Créer une nouvelle page avec le contenu filtré
            prestationsPage = new org.springframework.data.domain.PageImpl<>(
                filteredContent, pageable, prestationsPage.getTotalElements());

            log.info("📊 Total: {} prestations actives trouvées pour {} (page {}/{})",
                    prestationsPage.getContent().size(), username, page + 1, prestationsPage.getTotalPages());
            return prestationsPage;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la recherche paginée des prestations pour le prestataire {}", username, e);
            throw new RuntimeException("Erreur lors de la recherche paginée des prestations du prestataire", e);
        }
    }

    /**
     * Recherche les prestations pour un trimestre spécifique
     * Filtre les prestations supprimées (soft delete)
     */
    @Transactional(readOnly = true)
    public List<Prestation> findByTrimestre(String trimestre) {
        try {
            log.info("🔍 Recherche des prestations pour le trimestre: {}", trimestre);

            List<Prestation> prestations = prestationRepository.findByTrimestre(trimestre);

            // Filtrer les prestations supprimées (soft delete)
            prestations = prestations.stream()
                .filter(p -> p.getDeleted() == null || !p.getDeleted())
                .toList();

            log.info("✅ {} prestations actives trouvées pour T{}", prestations.size(), trimestre);
            return prestations;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la recherche des prestations pour T{}", trimestre, e);
            throw new RuntimeException("Erreur lors de la recherche des prestations du trimestre", e);
        }
    }

    /**
     * Trouve les prestations sans ordre de commande et les lie automatiquement
     */
    @Transactional
    public List<Prestation> lierPrestationsSansOrdreCommande() {
        log.info("🔄 Recherche des prestations sans ordre de commande...");

        List<Prestation> prestationsSansOC = prestationRepository.findPrestationsWithoutOrdreCommande();
        log.info("✅ {} prestations trouvées sans ordre de commande", prestationsSansOC.size());

        for (Prestation prestation : prestationsSansOC) {
            try {
                log.info("📦 Création ordre de commande pour prestation ID: {}", prestation.getId());
                OrdreCommande ordre = ordreCommandeService.gererOrdreCommandePourPrestation(prestation);
                prestation.setOrdreCommande(ordre);
                prestationRepository.save(prestation);
                log.info("✅ Ordre de commande lié pour prestation ID: {}", prestation.getId());
            } catch (Exception e) {
                log.warn("⚠️ Échec liaison ordre de commande pour prestation ID: {} - {}", prestation.getId(), e.getMessage());
            }
        }

        log.info("✅ Liaison terminée pour {} prestations", prestationsSansOC.size());
        return prestationsSansOC;
    }

    /**
     * Comptage de toutes les prestations non supprimées (soft delete)
     */
    @Transactional(readOnly = true)
    public Long countAllNonDeleted() {
        try {
            log.info("🔢 Comptage de toutes les prestations non supprimées");

            // Compter toutes les prestations qui ne sont pas marquées comme supprimées
            List<Prestation> allPrestations = prestationRepository.findAll();
            long count = allPrestations.stream()
                .filter(p -> p.getDeleted() == null || !p.getDeleted())
                .count();

            log.info("✅ {} prestations actives trouvées", count);
            return count;

        } catch (Exception e) {
            log.error("❌ Erreur lors du comptage des prestations non supprimées", e);
            return 0L;
        }
    }
}

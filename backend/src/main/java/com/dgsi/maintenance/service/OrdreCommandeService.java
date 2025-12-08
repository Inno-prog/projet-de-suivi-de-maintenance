package com.dgsi.maintenance.service;

import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.OrdreCommande;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.OrdreCommandeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrdreCommandeService {

    private final OrdreCommandeRepository ordreCommandeRepository;
    private final ContratRepository contratRepository;

    @Transactional
    public OrdreCommande gererOrdreCommandePourPrestation(Prestation prestation) {
        log.info("📦 Génération ordre de commande pour prestataire: {}", prestation.getNomPrestataire());
        
        // 1. Trouver le contrat du prestataire pour récupérer le lot
        String lot = trouverLotDuPrestataire(prestation);
        
        // 2. Parser le trimestre
        Integer trimestreNumber = parseTrimestre(prestation.getTrimestre());
        
        // 3. Déterminer l'année
        Integer annee = prestation.getDateHeureDebut() != null ? 
            prestation.getDateHeureDebut().getYear() : 
            java.time.LocalDateTime.now().getYear();
        
        // 4. Chercher un ordre de commande existant pour ce lot/trimestre/année
        Optional<OrdreCommande> existingOC = chercherOrdreCommandeExistant(lot, trimestreNumber, annee);
        
        if (existingOC.isPresent()) {
            log.info("✅ Ordre de commande existant trouvé pour lot {} - T{} {}: {}", 
                lot, trimestreNumber, annee, existingOC.get().getIdOC());
            return existingOC.get();
        }
        
        // 5. Créer un nouvel ordre de commande
        OrdreCommande nouvelOC = creerNouvelOrdreCommande(lot, trimestreNumber, annee);
        log.info("✨ Nouvel ordre de commande créé pour lot {} - T{} {}: {}", 
            lot, trimestreNumber, annee, nouvelOC.getIdOC());
        
        return nouvelOC;
    }
    
    private String trouverLotDuPrestataire(Prestation prestation) {
        // Essayer de trouver par prestataireId d'abord
        if (prestation.getPrestataireId() != null) {
            List<Contrat> contrats = contratRepository.findByPrestataireId(prestation.getPrestataireId());
            if (!contrats.isEmpty()) {
                String lot = contrats.get(0).getLot();
                log.info("🏷️ Lot trouvé par prestataireId: {}", lot);
                return lot;
            }
        }
        
        // Fallback: chercher par nom de prestataire
        List<Contrat> tousLesContrats = contratRepository.findAll();
        for (Contrat contrat : tousLesContrats) {
            if (contrat.getNomPrestataire() != null && 
                contrat.getNomPrestataire().equals(prestation.getNomPrestataire())) {
                String lot = contrat.getLot();
                log.info("🏷️ Lot trouvé par nom prestataire: {}", lot);
                return lot;
            }
        }
        
        // Si aucun contrat trouvé, utiliser un lot par défaut
        String defaultLot = "LOT-UNKNOWN";
        log.warn("⚠️ Aucun contrat trouvé pour {}, utilisation du lot par défaut: {}", 
            prestation.getNomPrestataire(), defaultLot);
        return defaultLot;
    }
    
    private Integer parseTrimestre(String trimestre) {
        if (trimestre != null && trimestre.startsWith("T")) {
            try {
                return Integer.parseInt(trimestre.substring(1));
            } catch (NumberFormatException e) {
                log.warn("⚠️ Erreur parsing trimestre: {}, utilisation T1 par défaut", trimestre);
                return 1;
            }
        }
        return 1; // Défaut T1
    }
    
    private Optional<OrdreCommande> chercherOrdreCommandeExistant(String lot, Integer trimestre, Integer annee) {
        // Chercher par lot, trimestre et année
        List<OrdreCommande> ordresExistants = ordreCommandeRepository.findAll();
        
        return ordresExistants.stream()
            .filter(oc -> lot.equals(oc.getLot()) && 
                         trimestre.equals(oc.getTrimestre()) && 
                         annee.equals(oc.getAnnee()))
            .findFirst();
    }
    
    private OrdreCommande creerNouvelOrdreCommande(String lot, Integer trimestre, Integer annee) {
        OrdreCommande ordreCommande = new OrdreCommande();
        
        // Générer un ID unique basé sur le lot, trimestre et année
        String idOC = String.format("OC-%s-T%d-%d", lot, trimestre, annee);
        ordreCommande.setIdOC(idOC);
        ordreCommande.setLot(lot);
        ordreCommande.setTrimestre(trimestre);
        ordreCommande.setAnnee(annee);
        
        return ordreCommandeRepository.save(ordreCommande);
    }
}

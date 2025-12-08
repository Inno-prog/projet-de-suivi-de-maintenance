package com.dgsi.maintenance.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.repository.ContratRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ContratService {

    private final ContratRepository contratRepository;

    @Autowired
    public ContratService(ContratRepository contratRepository) {
        this.contratRepository = contratRepository;
    }

    /**
     * Initialise le montant restant pour tous les contrats existants
     */
    @Transactional
    public void initialiserMontantsRestants() {
        log.info("🔄 Initialisation des montants restants pour tous les contrats");
        
        List<Contrat> contrats = contratRepository.findAll();
        int updated = 0;
        
        for (Contrat contrat : contrats) {
            if (contrat.getMontantRestant() == null) {
                contrat.setMontantRestant(contrat.getMontant());
                contratRepository.save(contrat);
                updated++;
                log.info("✅ Contrat {} initialisé avec montant restant: {}", 
                    contrat.getIdContrat(), contrat.getMontantRestant());
            }
        }
        
        log.info("✅ {} contrats mis à jour avec montant restant", updated);
    }

    /**
     * Récupère tous les contrats actifs d'un prestataire
     */
    @Transactional(readOnly = true)
    public List<Contrat> getContratsActifsPrestataire(String prestataireContact) {
        log.info("🔍 Recherche contrats actifs pour prestataire: {}", prestataireContact);
        
        List<Contrat> contrats = contratRepository.findActiveContratsByContactPrestataire(prestataireContact);
        
        if (contrats.isEmpty()) {
            contrats = contratRepository.findActiveContratsByNomPrestataire(prestataireContact);
        }
        
        log.info("✅ {} contrats actifs trouvés", contrats.size());
        return contrats;
    }

    /**
     * Calcule le budget total restant pour un prestataire
     */
    @Transactional(readOnly = true)
    public double getBudgetTotalRestant(String prestataireContact) {
        List<Contrat> contrats = getContratsActifsPrestataire(prestataireContact);
        
        double budgetTotal = contrats.stream()
            .mapToDouble(contrat -> contrat.getMontantRestant() != null ? contrat.getMontantRestant() : 0.0)
            .sum();
            
        log.info("💰 Budget total restant pour {}: {} FCFA", prestataireContact, budgetTotal);
        return budgetTotal;
    }

    /**
     * Vérifie si un prestataire a suffisamment de budget
     */
    @Transactional(readOnly = true)
    public boolean hasSufficientBudget(String prestataireContact, double montantDemande) {
        double budgetRestant = getBudgetTotalRestant(prestataireContact);
        return budgetRestant >= montantDemande;
    }

    /**
     * Récupère un contrat par ID
     */
    @Transactional(readOnly = true)
    public Optional<Contrat> getContratById(Long id) {
        return contratRepository.findById(id);
    }

    /**
     * Met à jour un contrat
     */
    @Transactional
    public Contrat updateContrat(Contrat contrat) {
        return contratRepository.save(contrat);
    }

    /**
     * Récupère tous les contrats
     */
    @Transactional(readOnly = true)
    public List<Contrat> getAllContrats() {
        return contratRepository.findAll();
    }
}
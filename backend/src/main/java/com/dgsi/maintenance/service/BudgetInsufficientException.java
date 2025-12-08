package com.dgsi.maintenance.service;

/**
 * Exception levée quand le budget du contrat est insuffisant pour créer une prestation
 */
public class BudgetInsufficientException extends RuntimeException {
    
    private final double montantDemande;
    private final double budgetRestant;
    
    public BudgetInsufficientException(String message, double montantDemande, double budgetRestant) {
        super(message);
        this.montantDemande = montantDemande;
        this.budgetRestant = budgetRestant;
    }
    
    public BudgetInsufficientException(String message) {
        super(message);
        this.montantDemande = 0.0;
        this.budgetRestant = 0.0;
    }
    
    public double getMontantDemande() {
        return montantDemande;
    }
    
    public double getBudgetRestant() {
        return budgetRestant;
    }
}
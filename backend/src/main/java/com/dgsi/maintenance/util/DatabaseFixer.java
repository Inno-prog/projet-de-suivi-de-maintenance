package com.dgsi.maintenance.util;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Component
public class DatabaseFixer {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void fixPrestataireContracts() {
        System.out.println("=== Début de la correction des liens prestataires-contrats ===");
        
        // 1. Corriger les liens entre prestataires et contrats
        String updateContractsSQL = """
            UPDATE contrats c
            SET prestataire_id = (
                SELECT p.id 
                FROM prestataires p
                JOIN users u ON p.id = u.id
                WHERE LOWER(u.nom) = LOWER(c.nom_prestataire)
            )
            WHERE c.prestataire_id IS NULL 
              AND EXISTS (
                SELECT 1 
                FROM prestataires p
                JOIN users u ON p.id = u.id
                WHERE LOWER(u.nom) = LOWER(c.nom_prestataire)
            )
        """;
        
        int contractsUpdated = entityManager.createNativeQuery(updateContractsSQL).executeUpdate();
        System.out.println("Contrats mis à jour: " + contractsUpdated);
        
        // 2. Normaliser les noms de lots dans la table items
        String updateItemsSQL = """
            UPDATE items 
            SET lot = 'lot' || TRIM(REPLACE(REPLACE(REPLACE(LOWER(lot), 'lot', ''), ' ', ''), '.', ''))
            WHERE lot IS NOT NULL 
              AND lot != ''
              AND lot NOT LIKE 'lot%'
        """;
        
        int itemsUpdated = entityManager.createNativeQuery(updateItemsSQL).executeUpdate();
        System.out.println("Items mis à jour: " + itemsUpdated);
        
        // 3. Normaliser les noms de lots dans la table contrats (utiliser lot_name au lieu de lot)
        String updateContratsSQL = """
            UPDATE contrats 
            SET lot_name = 'lot' || TRIM(REPLACE(REPLACE(REPLACE(LOWER(lot_name), 'lot', ''), ' ', ''), '.', ''))
            WHERE lot_name IS NOT NULL 
              AND lot_name != ''
              AND lot_name NOT LIKE 'lot%'
        """;
        
        int contratsUpdated = entityManager.createNativeQuery(updateContratsSQL).executeUpdate();
        System.out.println("Contrats normalisés: " + contratsUpdated);
        
        // 4. Corriger les cas spécifiques
        // - NetCom Afrique: assigner le lot1
        // - IT Solutions Burkina: normaliser le lot3
        String fixSpecificCasesSQL = """
            -- Corriger NetCom Afrique (ajouter lot1)
            UPDATE contrats 
            SET lot_name = 'lot1'
            WHERE LOWER(nom_prestataire) LIKE '%netcom%' AND (lot_name IS NULL OR lot_name = '');
            
            -- Corriger IT Solutions Burkina (normaliser lot 3 en lot3)
            UPDATE contrats 
            SET lot_name = 'lot3'
            WHERE LOWER(nom_prestataire) LIKE '%it solutions%' AND LOWER(lot_name) = 'lot 3';
        """;
        
        int specificCasesUpdated = entityManager.createNativeQuery(fixSpecificCasesSQL).executeUpdate();
        System.out.println("Cas spécifiques corrigés: " + specificCasesUpdated);
        
        entityManager.flush();
        System.out.println("=== Correction terminée ===");
    }
    
    @Transactional
    public void checkData() {
        System.out.println("\n=== Vérification des données ===");
        
        // Vérifier les contrats avec prestataire_id
        String checkContratsSQL = """
            SELECT COUNT(*) as nb_contrats, 
                   SUM(CASE WHEN prestataire_id IS NOT NULL THEN 1 ELSE 0 END) as nb_contrats_avec_prestataire
            FROM contrats
            WHERE statut = 'ACTIF'
        """;
        
        Object[] result = (Object[]) entityManager.createNativeQuery(checkContratsSQL).getSingleResult();
        System.out.println("Contrats actifs total: " + result[0]);
        System.out.println("Contrats actifs avec prestataire_id: " + result[1]);
        
        // Vérifier les items par lot
        String checkItemsSQL = """
            SELECT lot, COUNT(*) as nb_items
            FROM items
            GROUP BY lot
            ORDER BY lot
        """;
        
        System.out.println("\nItems par lot:");
        entityManager.createNativeQuery(checkItemsSQL)
            .getResultList()
            .forEach(row -> {
                Object[] data = (Object[]) row;
                System.out.println("  " + data[0] + ": " + data[1] + " item(s)");
            });
        
        // Vérifier les contrats par prestataire
        String checkPrestataireContratsSQL = """
            SELECT u.nom as prestataire, COUNT(c.id) as nb_contrats
            FROM users u
            JOIN prestataires p ON u.id = p.id
            LEFT JOIN contrats c ON c.prestataire_id = p.id AND c.statut = 'ACTIF'
            WHERE u.dtype = 'Prestataire'
            GROUP BY u.nom
            ORDER BY u.nom
        """;
        
        System.out.println("\nContrats par prestataire:");
        entityManager.createNativeQuery(checkPrestataireContratsSQL)
            .getResultList()
            .forEach(row -> {
                Object[] data = (Object[]) row;
                System.out.println("  " + data[0] + ": " + data[1] + " contrat(s)");
            });
    }
}

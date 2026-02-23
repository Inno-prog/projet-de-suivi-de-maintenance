-- =====================================================
-- Script de suppression complète des prestations et réinitialisation des quantités d'items
-- Database: PostgreSQL - maintenance_dgsi
-- =====================================================

-- Commencer une transaction pour s'assurer que tout est exécuté atomiquement
BEGIN;

-- =====================================================
-- ÉTAPE 1: Supprimer les liaisons prestation-item (table de jonction)
-- =====================================================
DELETE FROM prestation_item;

-- =====================================================
-- ÉTAPE 2: Supprimer les liaisons fiche_prestation_items (référence à fiches_prestation)
-- =====================================================
DELETE FROM fiche_prestation_items;

-- =====================================================
-- ÉTAPE 3: Supprimer toutes les fiches de prestation
-- =====================================================
DELETE FROM fiches_prestation;

-- =====================================================
-- ÉTAPE 4: Supprimer toutes les prestations
-- =====================================================
DELETE FROM prestations;

-- =====================================================
-- ÉTAPE 4: Réinitialiser les quantités utilisées de tous les items à zéro
-- =====================================================
UPDATE items 
SET quantite_utilisee = 0, 
    quantite_utilisee_trimestre = 0;

-- =====================================================
-- VÉRIFICATION: Afficher les résultats
-- =====================================================

-- Vérifier que les prestations ont été supprimées
SELECT 'Prestations supprimées: ' || COUNT(*) || ' enregistrements' as resultat
FROM prestations;

-- Vérifier que les fiches ont été supprimées
SELECT 'Fiches de prestation supprimées: ' || COUNT(*) || ' enregistrements' as resultat
FROM fiches_prestation;

-- Vérifier que les liaisons ont été supprimées
SELECT 'Liaisons prestation-item supprimées: ' || COUNT(*) || ' enregistrements' as resultat
FROM prestation_item;

-- Vérifier que les quantités ont été réinitialisées
SELECT 'Items avec quantité utilisée = 0: ' || COUNT(*) || ' sur ' || COUNT(*) as resultat
FROM items
WHERE quantite_utilisee = 0;

SELECT 'Items avec quantité trimestrielle = 0: ' || COUNT(*) || ' sur ' || COUNT(*) as resultat
FROM items
WHERE quantite_utilisee_trimestre = 0;

-- Afficher les statistiques finales des items
SELECT 
    COUNT(*) as total_items,
    SUM(quantite_utilisee) as total_quantite_utilisee,
    SUM(quantite_utilisee_trimestre) as total_quantite_trimestre
FROM items;

-- Valider la transaction
COMMIT;

-- Message de confirmation
SELECT 'Opération terminée avec succès! Toutes les prestations ont été supprimées et les quantités d''items ont été réinitialisées.' as message;


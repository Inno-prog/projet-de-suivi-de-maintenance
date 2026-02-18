-- Script pour corriger les quantités d'items après suppression de prestations
-- Ce script restaure les quantités utilisées pour les prestations qui ont été supprimées sans être soumises

-- 1. Identifier les prestations supprimées (soft delete) qui n'ont pas été soumises
-- et qui ont des items associés

-- 2. Pour chaque prestation supprimée, restaurer les quantités dans les contrats

-- Créer une table temporaire pour stocker les prestations supprimées avec leurs items
CREATE TEMPORARY TABLE IF NOT EXISTS temp_deleted_prestations AS
SELECT 
    p.id as prestation_id,
    p.nom_prestataire,
    p.deleted,
    p.statut_validation,
    pi.item_id,
    i.nom_item
FROM prestations p
JOIN prestation_items pi ON p.id = pi.prestation_id
JOIN items i ON pi.item_id = i.id
WHERE p.deleted = true 
   OR (p.statut_validation = 'BROUILLON' AND p.deleted = true);

-- 3. Restaurer les quantités dans les contrat_items
-- Pour chaque item des prestations supprimées, décrémenter la quantité utilisée

UPDATE contrat_items ci
SET quantite_utilisee = GREATEST(0, ci.quantite_utilisee - 1)
WHERE ci.item_id IN (
    SELECT DISTINCT item_id 
    FROM temp_deleted_prestations
);

-- 4. Mettre à jour le montant restant des contrats si nécessaire
-- (si vous avez une logique de budget à restaurer aussi)

-- 5. Vérification : Afficher les quantités corrigées
SELECT 
    c.id_contrat,
    c.nom_prestataire,
    i.nom_item,
    ci.quantite_utilisee as nouvelle_quantite
FROM contrats c
JOIN contrat_items ci ON c.id = ci.contrat_id
JOIN items i ON ci.item_id = i.id
WHERE c.nom_prestataire IN (SELECT DISTINCT nom_prestataire FROM temp_deleted_prestations)
ORDER BY c.nom_prestataire, i.nom_item;

-- 6. Nettoyer la table temporaire
DROP TEMPORARY TABLE IF EXISTS temp_deleted_prestations;

-- Message de confirmation
SELECT 'Correction des quantités terminée' as message;

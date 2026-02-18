-- Script pour corriger les quantités d'items après suppression de prestations
-- Ce script restaure les quantités utilisées pour les prestations qui ont été supprimées sans être soumises

-- Vérifier les prestations supprimées (soft delete) ou en brouillon supprimées
-- et restaurer les quantités correspondantes dans les contrats

-- Étape 1: Créer une vue temporaire des prestations supprimées avec leurs items
CREATE OR REPLACE VIEW temp_prestations_supprimees AS
SELECT 
    p.id as prestation_id,
    p.nom_prestataire,
    p.deleted,
    p.statut_validation,
    pi.item_id,
    i.nom_item,
    1 as quantite_utilisee  -- Par défaut 1, ajustez si vous avez une colonne quantité spécifique
FROM prestations p
JOIN prestation_items pi ON p.id = pi.prestation_id
JOIN items i ON pi.item_id = i.id
WHERE p.deleted = true 
   OR (p.statut_validation = 'BROUILLON' AND p.deleted = true);

-- Étape 2: Afficher un résumé des prestations supprimées
SELECT 
    nom_prestataire,
    COUNT(DISTINCT prestation_id) as nb_prestations_supprimees,
    COUNT(item_id) as nb_items_a_restaurer
FROM temp_prestations_supprimees
GROUP BY nom_prestataire
ORDER BY nb_items_a_restaurer DESC;

-- Étape 3: Restaurer les quantités dans les contrat_items
-- Pour chaque item des prestations supprimées, décrémenter la quantité utilisée
UPDATE contrat_items ci
SET quantite_utilisee = GREATEST(0, ci.quantite_utilisee - (
    SELECT COALESCE(SUM(quantite_utilisee), 0)
    FROM temp_prestations_supprimees tps
    WHERE tps.item_id = ci.item_id
    AND tps.nom_prestataire IN (
        SELECT c.nom_prestataire 
        FROM contrats c 
        WHERE c.id = ci.contrat_id
    )
))
WHERE ci.item_id IN (
    SELECT DISTINCT item_id 
    FROM temp_prestations_supprimees
);

-- Étape 4: Vérification - Afficher les quantités corrigées
SELECT 
    c.id_contrat,
    c.nom_prestataire,
    i.nom_item,
    ci.quantite_utilisee as quantite_corrigee,
    ci.quantite_max as quantite_maximale,
    (ci.quantite_max - ci.quantite_utilisee) as quantite_disponible
FROM contrats c
JOIN contrat_items ci ON c.id = ci.contrat_id
JOIN items i ON ci.item_id = i.id
WHERE c.nom_prestataire IN (SELECT DISTINCT nom_prestataire FROM temp_prestations_supprimees)
ORDER BY c.nom_prestataire, i.nom_item;

-- Étape 5: Nettoyer la vue temporaire
DROP VIEW IF EXISTS temp_prestations_supprimees;

-- Message de confirmation
SELECT 'Correction des quantités terminée avec succès' as message;

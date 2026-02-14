-- Script pour mettre à jour les régions des lots basées sur les contrats actifs
-- Ce script synchronise les régions des lots avec les villes des contrats

-- Étape 1: Créer une table temporaire pour stocker les régions par lot
CREATE TEMPORARY TABLE temp_lot_regions AS
SELECT
    c.lot,
    GROUP_CONCAT(DISTINCT r.region_name SEPARATOR ',') as regions
FROM contrats c
JOIN reference_data_villes v ON c.ville = v.ville_name
JOIN reference_data_regions r ON v.region_id = r.id
WHERE c.statut = 'ACTIF'
  AND c.lot IS NOT NULL
  AND c.lot != ''
  AND c.ville IS NOT NULL
  AND c.ville != ''
GROUP BY c.lot;

-- Étape 2: Mettre à jour la table lots avec les régions
UPDATE lots l
JOIN temp_lot_regions tlr ON l.nom_lot = tlr.lot
SET l.regions = tlr.regions;

-- Étape 3: Nettoyer - supprimer les items qui n'existent plus
-- (Les items supprimés de l'interface devraient être marqués comme supprimés ou avoir une date de suppression)

-- Étape 4: Vérifier les résultats
SELECT
    l.nom_lot,
    l.regions,
    COUNT(c.id) as nombre_contrats_actifs
FROM lots l
LEFT JOIN contrats c ON l.nom_lot = c.lot AND c.statut = 'ACTIF'
GROUP BY l.nom_lot, l.regions
ORDER BY l.nom_lot;

-- Étape 5: Nettoyer la table temporaire
DROP TEMPORARY TABLE temp_lot_regions;

-- Script de diagnostic et correction pour les lots d'items
-- Ce script aide à identifier et corriger les incohérences entre les lots des contrats et des items

-- 1. Afficher tous les lots uniques dans les contrats
SELECT DISTINCT lot as contrat_lot, COUNT(*) as count
FROM contrats 
WHERE lot IS NOT NULL AND lot != ''
GROUP BY lot
ORDER BY lot;

-- 2. Afficher tous les lots uniques dans les items
SELECT DISTINCT lot as item_lot, COUNT(*) as count
FROM items 
WHERE lot IS NOT NULL AND lot != ''
GROUP BY lot
ORDER BY lot;

-- 3. Vérifier les prestataires qui ont des contrats mais dont les items ne correspondent pas
-- Cette requête identifie les prestataires dont les lots contractuels n'ont pas d'items correspondants
SELECT 
    c.nom_prestataire,
    c.lot as contrat_lot,
    (SELECT COUNT(*) FROM items i WHERE LOWER(TRIM(i.lot)) = LOWER(TRIM(c.lot)) OR LOWER(TRIM(REPLACE(i.lot, 'lot', ''))) = LOWER(TRIM(c.lot))) as matching_items_count
FROM contrats c
WHERE c.statut = 'ACTIF'
ORDER BY c.nom_prestataire;

-- 4. Solution de normalisation: Mettre à jour les lots des items pour correspondre aux contrats
-- Cette mise à jour standardise le format des lots dans la table items
-- en utilisant le format "lotX" (minuscule, sans espace)

-- UPDATE items SET lot = 'lot3' WHERE lot IN ('3', 'Lot 3', 'LOT 3', 'lot 3', 'Lot3');

-- 5. Lister les prestataires et leurs lots pour vérification
SELECT DISTINCT 
    c.nom_prestataire,
    c.prestataire_id,
    c.lot as contrat_lot
FROM contrats c
WHERE c.statut = 'ACTIF'
ORDER BY c.nom_prestataire;

-- 6. Lister les items par lot pour vérification
SELECT 
    i.lot,
    COUNT(*) as item_count,
    STRING_AGG(LEFT(i.nom_item, 30), ', ' ORDER BY i.nom_item) as sample_items
FROM items i
WHERE i.lot IS NOT NULL AND i.lot != ''
GROUP BY i.lot
ORDER BY i.lot;

-- 7. Script de correction automatisée - Uncomment pour exécuter
-- Ce script met à jour les items dont le lot ne correspond pas au format standard
/*
UPDATE items i
SET lot = 'lot' || REGEXP_REPLACE(LOWER(TRIM(i.lot)), '[^0-9]', '', 'g')
WHERE i.lot IS NOT NULL 
  AND i.lot != ''
  AND i.lot NOT LIKE 'lot%'
  AND i.lot NOT LIKE 'LOT%';
*/

-- 8. Vérification finale - Items par prestataire après correction
-- Cette requête montre les items qu'un prestataire devrait voir
/*
SELECT 
    c.nom_prestataire,
    c.lot as contrat_lot,
    i.id,
    i.nom_item,
    i.lot as item_lot
FROM contrats c
JOIN items i ON LOWER(TRIM(i.lot)) = LOWER(TRIM(c.lot))
WHERE c.statut = 'ACTIF'
  AND LOWER(c.nom_prestataire) LIKE '%netcom%'
ORDER BY i.nom_item;
*/


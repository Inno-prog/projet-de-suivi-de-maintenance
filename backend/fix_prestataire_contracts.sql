-- Script SQL pour corriger les liens entre prestataires et contrats
-- À exécuter dans la console H2 : http://localhost:8085/h2-console

-- 1. Vérifier les données actuelles (avant correction)
SELECT 
    u.id as user_id,
    u.email,
    u.nom as user_nom,
    u.dtype,
    p.id as prestataire_id,
    c.id as contrat_id,
    c.id_contrat,
    c.nom_prestataire,
    c.prestataire_id,
    c.lot,
    c.lot_id,
    c.statut
FROM users u
LEFT JOIN prestataires p ON u.id = p.id
LEFT JOIN contrats c ON c.prestataire_id = p.id OR LOWER(c.nom_prestataire) = LOWER(u.nom)
ORDER BY u.nom, c.nom_prestataire;

-- 2. Corriger les liens entre prestataires et contrats
-- Associer les contrats aux prestataires via le nom (pour les contrats sans prestataire_id)
UPDATE contrats c
SET prestataire_id = (
    SELECT p.id 
    FROM prestataires p
    JOIN users u ON p.id = u.id
    WHERE LOWER(u.nom) = LOWER(c.nom_prestataire)
    LIMIT 1
)
WHERE c.prestataire_id IS NULL 
  AND EXISTS (
    SELECT 1 
    FROM prestataires p
    JOIN users u ON p.id = u.id
    WHERE LOWER(u.nom) = LOWER(c.nom_prestataire)
);

-- 3. Normaliser les noms de lots dans la table items
-- Remplacer les formats variés par le format standard "lotX" (sans espace)
UPDATE items 
SET lot = 'lot' || TRIM(REPLACE(REPLACE(REPLACE(LOWER(lot), 'lot', ''), ' ', ''), '.', ''))
WHERE lot IS NOT NULL 
  AND lot != ''
  AND lot NOT LIKE 'lot%';

-- 4. Normaliser les noms de lots dans la table contrats
UPDATE contrats 
SET lot = 'lot' || TRIM(REPLACE(REPLACE(REPLACE(LOWER(lot), 'lot', ''), ' ', ''), '.', ''))
WHERE lot IS NOT NULL 
  AND lot != ''
  AND lot NOT LIKE 'lot%';

-- 5. Vérifier les modifications (après correction)
SELECT 
    u.id as user_id,
    u.email,
    u.nom as user_nom,
    u.dtype,
    p.id as prestataire_id,
    c.id as contrat_id,
    c.id_contrat,
    c.nom_prestataire,
    c.prestataire_id,
    c.lot,
    c.lot_id,
    c.statut
FROM users u
LEFT JOIN prestataires p ON u.id = p.id
LEFT JOIN contrats c ON c.prestataire_id = p.id
ORDER BY u.nom, c.nom_prestataire;

-- 6. Vérifier les items et les contrats associés
SELECT 
    c.nom_prestataire,
    c.lot as contrat_lot,
    i.id as item_id,
    i.nom_item,
    i.lot as item_lot
FROM contrats c
JOIN items i ON c.lot = i.lot
WHERE c.statut = 'ACTIF'
ORDER BY c.nom_prestataire, i.nom_item;

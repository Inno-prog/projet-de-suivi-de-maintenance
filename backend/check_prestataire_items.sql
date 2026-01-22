-- Script to check prestataire items issue
-- Check contracts and their lots
SELECT c.id, c.nom_prestataire, c.lot, c.statut, c.prestataire_id
FROM contrats c
ORDER BY c.nom_prestataire;

-- Check items and their lots
SELECT i.id, i.nom_item, i.lot
FROM items i
ORDER BY i.lot, i.nom_item;

-- Check specific prestataire - netcomAfrique
SELECT c.id, c.nom_prestataire, c.lot, c.statut, c.prestataire_id
FROM contrats c
WHERE LOWER(c.nom_prestataire) LIKE '%netcom%' OR LOWER(c.nom_prestataire) LIKE '%afrique%';

-- Check items for lot that netcomAfrique has contract for
SELECT i.id, i.nom_item, i.lot
FROM items i
WHERE LOWER(TRIM(i.lot)) IN (
    SELECT LOWER(TRIM(c.lot))
    FROM contrats c
    WHERE LOWER(c.nom_prestataire) LIKE '%netcom%' OR LOWER(c.nom_prestataire) LIKE '%afrique%'
);

-- Check all prestataires and their contracts
SELECT DISTINCT c.nom_prestataire, c.prestataire_id
FROM contrats c
ORDER BY c.nom_prestataire;

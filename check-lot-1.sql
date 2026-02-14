-- Check how many items are in Lot 1
SELECT COUNT(*) as total_items_lot_1, lot
FROM items 
WHERE LOWER(lot) LIKE '%lot 1%' OR LOWER(lot) LIKE '%1'
GROUP BY lot
ORDER BY lot;

-- Check contracts for Lot 1
SELECT id_contrat, nom_prestataire, lot, prestataire_id, statut
FROM contrats 
WHERE LOWER(lot) LIKE '%lot 1%' OR LOWER(lot) LIKE '%1'
ORDER BY nom_prestataire;

-- Check the actual items in Lot 1
SELECT id, id_item, nom_item, lot, description
FROM items 
WHERE LOWER(lot) LIKE '%lot 1%' OR LOWER(lot) LIKE '%1'
ORDER BY id_item;

-- Check if there are any duplicate items in Lot 1
SELECT nom_item, COUNT(*) as count
FROM items 
WHERE LOWER(lot) LIKE '%lot 1%' OR LOWER(lot) LIKE '%1'
GROUP BY nom_item
HAVING COUNT(*) > 1;

-- Check duplicate items in lot3
SELECT id, id_item, nom_item, lot, description
FROM items 
WHERE nom_item LIKE '%reparation de pc%'
ORDER BY id;

-- Keep the first item and delete duplicates (adjust the IDs based on your results)
-- DELETE FROM items WHERE id IN (179); -- Example: delete one of the duplicates

-- Verify the fix
SELECT id, id_item, nom_item, lot, description
FROM items 
WHERE lot = 'lot3';

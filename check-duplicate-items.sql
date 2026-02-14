-- Check for duplicate items with same name and lot
SELECT nom_item, lot, COUNT(*) as duplicate_count
FROM items 
GROUP BY nom_item, lot
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- List all duplicate items
SELECT id, id_item, nom_item, lot, description
FROM items 
WHERE (nom_item, lot) IN (
    SELECT nom_item, lot
    FROM items 
    GROUP BY nom_item, lot
    HAVING COUNT(*) > 1
)
ORDER BY nom_item, lot, id;

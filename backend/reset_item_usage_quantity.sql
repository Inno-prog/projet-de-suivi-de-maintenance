-- Script to reset all item usage quantities to zero
UPDATE items 
SET quantite_utilisee = 0, 
    quantite_utilisee_trimestre = 0;

-- Verify the update
SELECT COUNT(*) as total_items, 
       COUNT(*) FILTER (WHERE quantite_utilisee = 0) as items_with_zero_quantite_utilisee,
       COUNT(*) FILTER (WHERE quantite_utilisee_trimestre = 0) as items_with_zero_quantite_utilisee_trimestre
FROM items;

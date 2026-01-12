-- Fix lot assignment for item "reparation de pc"
-- Update the item to belong to lot3 if it should be there

-- First, check current lot assignment
SELECT id, nom_item, lot FROM items WHERE nom_item ILIKE '%reparation%' OR nom_item ILIKE '%pc%';

-- Update the item to lot3 (assuming it should belong to lot3)
UPDATE items SET lot = 'lot3' WHERE nom_item ILIKE '%reparation de pc%';

-- Verify the update
SELECT id, nom_item, lot FROM items WHERE nom_item ILIKE '%reparation%' OR nom_item ILIKE '%pc%';
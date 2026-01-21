-- Script to clean up duplicate lots and standardize lot naming
-- This script addresses the issue where contracts reference lot names that don't match Lot entities

-- Step 1: First, let's see what we have
-- Check current lots
SELECT id, nom_lot, code_lot FROM lots ORDER BY id;

-- Check contracts and their lot references
SELECT c.id_contrat, c.lot_name, l.id, l.nom_lot
FROM contrats c
LEFT JOIN lots l ON c.lot_name = l.nom_lot
WHERE c.lot_name IS NOT NULL AND c.lot_name != ''
ORDER BY c.lot_name;

-- Step 2: Standardize lot names to "Lot X" format (capital L, space)
-- Update lots with lowercase or no-space names
UPDATE lots SET nom_lot = 'Lot 4' WHERE nom_lot = 'lot4' OR nom_lot = 'lot 4';
UPDATE lots SET nom_lot = 'Lot 9' WHERE nom_lot = 'lot9' OR nom_lot = 'lot 9';

-- Step 3: Update contracts to use standardized lot names
UPDATE contrats SET lot_name = 'Lot 4' WHERE lot_name = 'lot4';
UPDATE contrats SET lot_name = 'Lot 9' WHERE lot_name = 'lot9';

-- Step 4: Link contracts to actual lot entities using lot_id
-- Update contracts to reference the correct lot IDs
UPDATE contrats SET lot_id = (SELECT id FROM lots WHERE nom_lot = 'Lot 4') WHERE lot_name = 'Lot 4';
UPDATE contrats SET lot_id = (SELECT id FROM lots WHERE nom_lot = 'Lot 9') WHERE lot_name = 'Lot 9';

-- Step 5: Remove any duplicate lots that might exist
-- Find duplicates by nom_lot
WITH duplicates AS (
    SELECT nom_lot, MIN(id) as keep_id, COUNT(*) as count
    FROM lots
    GROUP BY nom_lot
    HAVING COUNT(*) > 1
)
DELETE FROM lots
WHERE id NOT IN (SELECT keep_id FROM duplicates)
AND nom_lot IN (SELECT nom_lot FROM duplicates WHERE count > 1);

-- Step 6: Update other references (items, structures_mefp) to use correct lot names
UPDATE items SET lot = 'Lot 4' WHERE lot = 'lot4' OR lot = 'lot 4';
UPDATE items SET lot = 'Lot 9' WHERE lot = 'lot9' OR lot = 'lot 9';

-- Update structures_mefp if they reference lot names
UPDATE structures_mefp SET lot_name = 'Lot 4' WHERE lot_name = 'lot4' OR lot_name = 'lot 4';
UPDATE structures_mefp SET lot_name = 'Lot 9' WHERE lot_name = 'lot9' OR lot_name = 'lot 9';

-- Step 7: Verify the cleanup
-- Check that we now have unique lot names
SELECT nom_lot, COUNT(*) as count FROM lots GROUP BY nom_lot HAVING COUNT(*) > 1;

-- Check that contracts are properly linked
SELECT c.id_contrat, c.lot_name, c.lot_id, l.nom_lot
FROM contrats c
LEFT JOIN lots l ON c.lot_id = l.id
WHERE c.lot_name IS NOT NULL AND c.lot_name != '';

-- Final verification
SELECT 'Total lots after cleanup:' as info, COUNT(*) as count FROM lots;
SELECT 'Total contracts:' as info, COUNT(*) as count FROM contrats;
SELECT 'Contracts with lot references:' as info, COUNT(*) as count FROM contrats WHERE lot_name IS NOT NULL AND lot_name != '';
SELECT 'Contracts properly linked to lot entities:' as info, COUNT(*) as count FROM contrats WHERE lot_id IS NOT NULL;

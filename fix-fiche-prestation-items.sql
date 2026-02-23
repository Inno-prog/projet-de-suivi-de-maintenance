-- Script to populate fiche_prestation_items table from existing data

-- First, let's check the current state
SELECT * FROM fiche_prestation_items;

-- Insert relations for existing fiches
-- Fiche T1-L4-01 (id: 6) - item: Remplacement de cordon d'alimentation (id: 196)
INSERT INTO fiche_prestation_items (fiche_prestation_id, item_id)
VALUES (6, 196);

-- Fiche T1-L4-02 (id: 8) - item: Remplacement de Chargeur d'alimentation (id: 197)
INSERT INTO fiche_prestation_items (fiche_prestation_id, item_id)
VALUES (8, 197);

-- Fiche T1-L4-03 (id: 10) - items: reparation de battérie (id: 202) and reparation imprimante (id: 206)
INSERT INTO fiche_prestation_items (fiche_prestation_id, item_id)
VALUES (10, 202), (10, 206);

-- Verify the changes
SELECT * FROM fiche_prestation_items;

-- Verify the relation with fiches and items
SELECT 
    fp.id,
    fp.numero_fiche,
    i.id as item_id,
    i.nom_item
FROM fiches_prestation fp
JOIN fiche_prestation_items fpi ON fp.id = fpi.fiche_prestation_id
JOIN items i ON fpi.item_id = i.id
WHERE fp.numero_fiche LIKE 'T1-L4-%';

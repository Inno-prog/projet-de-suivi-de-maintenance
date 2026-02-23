-- Add quantite_utilisee column to fiche_prestation_items table
ALTER TABLE fiche_prestation_items
ADD COLUMN quantite_utilisee INTEGER;

-- Verify the changes
SELECT * FROM fiche_prestation_items;

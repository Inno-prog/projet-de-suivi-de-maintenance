-- Add prix_unitaire and montant_total columns to fiches_prestation table
ALTER TABLE fiches_prestation 
ADD COLUMN prix_unitaire DOUBLE PRECISION,
ADD COLUMN montant_total DOUBLE PRECISION;

-- Update existing records with default values if needed
UPDATE fiches_prestation 
SET prix_unitaire = 50000,
    montant_total = quantite * 50000
WHERE quantite IS NOT NULL AND prix_unitaire IS NULL;

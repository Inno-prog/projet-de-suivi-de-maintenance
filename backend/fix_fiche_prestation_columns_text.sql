-- Convert remaining columns to TEXT type to handle any length
-- This fixes the "value too long for type character varying(255)" error

-- Convert long text columns to TEXT
ALTER TABLE fiches_prestation 
ALTER COLUMN commentaire TYPE TEXT;

ALTER TABLE fiches_prestation 
ALTER COLUMN fichiers_contrat TYPE TEXT;

ALTER TABLE fiches_prestation 
ALTER COLUMN items_couverts TYPE TEXT;

ALTER TABLE fiches_prestation 
ALTER COLUMN motif_rejet TYPE TEXT;

-- Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'fiches_prestation'
ORDER BY ordinal_position;

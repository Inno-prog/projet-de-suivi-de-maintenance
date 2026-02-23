-- Fix column length issues in fiches_prestation table
-- Error: "value too long for type character varying(255)"

-- Fix nom_prestataire column (increase to 500)
ALTER TABLE fiches_prestation 
ALTER COLUMN nom_prestataire TYPE VARCHAR(500);

-- Fix nom_structure column (increase to 500)
ALTER TABLE fiches_prestation 
ALTER COLUMN nom_structure TYPE VARCHAR(500);

-- Fix nom_item column (increase to 500)
ALTER TABLE fiches_prestation 
ALTER COLUMN nom_item TYPE VARCHAR(500);

-- Fix statut_intervention column (increase to 500)
ALTER TABLE fiches_prestation 
ALTER COLUMN statut_intervention TYPE VARCHAR(500);

-- Fix numero_fiche column (increase to 100)
ALTER TABLE fiches_prestation 
ALTER COLUMN numero_fiche TYPE VARCHAR(100);

-- Fix id_prestation column (increase to 100)
ALTER TABLE fiches_prestation 
ALTER COLUMN id_prestation TYPE VARCHAR(100);

-- Confirm changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'fiches_prestation';

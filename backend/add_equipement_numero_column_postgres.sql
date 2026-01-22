-- Migration to add numero column to equipements table
-- This column will store the equipment number (e.g., 5)
-- Items will then have sub-numbers like 5.1, 5.2, etc.

-- Add the numero column
ALTER TABLE equipements
ADD COLUMN numero INTEGER UNIQUE;

-- Create index for faster queries on equipment numbers
CREATE INDEX idx_equipements_numero ON equipements(numero);

-- Initialize existing equipment with sequential numbers
-- This will assign numbers 1, 2, 3, ... to existing equipment
WITH numbered_equipments AS (
    SELECT 
        id, 
        ROW_NUMBER() OVER (ORDER BY id) AS new_numero
    FROM equipements
)
UPDATE equipements e
SET numero = ne.new_numero
FROM numbered_equipments ne
WHERE e.id = ne.id;

-- Verify the migration
SELECT id, nom_equipement, numero 
FROM equipements 
ORDER BY numero;
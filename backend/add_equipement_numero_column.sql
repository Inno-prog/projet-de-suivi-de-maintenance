-- Migration to add numero column to equipements table
-- This column will store the equipment number (e.g., 5)
-- Items will then have sub-numbers like 5.1, 5.2, etc.

ALTER TABLE equipements
ADD COLUMN numero INTEGER UNIQUE;

-- Create index for faster queries on equipment numbers
CREATE INDEX idx_equipements_numero ON equipements(numero);

-- Initialize existing equipment with sequential numbers
-- This will assign numbers 1, 2, 3, ... to existing equipment
UPDATE equipements
SET numero = (
    SELECT COUNT(*) 
    FROM equipements e2 
    WHERE e2.id <= equipements.id
);

-- Verify the migration
SELECT id, nom_equipement, numero 
FROM equipements 
ORDER BY numero;
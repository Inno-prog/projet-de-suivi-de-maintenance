-- Migration to add timestamps to prestations table
ALTER TABLE prestations
ADD COLUMN date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to update date_modification on update
CREATE OR REPLACE FUNCTION update_prestation_modification_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prestation_update
BEFORE UPDATE ON prestations
FOR EACH ROW
EXECUTE FUNCTION update_prestation_modification_date();

-- For existing records, set date_creation to date_heure_debut if available, otherwise current timestamp
UPDATE prestations
SET date_creation = COALESCE(date_heure_debut, CURRENT_TIMESTAMP)
WHERE date_creation IS NULL;

-- For existing records, set date_modification to date_heure_fin if available, otherwise current timestamp
UPDATE prestations
SET date_modification = COALESCE(date_heure_fin, CURRENT_TIMESTAMP)
WHERE date_modification IS NULL;

COMMENT ON COLUMN prestations.date_creation IS 'Date et heure de création de la prestation';
COMMENT ON COLUMN prestations.date_modification IS 'Date et heure de dernière modification de la prestation';

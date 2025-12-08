-- Ajouter le champ quantite_utilisee_trimestre à la table items
ALTER TABLE items ADD COLUMN IF NOT EXISTS quantite_utilisee_trimestre INTEGER DEFAULT 0;

-- Mettre à jour les enregistrements existants
UPDATE items SET quantite_utilisee_trimestre = 0 WHERE quantite_utilisee_trimestre IS NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN items.quantite_utilisee_trimestre IS 'Quantité utilisée pour ce trimestre, remise à zéro à chaque début de trimestre';

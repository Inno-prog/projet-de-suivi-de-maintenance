-- Migration SQL pour ajouter le champ regions à la table contrats
ALTER TABLE contrats ADD COLUMN regions TEXT;

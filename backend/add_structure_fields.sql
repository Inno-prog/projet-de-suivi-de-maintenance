-- Script SQL pour ajouter les nouveaux champs à la table structures_mefp
-- Ce script peut être exécuté manuellement si nécessaire (Hibernate le fera automatiquement avec ddl-auto=update)

-- Ajouter le champ adresse_structure
ALTER TABLE structures_mefp 
ADD COLUMN IF NOT EXISTS adresse_structure VARCHAR(200);

-- Ajouter les champs du Correspondant Informatique (CI)
ALTER TABLE structures_mefp 
ADD COLUMN IF NOT EXISTS nom_ci VARCHAR(100);

ALTER TABLE structures_mefp 
ADD COLUMN IF NOT EXISTS prenom_ci VARCHAR(100);

ALTER TABLE structures_mefp 
ADD COLUMN IF NOT EXISTS contact_ci VARCHAR(100);

ALTER TABLE structures_mefp 
ADD COLUMN IF NOT EXISTS fonction_ci VARCHAR(100);

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'structures_mefp' 
AND column_name IN ('adresse_structure', 'nom_ci', 'prenom_ci', 'contact_ci', 'fonction_ci')
ORDER BY column_name;
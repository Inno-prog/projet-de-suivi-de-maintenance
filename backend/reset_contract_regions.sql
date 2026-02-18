-- Script pour réinitialiser la base de données et supprimer la table contrat_regions
-- Ce script résout le problème de contrainte de clé étrangère lors de la suppression de contrats

-- Supprimer la table contrat_regions (table de jointure Many-to-Many)
DROP TABLE IF EXISTS contrat_regions;

-- Supprimer les contraintes liées aux contrats et aux régions (si elles existent)
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name FROM information_schema.table_constraints 
              WHERE table_name = 'contrats' AND constraint_type = 'FOREIGN KEY' AND constraint_name LIKE '%region%') LOOP
        EXECUTE 'ALTER TABLE contrats DROP CONSTRAINT ' || r.constraint_name;
    END LOOP;
END $$;

-- Réinitialiser les données si nécessaire
-- ATTENTION: Cette section supprime toutes les données, ne l'exécutez pas si vous voulez conserver des informations
-- DELETE FROM contrats;
-- ALTER TABLE contrats ALTER COLUMN id RESTART WITH 1;

-- Vérifier les tables existantes
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%contrat%';

-- Vérifier les contraintes sur les contrats
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name 
FROM information_schema.table_constraints tc 
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name 
JOIN information_schema.key_column_usage kcu2 ON rc.unique_constraint_name = kcu2.constraint_name 
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = 'contrats';

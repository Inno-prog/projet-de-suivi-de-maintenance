-- Script to fix the foreign key constraint on contrats.prestataire_id
-- The prestataire_id column now stores Keycloak user IDs, not local database IDs

-- Remove the foreign key constraint
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name FROM information_schema.table_constraints 
              WHERE table_name = 'contrats' AND constraint_type = 'FOREIGN KEY' AND constraint_name LIKE '%prestataire%') LOOP
        EXECUTE 'ALTER TABLE contrats DROP CONSTRAINT ' || r.constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint: %', r.constraint_name;
    END LOOP;
END $$;

-- Verify the constraint was removed
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name 
FROM information_schema.table_constraints tc 
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name 
JOIN information_schema.key_column_usage kcu2 ON rc.unique_constraint_name = kcu2.constraint_name 
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = 'contrats';

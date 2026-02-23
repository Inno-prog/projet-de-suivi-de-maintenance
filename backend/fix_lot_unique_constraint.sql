-- Script pour supprimer la contrainte d'unicité sur lot_id dans la table contrats
-- Cette contrainte empêche d'avoir plusieurs contrats pour le même lot

-- Vérifier si la contrainte existe avant de la supprimer (PostgreSQL)
DO $$
BEGIN
    -- Supprimer la contrainte si elle existe
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'uk9i5s9jrbyums3ssryiqv6mgf7'
    ) THEN
        ALTER TABLE contrats DROP CONSTRAINT uk9i5s9jrbyums3ssryiqv6mgf7;
        RAISE NOTICE 'Contrainte uk9i5s9jrbyums3ssryiqv6mgf7 supprimée avec succès';
    ELSE
        RAISE NOTICE 'Contrainte uk9i5s9jrbyums3ssryiqv6mgf7 non trouvée';
    END IF;
END $$;

-- Alternative : Supprimer toute contrainte d'unicité sur lot_id si la contrainte a un nom différent
DO $$
BEGIN
    -- Chercher et supprimer toute contrainte unique sur la colonne lot_id
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname LIKE '%lot_id%' 
        AND indexdef LIKE '%UNIQUE%'
    ) THEN
        RAISE NOTICE 'Une contrainte unique sur lot_id existe et doit être supprimée manuellement';
    END IF;
END $$;

-- Vérification finale : s'assurer qu'il n'y a plus de contrainte d'unicité sur lot_id
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
WHERE 
    tc.table_name = 'contrats' 
    AND kcu.column_name = 'lot_id'
    AND tc.constraint_type = 'UNIQUE';

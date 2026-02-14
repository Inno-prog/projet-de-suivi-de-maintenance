-- Script to delete all dummy/fictitious records ("fiches factices") from the database
-- This script identifies and removes test records, dummy data, and fictitious entries
-- WARNING: This is a destructive operation - make sure to backup your database first!

-- Disable foreign key constraints to avoid errors
SET REFERENTIAL_INTEGRITY FALSE;

-- =====================================================
-- PART 1: Identify dummy records by common patterns
-- =====================================================

-- Create a temporary table to store dummy record IDs
CREATE TABLE IF NOT EXISTS TEMP_DUMMY_IDS (
    table_name VARCHAR(100),
    record_id VARCHAR(100)
);

-- =====================================================
-- PART 2: Delete dummy fiches_prestation records
-- =====================================================

-- Pattern 1: Records with test/dummy/factice in various fields
DELETE FROM fiches_prestation WHERE 
    LOWER(nom_prestataire) LIKE '%test%' OR
    LOWER(nom_prestataire) LIKE '%dummy%' OR
    LOWER(nom_prestataire) LIKE '%factice%' OR
    LOWER(nom_prestataire) LIKE '%test_%' OR
    LOWER(nom_prestataire) LIKE '%_test%' OR
    LOWER(nom_item) LIKE '%test%' OR
    LOWER(nom_item) LIKE '%dummy%' OR
    LOWER(nom_item) LIKE '%factice%' OR
    LOWER(commentaire) LIKE '%test%' OR
    LOWER(commentaire) LIKE '%dummy%' OR
    LOWER(commentaire) LIKE '%factice%' OR
    LOWER(id_prestation) LIKE '%test%' OR
    LOWER(id_prestation) LIKE '%dummy%' OR
    LOWER(id_prestation) LIKE '%-999' OR  -- Common test ID pattern
    id_prestation LIKE 'FP-TEST%' OR
    id_prestation LIKE 'FP-TEST%';

-- Pattern 2: Records with very short or suspicious values
DELETE FROM fiches_prestation WHERE 
    (nom_prestataire IS NOT NULL AND LENGTH(TRIM(nom_prestataire)) <= 2) OR
    (nom_item IS NOT NULL AND LENGTH(TRIM(nom_item)) <= 2) OR
    (nom_prestataire IS NOT NULL AND nom_prestataire SIMILAR TO '[A-Za-z0-9]{1,3}' AND nom_prestataire NOT IN ('DGSSI', 'DGSI', 'OC', 'MEFP'));

-- Pattern 3: Records with automatic/system-generated IDs that look like timestamps (test records)
DELETE FROM fiches_prestation WHERE 
    id_prestation REGEXP '^[0-9]{13,}$' AND
    (nom_prestataire IS NULL OR nom_prestataire = '' OR nom_prestataire LIKE 'Anonymous%');

-- =====================================================
-- PART 3: Delete dummy prestations records
-- =====================================================

-- Pattern 1: Records with test/dummy/factice in various fields
DELETE FROM prestations WHERE 
    LOWER(nom_prestataire) LIKE '%test%' OR
    LOWER(nom_prestataire) LIKE '%dummy%' OR
    LOWER(nom_prestataire) LIKE '%factice%' OR
    LOWER(nom_prestataire) LIKE '%test_%' OR
    LOWER(nom_prestataire) LIKE '%_test%' OR
    LOWER(nom_prestation) LIKE '%test%' OR
    LOWER(nom_prestation) LIKE '%dummy%' OR
    LOWER(nom_prestation) LIKE '%factice%' OR
    LOWER(description) LIKE '%test%' OR
    LOWER(description) LIKE '%dummy%' OR
    LOWER(description) LIKE '%factice%';

-- Pattern 2: Records with very short suspicious values
DELETE FROM prestations WHERE 
    (nom_prestataire IS NOT NULL AND LENGTH(TRIM(nom_prestataire)) <= 2) OR
    (nom_prestation IS NOT NULL AND LENGTH(TRIM(nom_prestation)) <= 2);

-- =====================================================
-- PART 4: Delete all records with negative IDs (test data)
-- =====================================================

-- Note: These are typically test records created during development
-- Uncomment if you want to delete ALL negative ID records

-- DELETE FROM fiches_prestation WHERE id < 0;
-- DELETE FROM prestations WHERE id < 0;

-- =====================================================
-- PART 5: Clean up orphaned records
-- =====================================================

-- Delete fiches_prestation that reference non-existent prestations
DELETE FROM fiches_prestation WHERE 
    id_prestation IS NOT NULL AND
    LENGTH(TRIM(id_prestation)) > 0 AND
    NOT EXISTS (SELECT 1 FROM prestations WHERE CAST(id AS VARCHAR) = id_prestation);

-- =====================================================
-- PART 6: Reset auto-increment counters (if needed)
-- =====================================================

-- For H2 Database:
ALTER TABLE fiches_prestation ALTER COLUMN id RESTART WITH 1;
ALTER TABLE prestations ALTER COLUMN id RESTART WITH 1;

-- =====================================================
-- PART 7: Verify deletion
-- =====================================================

-- Count remaining records
SELECT 'fiches_prestation' as table_name, COUNT(*) as remaining_count FROM fiches_prestation
UNION ALL
SELECT 'prestations' as table_name, COUNT(*) as remaining_count FROM prestations;

-- Show sample of remaining records for verification
SELECT 'Sample fiches_prestation:' as info;
SELECT id, id_prestation, nom_prestataire, nom_item, statut FROM fiches_prestation LIMIT 5;

SELECT 'Sample prestations:' as info;
SELECT id, nom_prestataire, nom_prestation, trimestre FROM prestations LIMIT 5;

-- Enable foreign key constraints again
SET REFERENTIAL_INTEGRITY TRUE;

-- Output success message
SELECT '✅ Cleanup completed successfully!' as message;


-- Script to add missing prestataires to the database
-- This script adds the prestataires "inno inno" and "test2 test2" that are referenced in contracts

-- =====================================================
-- PART 1: ADD MISSING PRESTATAIRES TO USERS TABLE
-- =====================================================

-- Add "inno inno" prestataire
INSERT INTO users (id, nom, email, password, contact, adresse, role, created_at, updated_at, user_type)
VALUES (
    'inno-inno-id-' || floor(random() * 1000000),
    'inno inno',
    'inno@gmail.com',
    '$2a$10$rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV', -- Dummy password
    '0123456789',
    'Ouagadougou, Burkina Faso',
    'PRESTATAIRE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Prestataire'
)
ON CONFLICT (email) DO NOTHING;

-- Add "test2 test2" prestataire
INSERT INTO users (id, nom, email, password, contact, adresse, role, created_at, updated_at, user_type)
VALUES (
    'test2-test2-id-' || floor(random() * 1000000),
    'test2 test2',
    'test2@gmail.com',
    '$2a$10$rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV8rV', -- Dummy password
    '0123456789',
    'Ouagadougou, Burkina Faso',
    'PRESTATAIRE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Prestataire'
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- PART 2: ADD MISSING PRESTATAIRES TO PRESTATAIRES TABLE
-- =====================================================

-- Add "inno inno" to prestataires table
INSERT INTO prestataires (id, qualification, structure, direction)
SELECT 
    id,
    'Prestataire de services informatiques',
    'inno inno',
    'Direction Informatique'
FROM users 
WHERE email = 'inno@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Add "test2 test2" to prestataires table
INSERT INTO prestataires (id, qualification, structure, direction)
SELECT 
    id,
    'Prestataire de services informatiques',
    'test2 test2',
    'Direction Informatique'
FROM users 
WHERE email = 'test2@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PART 3: VERIFY THE ADDITION
-- =====================================================

SELECT '=== PRESTATAIRES AJOUTES ===' as info;
SELECT u.id, u.nom, u.email, p.structure
FROM users u
JOIN prestataires p ON u.id = p.id
WHERE u.nom IN ('inno inno', 'test2 test2');

-- =====================================================
-- PART 4: UPDATE CONTRACTS WITH PRESTATAIRE_ID
-- =====================================================

UPDATE contrats c
SET prestataire_id = (
    SELECT u.id 
    FROM users u
    JOIN prestataires p ON u.id = p.id
    WHERE LOWER(p.structure) = LOWER(c.nom_prestataire)
    LIMIT 1
)
WHERE (c.prestataire_id IS NULL OR c.prestataire_id = '')
AND EXISTS (
    SELECT 1 
    FROM users u
    JOIN prestataires p ON u.id = p.id
    WHERE LOWER(p.structure) = LOWER(c.nom_prestataire)
);

-- =====================================================
-- PART 5: VERIFY THE UPDATE
-- =====================================================

SELECT '=== VERIFICATION DES CONTRATS ===' as info;
SELECT 
    COUNT(*) as total_contrats,
    SUM(CASE WHEN prestataire_id IS NULL OR prestataire_id = '' THEN 1 ELSE 0 END) as sans_prestataire_id,
    SUM(CASE WHEN prestataire_id IS NOT NULL AND prestataire_id != '' THEN 1 ELSE 0 END) as avec_prestataire_id
FROM contrats;

-- Show contracts with their prestataire details
SELECT '=== DETAILS DES CONTRATS ET PRESTATAIRES ===' as info;
SELECT 
    c.id,
    c.id_contrat,
    c.nom_prestataire,
    c.prestataire_id,
    u.nom as user_nom,
    p.structure as prestataire_structure,
    u.email
FROM contrats c
LEFT JOIN users u ON c.prestataire_id = u.id
LEFT JOIN prestataires p ON u.id = p.id
ORDER BY c.nom_prestataire;

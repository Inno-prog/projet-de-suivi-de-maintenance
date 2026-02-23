-- Script to fix prestataire_id in existing contracts using structure field instead of nom
-- This script addresses the issue where prestataires cannot see their contracts due to incorrect mapping

-- =====================================================
-- PART 1: DIAGNOSTIC - Current state of contracts
-- =====================================================

SELECT '=== ETAT ACTUEL DES CONTRATS ===' as info;
SELECT 
    COUNT(*) as total_contrats,
    SUM(CASE WHEN prestataire_id IS NULL OR prestataire_id = '' THEN 1 ELSE 0 END) as sans_prestataire_id,
    SUM(CASE WHEN prestataire_id IS NOT NULL AND prestataire_id != '' THEN 1 ELSE 0 END) as avec_prestataire_id
FROM contrats;

-- Show contracts without prestataire_id
SELECT '=== CONTRATS SANS PRESTATAIRE_ID ===' as info;
SELECT id, id_contrat, nom_prestataire, prestataire_id, statut
FROM contrats 
WHERE prestataire_id IS NULL OR prestataire_id = ''
ORDER BY nom_prestataire;

-- Show unique prestataire names in contracts (to help with mapping)
SELECT '=== NOMS DE PRESTATAIRES UNIQUES DANS LES CONTRATS ===' as info;
SELECT DISTINCT nom_prestataire, COUNT(*) as nombre_contrats
FROM contrats 
WHERE prestataire_id IS NULL OR prestataire_id = ''
GROUP BY nom_prestataire
ORDER BY nom_prestataire;

-- Show prestataires in database with their structure information
SELECT '=== PRESTATAIRES DANS LA BASE DE DONNEES ===' as info;
SELECT u.id, u.nom, p.structure, u.email
FROM users u
JOIN prestataires p ON u.id = p.id
WHERE u.role = 'PRESTATAIRE';

-- =====================================================
-- PART 2: DIRECT UPDATE USING STRUCTURE FIELD
-- =====================================================

-- Update contracts with prestataire_id using the correct structure field
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
-- PART 3: VERIFICATION AFTER UPDATE
-- =====================================================

SELECT '=== VERIFICATION APRES MISE A JOUR ===' as info;
SELECT 
    COUNT(*) as total_contrats,
    SUM(CASE WHEN prestataire_id IS NULL OR prestataire_id = '' THEN 1 ELSE 0 END) as sans_prestataire_id,
    SUM(CASE WHEN prestataire_id IS NOT NULL AND prestataire_id != '' THEN 1 ELSE 0 END) as avec_prestataire_id
FROM contrats;

-- Show contracts that still don't have prestataire_id
SELECT '=== CONTRATS TOUJOURS SANS PRESTATAIRE_ID ===' as info;
SELECT id, id_contrat, nom_prestataire, prestataire_id, statut
FROM contrats 
WHERE prestataire_id IS NULL OR prestataire_id = ''
ORDER BY nom_prestataire;

-- Show contracts with their prestataire_id (sample)
SELECT '=== CONTRATS AVEC PRESTATAIRE_ID (ECHANTILLON) ===' as info;
SELECT id, id_contrat, nom_prestataire, prestataire_id, statut
FROM contrats 
WHERE prestataire_id IS NOT NULL AND prestataire_id != ''
ORDER BY nom_prestataire
LIMIT 10;

-- Show contracts with their corresponding prestataire details
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
WHERE c.prestataire_id IS NOT NULL
ORDER BY c.nom_prestataire;

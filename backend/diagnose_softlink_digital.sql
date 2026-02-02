-- ================================================
-- DIAGNOSTIC: Softlink Technologies & Digital Solutions
-- ================================================

-- 1. Check ALL prestataires with their emails
SELECT 
    u.id,
    u.email,
    u.nom,
    u.dtype,
    p.structure as company_name
FROM users u
LEFT JOIN prestataires p ON u.id = p.id
WHERE u.dtype = 'Prestataire'
ORDER BY u.nom;

-- 2. Check ALL contrats and their prestataire links
SELECT 
    c.id,
    c.id_contrat,
    c.nom_prestataire,
    c.lot,
    c.prestataire_id,
    c.statut,
    p.id as prestataire_db_id,
    p.structure as prestataire_structure
FROM contrats c
LEFT JOIN prestataires p ON c.prestataire_id = p.id
ORDER BY c.nom_prestataire;

-- 3. Check items and their lots
SELECT 
    i.id,
    i.nom_item,
    i.lot,
    i.id_item
FROM items i
ORDER BY i.lot, i.nom_item;

-- 4. Check if Digital Solutions has contracts (by name or by looking for similar)
SELECT * FROM contrats 
WHERE LOWER(nom_prestataire) LIKE '%digital%'
   OR LOWER(nom_prestataire) LIKE '%solution%'
   OR id_prestataire IS NULL;

-- 5. Check if SoftLink Technologies has contracts
SELECT * FROM contrats 
WHERE LOWER(nom_prestataire) LIKE '%softlink%'
   OR LOWER(nom_prestataire) LIKE '%soft link%';

-- 6. Check prestations by prestataire name for T1
SELECT 
    p.id,
    p.nom_prestataire,
    p.trimestre,
    p.statut_validation,
    p.montant_intervention
FROM prestations p
WHERE p.trimestre = 'T1'
ORDER BY p.nom_prestataire;

-- 7. Check fiches_prestation linked to prestations
SELECT 
    f.id,
    f.id_prestation,
    f.nom_prestataire,
    f.statut,
    f.numero_fiche
FROM fiches_prestation f
WHERE f.id_prestation IN (
    SELECT p.id FROM prestations p WHERE p.trimestre = 'T1'
)
ORDER BY f.nom_prestataire;

-- ================================================
-- FIXES (Run only if needed)
-- ================================================

-- FIX 1: Link Digital Solutions contract to prestataire (if needed)
-- First, find the prestataire ID:
-- SELECT id, email, structure FROM prestataires WHERE LOWER(structure) LIKE '%digital%';

-- Then update the contract:
-- UPDATE contrats SET prestataire_id = 'PRESTATAIRE_UUID' WHERE id = CONTRAT_ID;

-- FIX 2: If Softlink has wrong lot in contracts
-- Check the lot value:
-- SELECT id_contrat, nom_prestataire, lot FROM contrats WHERE LOWER(nom_prestataire) LIKE '%softlink%';

-- Update if needed:
-- UPDATE contrats SET lot = 'Lot 4' WHERE nom_prestataire = 'SoftLink Technologies';

-- FIX 3: Check if items have correct lot values for Digital Solutions
-- SELECT id, nom_item, lot FROM items WHERE lot IS NULL OR lot = '';

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Verify SoftLink Technologies fiches
SELECT 
    f.id,
    f.id_prestation,
    f.nom_prestataire,
    f.statut,
    p.trimestre,
    p.montant_intervention
FROM fiches_prestation f
JOIN prestations p ON f.id_prestation = p.id::text
WHERE LOWER(f.nom_prestataire) LIKE '%softlink%'
   AND p.trimestre = 'T1';

-- Verify Digital Solutions can see items (by checking items for their lots)
-- First find Digital Solutions' lots:
-- SELECT lot FROM contrats WHERE LOWER(nom_prestataire) LIKE '%digital%';

-- Then check items for those lots:
-- SELECT * FROM items WHERE lot IN ('Lot X', 'Lot Y');


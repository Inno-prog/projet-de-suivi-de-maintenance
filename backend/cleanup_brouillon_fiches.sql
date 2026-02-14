-- Cleanup script to remove fiches created from brouillon prestations
-- This fixes the issue where brouillon prestations still show in admin dashboard

-- First, let's see which fiches are linked to brouillon prestations
SELECT 
    fp.id as fiche_id,
    fp.id_prestation,
    fp.nom_prestataire,
    fp.statut as fiche_statut,
    p.statut_validation as prestation_statut_validation
FROM fiches_prestation fp
LEFT JOIN prestations p ON fp.id_prestation::bigint = p.id
WHERE p.statut_validation = 'BROUILLON' OR p.statut_validation IS NULL;

-- Now delete those fiches (only if they are EN_ATTENTE - not validated)
-- We keep validated fiches as they should remain visible
DELETE FROM fiches_prestation 
WHERE id_prestation IN (
    SELECT fp.id_prestation 
    FROM fiches_prestation fp
    LEFT JOIN prestations p ON fp.id_prestation::bigint = p.id
    WHERE p.statut_validation = 'BROUILLON' OR p.statut_validation IS NULL
)
AND statut = 'EN_ATTENTE';

-- Also update the linked prestations to remove their reference to these deleted fiches
-- This is handled by database constraints automatically

-- Verify the cleanup
SELECT 
    COUNT(*) as total_fiches,
    SUM(CASE WHEN statut = 'VALIDE' THEN 1 ELSE 0 END) as validated,
    SUM(CASE WHEN statut = 'EN_ATTENTE' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN statut = 'REJETE' THEN 1 ELSE 0 END) as rejected
FROM fiches_prestation;

-- Check how many brouillon-linked fiches remain (there shouldn't be any EN_ATTENTE)
SELECT 
    fp.id as fiche_id,
    fp.id_prestation,
    fp.nom_prestataire,
    fp.statut as fiche_statut,
    p.statut_validation as prestation_statut_validation
FROM fiches_prestation fp
LEFT JOIN prestations p ON fp.id_prestation::bigint = p.id
WHERE p.statut_validation = 'BROUILLON' OR p.statut_validation IS NULL;

-- Note: This cleanup script removes fiches that were created from brouillon prestations
-- But if you want to keep some data, you might want to:
-- 1. Update the brouillon prestations to set statutValidation = 'EN_ATTENTE' manually
-- 2. Then submit them properly through the UI


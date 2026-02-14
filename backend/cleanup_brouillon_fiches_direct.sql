-- Script SQL pour nettoyer directement les fiches de prestations en brouillon
-- Exécuter ce script dans la base de données (psql ou interface pgAdmin)

-- Étape 1: Identifier les fiches liées à des prestations en brouillon
-- Une prestation est en brouillon si son statutValidation = 'BROUILLON'

-- Afficher d'abord les fiches qui seront supprimées (sans supprimer)
SELECT 
    fp.id as fiche_id,
    fp.id_prestation,
    fp.nom_prestataire,
    fp.nom_item,
    fp.statut as fiche_statut,
    p.statut_validation as prestation_statut_validation
FROM fiches_prestation fp
LEFT JOIN prestations p ON fp.id_prestation = p.id::text
WHERE p.statut_validation = 'BROUILLON'
   OR p.statut_validation IS NULL
ORDER BY fp.id;

-- Étape 2: Supprimer les fiches liées à des prestations en brouillon
-- ATTENTION: Cette opération est irréversible!

-- Compter avant suppression
SELECT COUNT(*) as fiches_a_supprimer
FROM fiches_prestation fp
LEFT JOIN prestations p ON fp.id_prestation = p.id::text
WHERE p.statut_validation = 'BROUILLON'
   OR p.statut_validation IS NULL;

-- Supprimer les fiches
DELETE FROM fiches_prestation fp
WHERE EXISTS (
    SELECT 1 FROM prestations p 
    WHERE p.id::text = fp.id_prestation 
    AND p.statut_validation = 'BROUILLON'
);

-- Vérifier les fiches restantes
SELECT COUNT(*) as fiches_restantes FROM fiches_prestation;

-- Alternative: Supprimer aussi les fiches dont la prestation n'existe plus
-- (ces fiches sont orphelines et ne devraient pas exister)
DELETE FROM fiches_prestation fp
WHERE NOT EXISTS (
    SELECT 1 FROM prestations p 
    WHERE p.id::text = fp.id_prestation
);

-- Vérifier l'état actuel
SELECT 
    fp.statut,
    COUNT(*) as nombre_fiches
FROM fiches_prestation fp
LEFT JOIN prestations p ON fp.id_prestation = p.id::text
GROUP BY fp.statut;

-- Afficher les fiches restantes pour vérification
SELECT 
    fp.id,
    fp.id_prestation,
    fp.nom_prestataire,
    fp.nom_item,
    fp.statut,
    p.statut_validation
FROM fiches_prestation fp
LEFT JOIN prestations p ON fp.id_prestation = p.id::text
ORDER BY fp.id DESC
LIMIT 20;

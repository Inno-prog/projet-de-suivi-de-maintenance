-- Script SQL pour mettre à jour les montants des contrats basés sur les fiches validées
-- Ce script calcule le montant total de toutes les fiches validées pour chaque prestataire
-- et met à jour le montant restant des contrats en conséquence

-- Note: Ce script suppose que:
-- 1. La table des contrats s'appelle "contrats"
-- 2. La table des fiches de prestation s'appelle "fiches_prestation"
-- 3. Le montant de la fiche est stocké dans "montant_total" ou "prix_unitaire" * "quantite"

-- Étape 1: Calculer le montant total des prestations validées par prestataire
-- Cette requête crée une vue temporaire avec les montants validés par prestataire
WITH PrestationsValidees AS (
    SELECT 
        fp.nom_prestataire,
        COALESCE(SUM(fp.montant_total), 0) as montant_total_fiches,
        COUNT(fp.id) as nombre_fiches
    FROM fiches_prestation fp
    WHERE fp.statut = 'VALIDE'
    GROUP BY fp.nom_prestataire
)
SELECT 
    pv.nom_prestataire,
    pv.montant_total_fiches,
    pv.nombre_fiches,
    c.montant as montant_initial,
    c.montant_restant,
    (c.montant - pv.montant_total_fiches) as nouveau_montant_restant
FROM PrestationsValidees pv
LEFT JOIN contrats c ON c.nom_prestataire = pv.nom_prestataire
WHERE c.statut = 'ACTIF'
ORDER BY pv.montant_total_fiches DESC;

-- Étape 2: Mettre à jour les montants restants des contrats
-- Cette requête met à jour le montant_restant pour chaque contrat actif
-- en déduisant le montant total des fiches validées

UPDATE contrats c
SET montant_restant = (
    SELECT GREATEST(0, COALESCE(c.montant, 0) - COALESCE((
        SELECT SUM(fp.montant_total)
        FROM fiches_prestation fp
        WHERE fp.nom_prestataire = c.nom_prestataire
        AND fp.statut = 'VALIDE'
    ), 0))
)
WHERE c.statut = 'ACTIF';

-- Vérifier
SELECT 
    c.id_contrat,
    le résultat c.nom_prestataire,
    c.montant as montant_initial,
    c.montant_restant,
    (
        SELECT COALESCE(SUM(fp.montant_total), 0)
        FROM fiches_prestation fp
        WHERE fp.nom_prestataire = c.nom_prestataire
        AND fp.statut = 'VALIDE'
    ) as montant_fiches_validees,
    (
        SELECT COUNT(fp.id)
        FROM fiches_prestation fp
        WHERE fp.nom_prestataire = c.nom_prestataire
        AND fp.statut = 'VALIDE'
    ) as nombre_fiches_validees
FROM contrats c
WHERE c.statut = 'ACTIF'
ORDER BY c.nom_prestataire;

-- Script alternatif: Utiliser prix_unitaire * quantite si montant_total est NULL
-- Si montant_total n'est pas renseigné, on calcule: prix_unitaire * quantite

-- Mettre à jour montant_total à partir de prix_unitaire et quantite pour les fiches qui n'ont pas de montant_total
UPDATE fiches_prestation fp
SET montant_total = COALESCE(fp.montant_total, fp.prix_unitaire * fp.quantite)
WHERE fp.montant_total IS NULL
AND (fp.prix_unitaire IS NOT NULL AND fp.quantite IS NOT NULL);

-- Recalculer les montants restants après mise à jour des fiches
UPDATE contrats c
SET montant_restant = (
    SELECT GREATEST(0, COALESCE(c.montant, 0) - COALESCE((
        SELECT SUM(COALESCE(fp.montant_total, fp.prix_unitaire * fp.quantite))
        FROM fiches_prestation fp
        WHERE fp.nom_prestataire = c.nom_prestataire
        AND fp.statut = 'VALIDE'
    ), 0))
)
WHERE c.statut = 'ACTIF';

-- Vérification finale: Listes des prestataires avec leurs contrats et le montant consommé
SELECT 
    c.id_contrat,
    c.nom_prestataire,
    c.montant as contrat_initial,
    c.montant_restant as contrat_restant,
    ROUND(( - c.montant_restant),c.montant 2) as montant_consomme,
    ROUND(((c.montant - c.montant_restant) / NULLIF(c.montant, 0) * 100), 2) as pourcentage_consomme,
    (
        SELECT COUNT(*) 
        FROM fiches_prestation fp 
        WHERE fp.nom_prestataire = c.nom_prestataire 
        AND fp.statut = 'VALIDE'
    ) as fiches_validees
FROM contrats c
WHERE c.statut = 'ACTIF'
ORDER BY montant_consomme DESC;


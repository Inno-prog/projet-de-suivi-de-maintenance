-- Script pour renuméroter les fiches de prestation
-- Objectif: Les 6 fiches existantes doivent avoir des numéros de 1 à 6

-- Étape 1: Vérifier l'état actuel des fiches
-- ===========================================
SELECT id, id_prestation, nom_prestataire, numero_fiche, date_realisation
FROM fiches_prestation
ORDER BY id;

-- Compter le nombre total de fiches
SELECT COUNT(*) as total_fiches FROM fiches_prestation;

-- Vérifier les numéros utilisés
SELECT numero_fiche, COUNT(*) as count 
FROM fiches_prestation 
WHERE numero_fiche IS NOT NULL 
GROUP BY numero_fiche 
ORDER BY numero_fiche;

-- Étape 2: Réinitialiser tous les numéros de fiche à NULL
-- ========================================================
UPDATE fiches_prestation SET numero_fiche = NULL;

-- Étape 3: Re-numéroter séquentiellement à partir de 1
-- =====================================================
-- Cette requête met à jour les fiches en utilisant ROW_NUMBER()
-- pour assigner des numéros séquentiels basés sur l'ID (ordre de création)

-- Pour H2 Database:
UPDATE fiches_prestation fp
SET numero_fiche = (
    SELECT rn
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
        FROM fiches_prestation
    ) ranked
    WHERE ranked.id = fp.id
);

-- Étape 4: Vérifier le résultat après renumérotation
-- ===================================================
SELECT id, id_prestation, nom_prestataire, numero_fiche, date_realisation
FROM fiches_prestation
ORDER BY id;

-- Vérifier que nous avons 6 fiches avec les numéros 1 à 6
SELECT 
    MIN(numero_fiche) as min_num,
    MAX(numero_fiche) as max_num,
    COUNT(*) as total_fiches,
    MAX(numero_fiche) - MIN(numero_fiche) + 1 as expected_range
FROM fiches_prestation;

-- Étape 5: Alternative avec numérotation par date (plus récente = 1)
-- ==================================================================
-- Si vous préférez numéroter par date de réalisation (la plus récente = 1):
/*
UPDATE fiches_prestation fp
SET numero_fiche = (
    SELECT rn
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY date_realisation DESC) as rn
        FROM fiches_prestation
    ) ranked
    WHERE ranked.id = fp.id
);
*/

-- NOTE: Après exécution, redémarrer le backend pour que les nouveaux numéros soient utilisés
-- Le prochain numéro de fiche créé sera: 7 (si tous les 1-6 sont utilisés)
-- ou réutilisera un numéro disponible (1-6) si des fiches ont été supprimées

-- Vérification finale: lister tous les numéros de fiche
SELECT numero_fiche FROM fiches_prestation ORDER BY numero_fiche;


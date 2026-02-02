-- Script H2 pour renuméroter les fiches de prestation
-- Objectif: Les 6 fiches existantes doivent avoir des numéros de 1 à 6

-- Étape 1: Vérifier l'état actuel des fiches
-- ===========================================
SELECT ID, ID_PRESTATION, NOM_PRESTATAIRE, NUMERO_FICHE, DATE_REALISATION
FROM FICHES_PRESTATION
ORDER BY ID;

-- Compter le nombre total de fiches
SELECT COUNT(*) AS TOTAL_FICHES FROM FICHES_PRESTATION;

-- Étape 2: Réinitialiser tous les numéros de fiche à NULL
-- ========================================================
UPDATE FICHES_PRESTATION SET NUMERO_FICHE = NULL;

-- Étape 3: Re-numéroter séquentiellement à partir de 1
-- Pour H2, on utilise une sous-requête avec IDENTITY()
-- =====================================================
MERGE INTO FICHES_PRESTATION KEY(ID) 
SELECT fp.ID, fp.ID_PRESTATION, fp.NOM_PRESTATAIRE, fp.NOM_ITEM, fp.NOM_STRUCTURE,
       fp.ITEMS_COUVERTS, fp.DATE_REALISATION, fp.STATUT, fp.QUANTITE, fp.PRIX_UNITAIRE,
       fp.MONTANT_TOTAL, fp.COMMENTAIRE, FICHIERS_CONTRAT, fp.STATUT_INTERVENTION,
       fp.PRESTATAIRE_ID,
       (SELECT COUNT(*) + 1 FROM FICHES_PRESTATION fp2 WHERE fp2.ID < fp.ID) AS NEW_NUMERO
FROM FICHES_PRESTATION fp;

-- Étape 4: Vérifier le résultat après renumérotation
-- ===================================================
SELECT ID, ID_PRESTATION, NOM_PRESTATAIRE, NUMERO_FICHE, DATE_REALISATION
FROM FICHES_PRESTATION
ORDER BY ID;

-- Vérifier que nous avons 6 fiches avec les numéros 1 à 6
SELECT 
    MIN(NUMERO_FICHE) AS MIN_NUM,
    MAX(NUMERO_FICHE) AS MAX_NUM,
    COUNT(*) AS TOTAL_FICHES
FROM FICHES_PRESTATION;

-- Lister tous les numéros de fiche
SELECT NUMERO_FICHE FROM FICHES_PRESTATION ORDER BY NUMERO_FICHE;

-- NOTE: Après exécution, redémarrer le backend pour que les nouveaux numéros soient utilisés


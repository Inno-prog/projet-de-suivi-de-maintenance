-- Script simple pour renuméroter les fiches de 1 à N
-- Ce script utilise des mises à jour individuelles pour H2

-- Étape 1: Réinitialiser tous les numéros à NULL
UPDATE FICHES_PRESTATION SET NUMERO_FICHE = NULL;

-- Étape 2: Mettre à jour les fiches une par une avec des numéros séquentiels
-- La première fiche créée (ID le plus petit) получит le numéro 1
-- La deuxième получит le numéro 2, etc.

-- Pour la base H2, nous devons utiliser une approche différente:
-- Nous allons créer une table temporaire avec les nouveaux numéros

-- Créer une table temporaire pour stocker les nouveaux numéros
DROP TABLE IF EXISTS FICHES_TEMP_NUMS;
CREATE TABLE FICHES_TEMP_NUMS AS
SELECT ID, ROW_NUMBER() OVER (ORDER BY ID) AS NEW_NUMERO
FROM FICHES_PRESTATION;

-- Vérifier le contenu de la table temporaire
SELECT * FROM FICHES_TEMP_NUMS;

-- Mettre à jour la table principale avec les nouveaux numéros
UPDATE FICHES_PRESTATION fp
SET NUMERO_FICHE = (
    SELECT tn.NEW_NUMERO 
    FROM FICHES_TEMP_NUMS tn 
    WHERE tn.ID = fp.ID
);

-- Nettoyer
DROP TABLE FICHES_TEMP_NUMS;

-- Étape 3: Vérifier le résultat
SELECT ID, ID_PRESTATION, NOM_PRESTATAIRE, NUMERO_FICHE 
FROM FICHES_PRESTATION 
ORDER BY ID;

-- Vérification finale
SELECT 
    MIN(NUMERO_FICHE) AS MIN_NUM,
    MAX(NUMERO_FICHE) AS MAX_NUM,
    COUNT(*) AS TOTAL
FROM FICHES_PRESTATION;


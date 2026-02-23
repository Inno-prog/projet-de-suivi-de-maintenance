-- Script de diagnostic pour la recherche de contrats par prestataire
-- Ce script aide à identifier pourquoi un prestataire ne voit pas ses contrats

-- 1. Vérifier tous les contrats et leur statut
SELECT 
    c.id,
    c.id_contrat,
    c.nom_prestataire,
    c.prestataire_id,
    c.statut,
    c.date_debut,
    c.date_fin
FROM contrats c
ORDER BY c.nom_prestataire;

-- 2. Vérifier les contrats avec statut ACTIF
SELECT 
    c.id,
    c.id_contrat,
    c.nom_prestataire,
    c.prestataire_id,
    c.statut
FROM contrats c
WHERE c.statut = 'ACTIF'
ORDER BY c.nom_prestataire;

-- 3. Vérifier les contrats avec statut différent de ACTIF
SELECT 
    c.id,
    c.id_contrat,
    c.nom_prestataire,
    c.prestataire_id,
    c.statut
FROM contrats c
WHERE c.statut != 'ACTIF'
ORDER BY c.statut, c.nom_prestataire;

-- 4. Rechercher un contrat spécifique par prestataire_id (remplacer 'VOTRE_ID' par l'ID du prestataire)
-- SELECT * FROM contrats WHERE prestataire_id = '0e4114b4-1136-4eed-ad91-5fb7d92e8bb8';

-- 5. Rechercher un contrat par nom_prestataire (insensible à la casse)
-- SELECT * FROM contrats WHERE LOWER(nom_prestataire) LIKE LOWER('%NOM_PRESTATAIRE%');

-- 6. Vérifier si le prestataire existe dans la table prestataires
-- SELECT * FROM prestataires WHERE id = '0e4114b4-1136-4eed-ad91-5fb7d92e8bb8';

-- 7. Comparer les valeurs de statut (vérifier les espaces, casse, etc.)
SELECT DISTINCT statut, LENGTH(statut) as statut_length FROM contrats;

-- 8. Vérifier les contrats sans prestataire_id
SELECT 
    c.id,
    c.id_contrat,
    c.nom_prestataire,
    c.prestataire_id,
    c.statut
FROM contrats c
WHERE c.prestataire_id IS NULL OR c.prestataire_id = '';

-- 9. Requête de test pour simuler la recherche par prestataireId avec statut ACTIF
-- Remplacer 'VOTRE_ID' par l'ID du prestataire à tester
-- SELECT * FROM contrats 
-- WHERE prestataire_id = '0e4114b4-1136-4eed-ad91-5fb7d92e8bb8' 
-- AND statut = 'ACTIF';

-- 10. Requête de test sans filtre de statut
-- SELECT * FROM contrats 
-- WHERE prestataire_id = '0e4114b4-1136-4eed-ad91-5fb7d92e8bb8';

-- 11. Vérifier les valeurs NULL ou vides dans les colonnes importantes
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN prestataire_id IS NULL THEN 1 ELSE 0 END) as null_prestataire_id,
    SUM(CASE WHEN prestataire_id = '' THEN 1 ELSE 0 END) as empty_prestataire_id,
    SUM(CASE WHEN nom_prestataire IS NULL THEN 1 ELSE 0 END) as null_nom_prestataire,
    SUM(CASE WHEN nom_prestataire = '' THEN 1 ELSE 0 END) as empty_nom_prestataire,
    SUM(CASE WHEN statut IS NULL THEN 1 ELSE 0 END) as null_statut
FROM contrats;

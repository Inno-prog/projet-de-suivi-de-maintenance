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

-- 2. Vérifier le prestataire spécifique
SELECT * FROM prestataires WHERE id = '0e4114b4-1136-4eed-ad91-5fb7d92e8bb8';

-- 3. Vérifier les contrats associés à ce prestataire (tous statuts)
SELECT * FROM contrats WHERE prestataire_id = '0e4114b4-1136-4eed-ad91-5fb7d92e8bb8';

-- 4. Vérifier les contrats par nom de prestataire (si le prestataire a un nom)
SELECT * FROM contrats WHERE LOWER(nom_prestataire) LIKE LOWER('%Digital%');

-- 5. Vérifier les contrats avec statut ACTIF pour ce prestataire
SELECT * FROM contrats 
WHERE prestataire_id = '0e4114b4-1136-4eed-ad91-5fb7d92e8bb8' 
AND statut = 'ACTIF';

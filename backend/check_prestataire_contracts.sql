-- Script SQL pour vérifier les liens entre prestataires et contrats
-- Connectez-vous à la base de données H2 sur http://localhost:8085/h2-console

-- 1. Vérifier la table des contrats et les prestataires associés
SELECT 
    c.id,
    c.nom_prestataire,
    c.prestataire_id,
    c.lot,
    c.lot_id,
    c.statut,
    p.id as prestataire_db_id,
    p.nom as prestataire_nom,
    l.nom_lot
FROM contrats c
LEFT JOIN prestataires p ON c.prestataire_id = p.id
LEFT JOIN lots l ON c.lot_id = l.id
ORDER BY c.nom_prestataire;

-- 2. Vérifier les prestataires dans la table users
SELECT 
    u.id,
    u.email,
    u.nom,
    u.role,
    u.dtype,
    p.id as prestataire_id,
    p.direction,
    p.qualification
FROM users u
LEFT JOIN prestataires p ON u.id = p.id
WHERE u.dtype = 'Prestataire'
ORDER BY u.nom;

-- 3. Vérifier les lots des contrats
SELECT 
    c.id as contrat_id,
    c.nom_prestataire,
    c.lot,
    l.id as lot_id,
    l.nom_lot,
    COUNT(DISTINCT i.id) as nb_items
FROM contrats c
LEFT JOIN lots l ON c.lot_id = l.id
LEFT JOIN items i ON i.lot = c.lot
WHERE c.statut = 'ACTIF'
GROUP BY c.id, c.nom_prestataire, c.lot, l.id, l.nom_lot
ORDER BY c.nom_prestataire;

-- 4. Vérifier les items et leurs lots
SELECT 
    i.id,
    i.nom_item,
    i.lot,
    COUNT(DISTINCT c.id) as nb_contrats_associes
FROM items i
LEFT JOIN contrats c ON c.lot = i.lot AND c.statut = 'ACTIF'
WHERE i.lot IS NOT NULL AND i.lot != ''
GROUP BY i.id, i.nom_item, i.lot
ORDER BY i.lot, i.nom_item;

-- 5. Vérifier un prestataire spécifique
-- Remplacez 'd78d2975-5fa7-4b36-b113-4ddf3a251211' par l'ID du prestataire concerné
SELECT 
    c.id,
    c.id_contrat,
    c.nom_prestataire,
    c.prestataire_id,
    c.lot,
    c.statut
FROM contrats c
WHERE c.prestataire_id = 'd78d2975-5fa7-4b36-b113-4ddf3a251211'
   OR LOWER(c.nom_prestataire) LIKE '%it solutions%';

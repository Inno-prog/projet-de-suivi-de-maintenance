-- Script SQL pour gérer les utilisateurs prestataires
-- À exécuter dans la console H2 : http://localhost:8085/h2-console

-- 1. Vérifier tous les utilisateurs et leurs rôles
SELECT id, email, nom, contact, dtype as role 
FROM users 
ORDER BY dtype, nom;

-- 2. Vérifier les prestataires spécifiquement
SELECT id, email, nom, structure, direction, qualification 
FROM users 
WHERE dtype = 'Prestataire'
ORDER BY nom;

-- 3. Compter les utilisateurs par rôle
SELECT dtype as role, COUNT(*) as count 
FROM users 
GROUP BY dtype;

-- 4. Trouver les utilisateurs sans rôle défini
SELECT * FROM users WHERE dtype IS NULL;

-- 5. Vérifier un utilisateur spécifique par email
-- Remplacez 'email@example.com' par l'email recherché
SELECT * FROM users WHERE email = 'email@example.com';

-- 6. Mettre à jour un utilisateur existant pour le transformer en prestataire
-- ATTENTION : Utilisez avec précaution, cela modifie le type d'utilisateur
-- Remplacez 'USER_ID' par l'ID de l'utilisateur
-- UPDATE users 
-- SET dtype = 'Prestataire', 
--     structure = '', 
--     direction = '', 
--     qualification = ''
-- WHERE id = 'USER_ID';

-- 7. Supprimer un utilisateur de test (si nécessaire)
-- ATTENTION : Cette action est irréversible
-- Remplacez 'USER_ID' par l'ID de l'utilisateur à supprimer
-- DELETE FROM users WHERE id = 'USER_ID';

-- 8. Vérifier les utilisateurs créés récemment (si vous avez une colonne created_at)
-- SELECT * FROM users 
-- WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '1' DAY
-- ORDER BY created_at DESC;

-- 9. Lister tous les prestataires avec leurs informations complètes
SELECT 
    id,
    email,
    nom,
    contact,
    adresse,
    structure,
    direction,
    qualification,
    dtype as role
FROM users 
WHERE dtype = 'Prestataire'
ORDER BY nom;

-- 10. Vérifier les doublons d'email
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

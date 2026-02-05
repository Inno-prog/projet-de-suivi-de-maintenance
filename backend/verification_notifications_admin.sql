-- Script SQL pour vérifier et corriger le système de notifications admin
-- Base de données: H2 / PostgreSQL compatible

-- ============================================
-- 1. VÉRIFICATION DES ADMINISTRATEURS
-- ============================================

-- Compter les administrateurs
SELECT 'Nombre d''administrateurs:' as info, COUNT(*) as count 
FROM users 
WHERE role = 'ADMINISTRATEUR' OR role = 'ROLE_ADMINISTRATEUR';

-- Lister tous les administrateurs
SELECT 
    id,
    nom,
    email,
    role,
    contact,
    created_at
FROM users 
WHERE role = 'ADMINISTRATEUR' OR role = 'ROLE_ADMINISTRATEUR'
ORDER BY created_at DESC;

-- ============================================
-- 2. VÉRIFICATION DES NOTIFICATIONS RÉCENTES
-- ============================================

-- Lister les 10 dernières notifications
SELECT 
    id,
    destinataire,
    titre,
    message,
    type,
    lu,
    date_creation
FROM notifications
ORDER BY date_creation DESC
LIMIT 10;

-- Compter les notifications par destinataire
SELECT 
    destinataire,
    COUNT(*) as nb_notifications,
    SUM(CASE WHEN lu = true THEN 1 ELSE 0 END) as nb_lues,
    SUM(CASE WHEN lu = false OR lu IS NULL THEN 1 ELSE 0 END) as nb_non_lues
FROM notifications
GROUP BY destinataire
ORDER BY nb_notifications DESC;

-- ============================================
-- 3. CORRECTION DES RÔLES (SI NÉCESSAIRE)
-- ============================================

-- Si des utilisateurs ont 'ROLE_ADMINISTRATEUR' au lieu de 'ADMINISTRATEUR'
-- Décommenter la ligne suivante pour corriger:
-- UPDATE users SET role = 'ADMINISTRATEUR' WHERE role = 'ROLE_ADMINISTRATEUR';

-- ============================================
-- 4. CRÉATION D'UN ADMINISTRATEUR DE TEST
-- ============================================

-- Vérifier si l'admin de test existe déjà
SELECT 'Admin de test existe:' as info, COUNT(*) as count
FROM users 
WHERE email = 'admin.test@dgsi.bf';

-- Si l'admin de test n'existe pas, le créer
-- Décommenter les lignes suivantes pour créer l'admin de test:

/*
INSERT INTO users (id, nom, email, password, role, contact, created_at, updated_at)
SELECT 
    'admin-test-001',
    'Admin Test',
    'admin.test@dgsi.bf',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', -- password: admin123
    'ADMINISTRATEUR',
    '+226 70 00 00 00',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin.test@dgsi.bf'
);
*/

-- ============================================
-- 5. VÉRIFICATION DES PRESTATIONS RÉCENTES
-- ============================================

-- Lister les 5 dernières prestations soumises
SELECT 
    id,
    nom_prestataire,
    nom_prestation,
    statut_validation,
    trimestre,
    date_heure_debut
FROM prestation
WHERE statut_validation != 'BROUILLON' OR statut_validation IS NULL
ORDER BY date_heure_debut DESC
LIMIT 5;

-- ============================================
-- 6. DIAGNOSTIC COMPLET
-- ============================================

-- Résumé du système
SELECT 
    'Statistiques du système' as section,
    (SELECT COUNT(*) FROM users WHERE role = 'ADMINISTRATEUR') as nb_admins,
    (SELECT COUNT(*) FROM users WHERE role = 'PRESTATAIRE') as nb_prestataires,
    (SELECT COUNT(*) FROM notifications) as nb_notifications_total,
    (SELECT COUNT(*) FROM notifications WHERE lu = false OR lu IS NULL) as nb_notifications_non_lues,
    (SELECT COUNT(*) FROM prestation WHERE statut_validation != 'BROUILLON') as nb_prestations_soumises;

-- ============================================
-- 7. NETTOYAGE (OPTIONNEL)
-- ============================================

-- Supprimer les notifications de test (plus de 30 jours)
-- Décommenter pour exécuter:
-- DELETE FROM notifications 
-- WHERE titre LIKE '%Test%' 
-- AND date_creation < CURRENT_TIMESTAMP - INTERVAL '30' DAY;

-- Marquer toutes les notifications comme lues (pour un utilisateur spécifique)
-- Décommenter et remplacer l'email:
-- UPDATE notifications 
-- SET lu = true 
-- WHERE destinataire = 'admin@dgsi.bf' AND (lu = false OR lu IS NULL);

-- ============================================
-- 8. REQUÊTES DE DÉBOGAGE
-- ============================================

-- Trouver les prestations sans notification correspondante
SELECT 
    p.id,
    p.nom_prestataire,
    p.nom_prestation,
    p.statut_validation,
    p.date_heure_debut,
    'Pas de notification trouvée' as status
FROM prestation p
WHERE p.statut_validation != 'BROUILLON'
AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.message LIKE CONCAT('%', CAST(p.id AS VARCHAR), '%')
)
ORDER BY p.date_heure_debut DESC
LIMIT 10;

-- Vérifier les notifications orphelines (destinataire n'existe pas)
SELECT 
    n.id,
    n.destinataire,
    n.titre,
    n.date_creation,
    'Destinataire introuvable' as status
FROM notifications n
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = n.destinataire
)
ORDER BY n.date_creation DESC
LIMIT 10;

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Pour exécuter ce script:
-- 1. Connectez-vous à votre base de données
-- 2. Exécutez les requêtes de vérification (sections 1-2)
-- 3. Si nécessaire, décommentez et exécutez les corrections (sections 3-4)
-- 4. Vérifiez les résultats avec les requêtes de diagnostic (sections 5-8)

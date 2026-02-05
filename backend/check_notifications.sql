-- Vérifier les administrateurs
SELECT 'ADMINISTRATEURS:' as info;
SELECT id, nom, email, role FROM users WHERE role LIKE '%ADMIN%';

-- Vérifier les notifications
SELECT 'NOTIFICATIONS:' as info;
SELECT id, destinataire, titre, lu, date_creation FROM notifications ORDER BY date_creation DESC LIMIT 10;

-- Vérifier les prestations en attente
SELECT 'PRESTATIONS EN ATTENTE:' as info;
SELECT id, nom_prestataire, nom_prestation, statut_validation FROM prestation WHERE statut_validation = 'EN_ATTENTE' LIMIT 5;

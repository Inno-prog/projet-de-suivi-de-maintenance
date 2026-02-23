-- Script pour corriger les prestataire_id null dans la table contrats
-- En se basant sur le nom du prestataire (nomPrestataire) et la structure du prestataire

-- Afficher les contrats avec prestataire_id null
SELECT c.id, c.id_contrat, c.nom_prestataire, c.prestataire_id as "PrestataireId Actuel"
FROM contrats c
WHERE c.prestataire_id IS NULL OR c.prestataire_id = '';

-- Afficher les prestataires disponibles pour correspondre
SELECT p.id, p.nom, p.email, p.structure
FROM users p
WHERE p.user_type = 'PRESTATAIRE';

-- Mise à jour des contrats avec prestataire_id null
-- En utilisant le nom du prestataire pour trouver la correspondance
UPDATE contrats c
SET prestataire_id = (
    SELECT p.id 
    FROM users p 
    WHERE p.user_type = 'PRESTATAIRE' 
    AND LOWER(p.structure) = LOWER(c.nom_prestataire)
    LIMIT 1
)
WHERE (c.prestataire_id IS NULL OR c.prestataire_id = '')
AND EXISTS (
    SELECT 1 FROM users p 
    WHERE p.user_type = 'PRESTATAIRE' 
    AND LOWER(p.structure) = LOWER(c.nom_prestataire)
);

-- Vérifier le résultat après mise à jour
SELECT c.id, c.id_contrat, c.nom_prestataire, c.prestataire_id as "PrestataireId Mis à jour"
FROM contrats c
WHERE c.nom_prestataire IN ('inno inno', 'test2 test2');

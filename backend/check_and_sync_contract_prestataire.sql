-- Vérifier les contrats sans prestataireId ou avec un prestataireId invalide
SELECT c.id_contrat, c.nom_prestataire, c.prestataire_id, p.structure, p.id
FROM contrats c
LEFT JOIN prestataires p ON c.prestataire_id = p.id
WHERE c.prestataire_id IS NULL OR c.prestataire_id = '' OR p.id IS NULL;

-- Compter le nombre de contrats sans prestataire valide
SELECT COUNT(*) AS nb_contrats_sans_prestataire_valide
FROM contrats c
LEFT JOIN prestataires p ON c.prestataire_id = p.id
WHERE c.prestataire_id IS NULL OR c.prestataire_id = '' OR p.id IS NULL;

-- Afficher les prestataires disponibles
SELECT id, structure, email, nom
FROM prestataires
WHERE structure IS NOT NULL AND structure != '';

-- Vérifier les contrats associés à un prestataire mais avec un nom de prestataire qui ne correspond pas à la structure
SELECT c.id_contrat, c.nom_prestataire, c.prestataire_id, p.structure
FROM contrats c
JOIN prestataires p ON c.prestataire_id = p.id
WHERE LOWER(c.nom_prestataire) != LOWER(p.structure);

-- Synchroniser les contrats sans prestataireId valide avec les prestataires correspondants par nom de structure
UPDATE contrats c
SET prestataire_id = p.id
FROM prestataires p
WHERE (c.prestataire_id IS NULL OR c.prestataire_id = '' OR NOT EXISTS (
    SELECT 1 FROM prestataires WHERE id = c.prestataire_id
))
AND LOWER(c.nom_prestataire) = LOWER(p.structure);

-- Vérifier le résultat de la synchronisation
SELECT COUNT(*) AS nb_contrats_synchronises
FROM contrats c
JOIN prestataires p ON c.prestataire_id = p.id
WHERE LOWER(c.nom_prestataire) = LOWER(p.structure);

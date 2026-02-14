-- Fix CT-001-2025 contract prestataire_id
UPDATE contrats 
SET prestataire_id = (SELECT id FROM users WHERE nom = 'IT Solutions Burkina')
WHERE id_contrat = 'CT-001-2025';

-- Verify changes
SELECT id_contrat, nom_prestataire, prestataire_id 
FROM contrats 
WHERE id_contrat IN ('CT-001-2025', 'CT-002-2025');

-- Fix NetCom Afrique contract - update prestataire_id column
-- NetCom Afrique user id is: 6e80c5a0-b7b8-4151-8f63-4be4bf94b816
UPDATE contrats 
SET prestataire_id = '6e80c5a0-b7b8-4151-8f63-4be4bf94b816' 
WHERE nom_prestataire = 'NetCom Afrique';

-- Check if the update worked
SELECT id, id_contrat, nom_prestataire, prestataire_id, lot 
FROM contrats 
WHERE nom_prestataire = 'NetCom Afrique';

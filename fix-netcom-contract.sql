-- Fix NetCom Afrique contract - update prestataire_id to match their user id

-- First check current state
SELECT id, id_contrat, nom_prestataire, prestataire_id, lot FROM contrats WHERE nom_prestataire = 'NetCom Afrique';

-- Get NetCom Afrique user id from users table
SELECT id, nom, role FROM users WHERE nom = 'NetCom Afrique' OR email = 'netcom@gmail.com';

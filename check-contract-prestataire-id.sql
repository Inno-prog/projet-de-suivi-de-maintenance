-- Check contract for NetCom Afrique
SELECT c.id, c.id_contrat, c.nom_prestataire, c.prestataire_id, c.lot
FROM contrats c
WHERE c.nom_prestataire = 'NetCom Afrique';

-- Check prestataire id 
SELECT u.id, u.nom, u.email
FROM users u
WHERE u.nom = 'NetCom Afrique' OR u.email = 'netcom@gmail.com';

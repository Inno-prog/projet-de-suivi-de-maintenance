-- Check the current state of contracts
SELECT 
    id, 
    id_contrat, 
    nom_prestataire, 
    prestataire_id, 
    lot 
FROM contrats 
WHERE nom_prestataire IN ('NetCom Afrique', 'IT Solutions Burkina');

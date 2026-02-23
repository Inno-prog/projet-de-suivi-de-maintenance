-- Check all contracts and their prestataire_id values
SELECT 
    id, 
    id_contrat, 
    nom_prestataire, 
    prestataire_id,
    CASE 
        WHEN prestataire_id IS NULL THEN 'NULL'
        WHEN prestataire_id = '' THEN 'EMPTY'
        ELSE prestataire_id 
    END as prestataire_id_status
FROM contrats 
ORDER BY id;

-- Count contracts by prestataire_id
SELECT 
    COALESCE(prestataire_id, 'NULL') as prestataire_id,
    COUNT(*) as contract_count
FROM contrats 
GROUP BY prestataire_id;

-- Check if there are any contracts with non-null prestataire_id
SELECT COUNT(*) as contracts_with_prestataire_id
FROM contrats 
WHERE prestataire_id IS NOT NULL AND prestataire_id != '';

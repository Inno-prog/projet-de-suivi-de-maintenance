-- Check fiches prestation with items used
SELECT 
    id, 
    nom_item, 
    items_couverts, 
    quantite,
    numero_fiche
FROM 
    fiches_prestation
WHERE 
    items_couverts IS NOT NULL OR nom_item IS NOT NULL
ORDER BY 
    numero_fiche;

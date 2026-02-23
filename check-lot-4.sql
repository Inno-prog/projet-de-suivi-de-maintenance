-- Vérifier les items du lot 4 et leur utilisation
SELECT 
    i.id,
    i.nom_item,
    i.description,
    i.prix,
    i.quantite_max_trimestre as quantite_stock,
    COALESCE(i.quantite_utilisee, 0) as quantite_utilisee,
    (i.quantite_max_trimestre - COALESCE(i.quantite_utilisee, 0)) as quantite_restante
FROM items i
WHERE i.lot = '4'
ORDER BY i.id;

-- Vérifier les fiches de prestation associées au lot 4
SELECT 
    fp.id,
    fp.numero_fiche,
    fp.date_realisation,
    fp.statut,
    fpi.item_id,
    i.nom_item,
    fpi.quantite_utilisee
FROM fiches_prestation fp
JOIN fiche_prestation_items fpi ON fp.id = fpi.fiche_prestation_id
JOIN items i ON fpi.item_id = i.id
WHERE i.lot = '4'
ORDER BY fp.id, i.id;

-- Vérifier les items du lot 4 sans utilisation
SELECT 
    i.id,
    i.nom_item,
    i.quantite_max_trimestre
FROM items i
LEFT JOIN fiche_prestation_items fpi ON i.id = fpi.item_id
WHERE i.lot = '4' AND fpi.item_id IS NULL
ORDER BY i.id;

-- Vérifier la table fiche_prestation_items
SELECT * FROM fiche_prestation_items LIMIT 10;

-- Check fiche_prestation_items for lot4 items
SELECT 
    i.nom_item,
    COUNT(fpi.fiche_prestation_id) as count_occurrences,
    SUM(fpi.quantite_utilisee) as total_quantity_used
FROM fiche_prestation_items fpi
JOIN items i ON fpi.item_id = i.id
JOIN fiches_prestation fp ON fpi.fiche_prestation_id = fp.id
WHERE i.lot = 'lot4'
GROUP BY i.nom_item;

-- Check the lot from numero_fiche
SELECT 
    fp.numero_fiche,
    i.nom_item,
    fpi.quantite_utilisee
FROM fiche_prestation_items fpi
JOIN items i ON fpi.item_id = i.id
JOIN fiches_prestation fp ON fpi.fiche_prestation_id = fp.id
WHERE i.lot = 'lot4'
ORDER BY fp.numero_fiche;

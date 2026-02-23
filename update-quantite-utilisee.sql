-- Update fiche_prestation_items to use the fiche's quantite
UPDATE fiche_prestation_items fpi
SET quantite_utilisee = fp.quantite
FROM fiches_prestation fp
WHERE fpi.fiche_prestation_id = fp.id;

-- Verify the changes
SELECT 
    fp.id,
    fp.numero_fiche,
    fp.quantite,
    fp.nom_item,
    fpi.item_id,
    i.nom_item as item_nom,
    fpi.quantite_utilisee
FROM fiches_prestation fp
LEFT JOIN fiche_prestation_items fpi ON fp.id = fpi.fiche_prestation_id
LEFT JOIN items i ON fpi.item_id = i.id
WHERE fp.numero_fiche LIKE 'T1-L4-%'
ORDER BY fp.id;

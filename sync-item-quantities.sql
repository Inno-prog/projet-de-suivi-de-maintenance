-- Reset all item usage quantities to zero
UPDATE items 
SET quantite_utilisee = 0, 
    quantite_utilisee_trimestre = 0;

-- Synchronize quantite_utilisee with actual usage from fiche_prestation_items
UPDATE items i
SET quantite_utilisee = (
    SELECT COALESCE(SUM(fpi.quantite_utilisee), 0)
    FROM fiche_prestation_items fpi
    WHERE fpi.item_id = i.id
)
WHERE EXISTS (
    SELECT 1 FROM fiche_prestation_items fpi WHERE fpi.item_id = i.id
);

-- Synchronize quantite_utilisee_trimestre with actual usage from fiche_prestation_items (trimestre 1)
UPDATE items i
SET quantite_utilisee_trimestre = (
    SELECT COALESCE(SUM(fpi.quantite_utilisee), 0)
    FROM fiche_prestation_items fpi
    JOIN fiches_prestation fp ON fpi.fiche_prestation_id = fp.id
    WHERE fpi.item_id = i.id
      AND fp.numero_fiche LIKE 'T1-%'
)
WHERE EXISTS (
    SELECT 1 FROM fiche_prestation_items fpi
    JOIN fiches_prestation fp ON fpi.fiche_prestation_id = fp.id
    WHERE fpi.item_id = i.id
      AND fp.numero_fiche LIKE 'T1-%'
);

-- Verify the synchronization
SELECT i.nom_item,
       i.lot,
       COALESCE(i.quantite_utilisee, 0) as quantite_utilisee,
       COALESCE(i.quantite_utilisee_trimestre, 0) as quantite_utilisee_trimestre,
       COALESCE(SUM(fpi.quantite_utilisee), 0) as total_used
FROM items i
LEFT JOIN fiche_prestation_items fpi ON i.id = fpi.item_id
GROUP BY i.id, i.nom_item, i.lot, i.quantite_utilisee, i.quantite_utilisee_trimestre
ORDER BY i.lot, i.nom_item;

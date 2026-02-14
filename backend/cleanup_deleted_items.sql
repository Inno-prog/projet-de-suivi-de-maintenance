-- Script pour nettoyer les items supprimés de la base de données
-- Ce script identifie et supprime les items qui ne sont plus référencés

-- Étape 1: Identifier les items qui ne sont référencés dans aucune prestation active
SELECT 'Items potentiellement supprimables:' as info;
SELECT
    i.id,
    i.nom_item,
    i.lot,
    COUNT(p.id) as prestations_actives
FROM items i
LEFT JOIN prestations p ON i.nom_item = p.nom_prestation
    AND (p.deleted IS NULL OR p.deleted = false)
WHERE p.id IS NULL
GROUP BY i.id, i.nom_item, i.lot
ORDER BY i.nom_item;

-- Étape 2: Supprimer les items qui ne sont référencés nulle part
-- ATTENTION: Cette opération est irréversible
-- Commentez cette section si vous voulez d'abord vérifier

/*
DELETE FROM items
WHERE id IN (
    SELECT i.id
    FROM items i
    LEFT JOIN prestations p ON i.nom_item = p.nom_prestation
        AND (p.deleted IS NULL OR p.deleted = false)
    WHERE p.id IS NULL
);
*/

-- Étape 3: Alternative - Ajouter un champ deleted aux items pour soft delete
-- ALTER TABLE items ADD COLUMN deleted BOOLEAN DEFAULT FALSE;

-- Étape 4: Marquer comme supprimés les items non utilisés
-- UPDATE items SET deleted = TRUE WHERE id IN (...);

-- Étape 5: Vérifier les résultats après nettoyage
SELECT
    'Statistiques après nettoyage:' as info,
    COUNT(*) as total_items,
    SUM(CASE WHEN deleted = TRUE THEN 1 ELSE 0 END) as items_supprimes,
    SUM(CASE WHEN deleted IS NULL OR deleted = FALSE THEN 1 ELSE 0 END) as items_actifs
FROM items;

-- Étape 6: Lister les items actifs restants
SELECT
    i.nom_item,
    i.lot,
    COUNT(p.id) as prestations_liees
FROM items i
LEFT JOIN prestations p ON i.nom_item = p.nom_prestation
    AND (p.deleted IS NULL OR p.deleted = FALSE)
WHERE (i.deleted IS NULL OR i.deleted = FALSE)
GROUP BY i.nom_item, i.lot
ORDER BY i.nom_item;

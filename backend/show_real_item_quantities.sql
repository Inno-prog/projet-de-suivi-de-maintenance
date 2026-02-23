-- Script pour afficher les quantités réelles des items basées sur les prestations existantes
-- Ce script compte les occurrences de chaque item dans toutes les prestations actives

-- Afficher les quantités réelles par item
WITH item_usage AS (
    SELECT 
        i.id AS item_id,
        i.nom_item,
        i.lot,
        i.quantite_max_trimestre,
        i.quantite_utilisee AS quantite_actuelle_en_bd,
        COUNT(DISTINCT p.id) AS nombre_prestations,
        COALESCE(SUM(
            CASE 
                WHEN p.item_quantities IS NOT NULL AND p.item_quantities != '' THEN
                    -- Extraire la quantité depuis le JSON item_quantities
                    CAST(
                        JSON_EXTRACT(p.item_quantities, CONCAT('$.', i.id)) 
                        AS INTEGER
                    )
                ELSE 1
            END
        ), 0) AS quantite_reelle_calculee
    FROM items i
    LEFT JOIN prestations p ON 
        p.deleted = FALSE 
        AND p.statut_validation IN ('EN_ATTENTE', 'VALIDE', 'VALIDER')
        AND (
            -- Vérifier si l'item est dans la liste des items utilisés
            EXISTS (
                SELECT 1 FROM prestation_items pi 
                WHERE pi.prestation_id = p.id AND pi.item_id = i.id
            )
            -- Ou vérifier dans le JSON item_quantities
            OR (p.item_quantities IS NOT NULL AND p.item_quantities LIKE CONCAT('%', i.id, '%'))
        )
    GROUP BY i.id, i.nom_item, i.lot, i.quantite_max_trimestre, i.quantite_utilisee
)
SELECT 
    item_id,
    nom_item,
    lot,
    quantite_max_trimestre,
    quantite_actuelle_en_bd,
    nombre_prestations,
    quantite_reelle_calculee,
    CASE 
        WHEN quantite_actuelle_en_bd != quantite_reelle_calculee THEN '⚠️ DIFFÉRENCE'
        ELSE '✅ OK'
    END AS statut_synchronisation
FROM item_usage
ORDER BY lot, nom_item;

-- Afficher un résumé des différences
SELECT 
    'RÉSUMÉ DES DIFFÉRENCES' AS section,
    COUNT(*) AS total_items,
    SUM(CASE WHEN quantite_actuelle_en_bd != quantite_reelle_calculee THEN 1 ELSE 0 END) AS items_non_synchronises,
    SUM(CASE WHEN quantite_actuelle_en_bd = quantite_reelle_calculee THEN 1 ELSE 0 END) AS items_synchronises
FROM (
    SELECT 
        i.id,
        i.quantite_utilisee AS quantite_actuelle_en_bd,
        COALESCE(SUM(
            CASE 
                WHEN p.item_quantities IS NOT NULL AND p.item_quantities != '' THEN
                    CAST(JSON_EXTRACT(p.item_quantities, CONCAT('$.', i.id)) AS INTEGER)
                ELSE 1
            END
        ), 0) AS quantite_reelle_calculee
    FROM items i
    LEFT JOIN prestations p ON 
        p.deleted = FALSE 
        AND p.statut_validation IN ('EN_ATTENTE', 'VALIDE', 'VALIDER')
        AND (
            EXISTS (SELECT 1 FROM prestation_items pi WHERE pi.prestation_id = p.id AND pi.item_id = i.id)
            OR (p.item_quantities IS NOT NULL AND p.item_quantities LIKE CONCAT('%', i.id, '%'))
        )
    GROUP BY i.id, i.quantite_utilisee
) AS subquery;

-- Afficher les détails des prestations par item (pour audit)
SELECT 
    i.id AS item_id,
    i.nom_item,
    p.id AS prestation_id,
    p.nom_prestation,
    p.nom_prestataire,
    p.statut_validation,
    p.date_heure_debut,
    CASE 
        WHEN p.item_quantities IS NOT NULL AND p.item_quantities != '' THEN
            CAST(JSON_EXTRACT(p.item_quantities, CONCAT('$.', i.id)) AS INTEGER)
        ELSE 1
    END AS quantite_dans_prestation
FROM items i
JOIN prestation_items pi ON pi.item_id = i.id
JOIN prestations p ON p.id = pi.prestation_id
WHERE p.deleted = FALSE 
    AND p.statut_validation IN ('EN_ATTENTE', 'VALIDE', 'VALIDER')
ORDER BY i.id, p.date_heure_debut DESC;

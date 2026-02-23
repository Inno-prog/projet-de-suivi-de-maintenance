-- Script pour modifier les colonnes minArticles et maxArticles de la table type_items en minItems et maxItems

-- Vérifier l'existence de la table type_items
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'type_items' AND table_schema = 'public';

-- Vérifier l'existence des colonnes à modifier
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'type_items' AND column_name IN ('min_articles', 'max_articles');

-- Modifier les colonnes
ALTER TABLE type_items
    RENAME COLUMN min_articles TO min_items;

ALTER TABLE type_items
    RENAME COLUMN max_articles TO max_items;

-- Vérifier les modifications
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'type_items' AND column_name IN ('min_items', 'max_items');

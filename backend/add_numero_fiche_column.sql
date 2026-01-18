-- Migration: Ajouter la colonne numero_fiche pour la réutilisation des numéros
-- Ce script ajoute une colonne pour stocker le numéro séquentiel de chaque fiche

-- Ajouter la colonne numero_fiche (nullable pour la migration progressive)
ALTER TABLE fiches_prestation ADD COLUMN numero_fiche INTEGER;

-- Créer une séquence pour générer les numéros de fiche
-- Si une séquence n'existe pas déjà, la créer
CREATE SEQUENCE IF NOT EXISTS fiche_numero_seq START 1;

-- Mettre à jour les fiches existantes avec des numéros séquentiels
-- On utilise une sous-requête avec ROW_NUMBER pour numéroter les fiches existantes
-- NOTE: Cette approche numérote les fiches dans l'ordre de leur ID (creation)

-- Option A: Assigner des numéros séquentiels basés sur l'ID (ancien vers nouveau)
-- Ceci préserve l'ordre de création
UPDATE fiches_prestation fp1
SET numero_fiche = (
    SELECT COUNT(*) + 1
    FROM fiches_prestation fp2
    WHERE fp2.id < fp1.id
    AND fp2.numero_fiche IS NOT NULL
)
WHERE numero_fiche IS NULL;

-- Option B: Alternative avec ROW_NUMBER (plus simple avec PostgreSQL)
-- UPDATE fiches_prestation
-- SET numero_fiche = rn
-- FROM (
--     SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
--     FROM fiches_prestation
-- ) ranked
-- WHERE fiches_prestation.id = ranked.id;

-- Vérifier que tous les numéros sont assignés
SELECT id, id_prestation, numero_fiche
FROM fiches_prestation
ORDER BY id;

-- Créer un index unique sur numero_fiche pour garantir l'unicité
CREATE UNIQUE INDEX IF NOT EXISTS idx_fiches_prestation_numero_fiche_unique
ON fiches_prestation(numero_fiche)
WHERE numero_fiche IS NOT NULL;

-- Fonction pour obtenir le prochain numéro disponible
-- Cette fonction cherche le plus petit numéro non utilisé
CREATE OR REPLACE FUNCTION get_next_fiche_numero()
RETURNS INTEGER AS $$
DECLARE
    next_num INTEGER := 1;
    current_max INTEGER;
BEGIN
    -- Trouver le numéro maximum actuellement utilisé
    SELECT COALESCE(MAX(numero_fiche), 0) INTO current_max
    FROM fiches_prestation;

    -- Boucler jusqu'à trouver un numéro disponible
    LOOP
        IF NOT EXISTS (SELECT 1 FROM fiches_prestation WHERE numero_fiche = next_num) THEN
            RETURN next_num;
        END IF;
        next_num := next_num + 1;
        -- Protection contre les boucles infinies
        IF next_num > current_max + 1000 THEN
            RETURN current_max + 1;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le numero_fiche lors de la création
CREATE OR REPLACE FUNCTION set_fiche_numero()
RETURNS TRIGGER AS $$
BEGIN
    -- Si numero_fiche n'est pas encore défini, en générer un nouveau
    IF NEW.numero_fiche IS NULL THEN
        NEW.numero_fiche := get_next_fiche_numero();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour automatiquement assigner un numéro à la création
DROP TRIGGER IF EXISTS trg_set_fiche_numero ON fiches_prestation;
CREATE TRIGGER trg_set_fiche_numero
    BEFORE INSERT ON fiches_prestation
    FOR EACH ROW
    EXECUTE FUNCTION set_fiche_numero();

-- Endpoint SQL pour obtenir le prochain numéro disponible (utilisé par le controller si trigger non utilisé)
-- SELECT get_next_fiche_numero();

-- NOTE: Pour apply cette migration:
-- 1. Exécuter ce script dans la base de données
-- 2. Redémarrer l'application backend
-- 3. Tester la création et suppression de fiches


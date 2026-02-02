-- Script pour vérifier la structure de la table evaluation_trimestrielle
DESCRIBE evaluation_trimestrielle;

-- Ou pour MySQL :
-- SHOW COLUMNS FROM evaluation_trimestrielle;

-- Pour vérifier si la table existe
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'evaluation_trimestrielle';

-- Pour vérifier les colonnes de la table
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH 
FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'evaluation_trimestrielle' 
ORDER BY ORDINAL_POSITION;

-- Vérifier la structure de la table evaluation_trimestrielle
SHOW COLUMNS FROM evaluation_trimestrielle;

-- Vérifier le nombre de colonnes
SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'EVALUATION_TRIMESTRIELLE';

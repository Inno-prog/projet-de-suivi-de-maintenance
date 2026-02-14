-- Migration SQL pour rendre le champ ville nullable
ALTER TABLE contrats ALTER COLUMN ville DROP NOT NULL;

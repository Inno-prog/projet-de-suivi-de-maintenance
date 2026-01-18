-- Script SQL pour insérer les 17 régions du Burkina Faso et leurs villes
-- Ce script peut être exécuté directement dans H2 Database ou adapté pour PostgreSQL

-- Table de référence pour les régions (table auxiliaire pour référence)
-- Note: La table structures_mefp contient déjà les colonnes 'region' et 'ville'

-- ==============================================================================
-- PARTIE 1: Mise à jour des structures existantes avec les régions/villes
-- ==============================================================================

-- Cette partie met à jour les structures existantes en fonction de leur ville

-- Kadiogo (Ouagadougou et environs)
UPDATE structures_mefp SET region = 'Kadiogo' WHERE ville IN ('Ouagadougou', 'Saaba', 'Koubri', 'Tanghin-Dassouri');

-- Guiriko (Bobo-Dioulasso et environs)
UPDATE structures_mefp SET region = 'Guiriko' WHERE ville IN ('Bobo-Dioulasso', 'Houndé', 'Orodara', 'Banfora');

-- Bankui (Dédougou et environs)
UPDATE structures_mefp SET region = 'Bankui' WHERE ville IN ('Dédougou', 'Nouna', 'Tougan', 'Solenzo', 'Toma');

-- Djôrô (Gaoua et environs)
UPDATE structures_mefp SET region = 'Djôrô' WHERE ville IN ('Gaoua', 'Diébougou', 'Dano', 'Batié');

-- Goulmou (Fada N'Gourma et environs)
UPDATE structures_mefp SET region = 'Goulmou' WHERE ville IN ('Fada N''Gourma', 'Diapaga', 'Bogandé', 'Manni');

-- Kuilsé (Kaya et environs)
UPDATE structures_mefp SET region = 'Kuilsé' WHERE ville IN ('Kaya', 'Kongoussi', 'Boulsa', 'Pissila');

-- Liptako (Dori et environs)
UPDATE structures_mefp SET region = 'Liptako' WHERE ville IN ('Dori', 'Gorom-Gorom', 'Sebba');

-- Nando (Koudougou et environs)
UPDATE structures_mefp SET region = 'Nando' WHERE ville IN ('Koudougou', 'Réo', 'Léo', 'Sabou');

-- Nakambé (Tenkodogo et environs)
UPDATE structures_mefp SET region = 'Nakambé' WHERE ville IN ('Tenkodogo', 'Koupéla', 'Pouytenga', 'Garango');

-- Nazinon (Manga et environs)
UPDATE structures_mefp SET region = 'Nazinon' WHERE ville IN ('Manga', 'Kombissiri', 'Pô');

-- Oubri (Ziniaré et environs)
UPDATE structures_mefp SET region = 'Oubri' WHERE ville IN ('Ziniaré', 'Boussé', 'Zorgho');

-- Sirba (Bogandé et environs - attention: Bogandé est dans Goulmou et Sirba)
UPDATE structures_mefp SET region = 'Sirba' WHERE ville = 'Coalla';

-- Soum (Djibo et environs)
UPDATE structures_mefp SET region = 'Soum' WHERE ville IN ('Djibo', 'Arbinda', 'Tongomayel');

-- Tannounyan (Banfora et environs)
UPDATE structures_mefp SET region = 'Tannounyan' WHERE ville IN ('Sindou', 'Mangodara');

-- Tapoa (Diapaga et environs)
UPDATE structures_mefp SET region = 'Tapoa' WHERE ville = 'Pama';

-- Sourou (Tougan et environs - Tougan peut être dans Bankui ou Sourou)
UPDATE structures_mefp SET region = 'Sourou' WHERE ville IN ('Lankoué', 'Kiembara');

-- Yaadga (Ouahigouya et environs)
UPDATE structures_mefp SET region = 'Yaadga' WHERE ville IN ('Ouahigouya', 'Gourcy', 'Titao');

-- ==============================================================================
-- PARTIE 2: Structure de référence pour les 17 régions (commentaire)
-- ==============================================================================

/*

RÉCAPITULATIF DES 17 RÉGIONS ET LEURS VILLES:

1. Bankui (Chef-lieu : Dédougou)
   - Dédougou, Nouna, Tougan, Solenzo, Toma

2. Djôrô (Chef-lieu : Gaoua)
   - Gaoua, Diébougou, Dano, Batié

3. Goulmou (Chef-lieu : Fada N'Gourma)
   - Fada N'Gourma, Diapaga, Bogandé, Manni

4. Guiriko (Chef-lieu : Bobo-Dioulasso)
   - Bobo-Dioulasso, Houndé, Orodara, Banfora

5. Kadiogo (Chef-lieu : Ouagadougou)
   - Ouagadougou, Saaba, Koubri, Tanghin-Dassouri

6. Kuilsé (Chef-lieu : Kaya)
   - Kaya, Kongoussi, Boulsa, Pissila

7. Liptako (Chef-lieu : Dori)
   - Dori, Gorom-Gorom, Sebba

8. Nando (Chef-lieu : Koudougou)
   - Koudougou, Réo, Léo, Sabou

9. Nakambé (Chef-lieu : Tenkodogo)
   - Tenkodogo, Koupéla, Pouytenga, Garango

10. Nazinon (Chef-lieu : Manga)
    - Manga, Kombissiri, Pô

11. Oubri (Chef-lieu : Ziniaré)
    - Ziniaré, Boussé, Zorgho

12. Sirba (Chef-lieu : Bogandé)
    - Bogandé, Manni, Coalla

13. Soum (Chef-lieu : Djibo)
    - Djibo, Arbinda, Tongomayel

14. Tannounyan (Chef-lieu : Banfora)
    - Banfora, Sindou, Mangodara

15. Tapoa (Chef-lieu : Diapaga)
    - Diapaga, Pama

16. Sourou (Chef-lieu : Tougan)
    - Tougan, Lankoué, Kiembara

17. Yaadga (Chef-lieu : Ouahigouya)
    - Ouahigouya, Gourcy, Titao

*/

-- ==============================================================================
-- PARTIE 3: Fonction pour obtenir la région en fonction de la ville
-- ==============================================================================

-- Cette fonction peut être utilisée pour attribuer automatiquement la région
-- CREATE OR REPLACE FUNCTION get_region_by_ville(ville_name VARCHAR) RETURNS VARCHAR AS $$
-- BEGIN
--     RETURN CASE
--         WHEN ville_name IN ('Ouagadougou', 'Saaba', 'Koubri', 'Tanghin-Dassouri') THEN 'Kadiogo'
--         WHEN ville_name IN ('Bobo-Dioulasso', 'Houndé', 'Orodara', 'Banfora') THEN 'Guiriko'
--         -- ... etc pour les autres villes
--         ELSE 'Inconnue'
--     END;
-- END;
-- $$ LANGUAGE plpgsql;

-- ==============================================================================
-- PARTIE 4: Exemples de structures typiques du MEFP par région
-- ==============================================================================

/*

STRUCTURES TYPIQUES À CRÉER PAR RÉGION:

Pour chaque ville, les structures typiques du MEFP sont:
- Direction Provinciale des Impôts (DPI)
- Direction Provinciale du Trésor (DPT)
- Direction du Contrôle et de la Modernisation des États Financiers (DCMEF)
- Direction Provinciale de la Concurrence et de la Consommation (DPCC)
- etc.

*/


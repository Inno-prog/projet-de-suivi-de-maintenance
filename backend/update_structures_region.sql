-- Script to update existing structures with null region based on their ville
-- Using the official region-ville mapping from ReferenceDataService

-- First, create a temporary table to map villes to regions
CREATE TEMP TABLE IF NOT EXISTS ville_region_mapping (
    ville VARCHAR(100),
    region VARCHAR(100)
);

-- Insert the region-ville mapping from ReferenceDataService (Burkina Faso)
INSERT INTO ville_region_mapping (ville, region) VALUES
-- Bankui
('Dédougou', 'Bankui'),
('Nouna', 'Bankui'),
('Tougan', 'Bankui'),
('Solenzo', 'Bankui'),
('Toma', 'Bankui'),

-- Djôrô
('Gaoua', 'Djôrô'),
('Diébougou', 'Djôrô'),
('Dano', 'Djôrô'),
('Batié', 'Djôrô'),

-- Goulmou
('Fada N''Gourma', 'Goulmou'),
('Diapaga', 'Goulmou'),
('Bogandé', 'Goulmou'),
('Manni', 'Goulmou'),

-- Guiriko
('Bobo-Dioulasso', 'Guiriko'),
('Houndé', 'Guiriko'),
('Orodara', 'Guiriko'),

-- Kadiogo
('Ouagadougou', 'Kadiogo'),
('Saaba', 'Kadiogo'),
('Koubri', 'Kadiogo'),
('Tanghin-Dassouri', 'Kadiogo'),

-- Kuilsé
('Kaya', 'Kuilsé'),
('Kongoussi', 'Kuilsé'),
('Boulsa', 'Kuilsé'),
('Pissila', 'Kuilsé'),

-- Liptako
('Dori', 'Liptako'),
('Gorom-Gorom', 'Liptako'),
('Sebba', 'Liptako'),

-- Nando
('Koudougou', 'Nando'),
('Réo', 'Nando'),
('Léo', 'Nando'),
('Sabou', 'Nando'),

-- Nakambé
('Tenkodogo', 'Nakambé'),
('Koupéla', 'Nakambé'),
('Pouytenga', 'Nakambé'),
('Garango', 'Nakambé'),

-- Nazinon
('Manga', 'Nazinon'),
('Kombissiri', 'Nazinon'),
('Pô', 'Nazinon'),

-- Oubri
('Ziniaré', 'Oubri'),
('Boussé', 'Oubri'),
('Zorgho', 'Oubri'),

-- Sirba
('Bogandé', 'Sirba'),
('Manni', 'Sirba'),
('Coalla', 'Sirba'),

-- Soum
('Djibo', 'Soum'),
('Arbinda', 'Soum'),
('Tongomayel', 'Soum'),

-- Tannounyan
('Banfora', 'Tannounyan'),
('Sindou', 'Tannounyan'),
('Mangodara', 'Tannounyan'),

-- Tapoa
('Diapaga', 'Tapoa'),
('Pama', 'Tapoa'),

-- Sourou
('Tougan', 'Sourou'),
('Lankoué', 'Sourou'),
('Kiembara', 'Sourou'),

-- Yaadga
('Ouahigouya', 'Yaadga'),
('Gourcy', 'Yaadga'),
('Titao', 'Yaadga');

-- Now, update structures with null or empty region
UPDATE structures_mefp 
SET region = vrm.region
FROM ville_region_mapping vrm
WHERE structures_mefp.region IS NULL OR structures_mefp.region = ''
AND structures_mefp.ville = vrm.ville;

-- Verify the update
SELECT id, nom, ville, region 
FROM structures_mefp 
WHERE region IS NULL OR region = '';

-- Clean up the temporary table
DROP TABLE IF EXISTS ville_region_mapping;

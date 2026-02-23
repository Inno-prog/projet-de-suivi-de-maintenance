-- Vérifier les informations du lot 7
SELECT * FROM lots WHERE id = 7;

-- Vérifier les contrats associés au lot 7
SELECT c.id_contrat, c.nom_prestataire, c.ville, c.lot
FROM contrats c 
WHERE c.lot LIKE '%7%';

-- Vérifier les structures MEFP dans les régions du lot 7
-- D'abord, récupérer les régions du lot 7
WITH lot_regions AS (
    SELECT regions FROM lots WHERE id = 7
)
SELECT s.id, s.nom, s.ville, s.region
FROM structures_mefp s
WHERE s.region IN (
    SELECT unnest(regions) 
    FROM lot_regions
);

-- Vérifier les structures MEFP avec region null ou vide
SELECT id, nom, ville, region 
FROM structures_mefp 
WHERE region IS NULL OR region = '';

-- SQL script to fix itemQuantities field for NetCom Africa's prestation
-- First, let's check what we're dealing with

-- Find the NetCom Africa prestation
SELECT p.id, p.nom_prestataire, p.item_quantities
FROM prestations p
WHERE p.nom_prestataire = 'NetCom Africa';

-- If item_quantities is null or empty, let's update it with the correct values
UPDATE prestations
SET item_quantities = '{"1": 2, "2": 3}'
WHERE id = (SELECT id FROM prestations WHERE nom_prestataire = 'NetCom Africa');

-- Verify the change
SELECT p.id, p.nom_prestataire, p.item_quantities
FROM prestations p
WHERE p.nom_prestataire = 'NetCom Africa';

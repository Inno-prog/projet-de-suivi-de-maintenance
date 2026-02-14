-- Script to insert contracts for existing prestataires

-- First, check existing prestataires
SELECT id, email, nom, structure FROM prestataires;

-- Check existing items and their lots
SELECT DISTINCT lot FROM items;

-- Insert contracts for IT Solutions Burkina (lot1)
INSERT INTO contrats (id_contrat, date_debut, date_fin, nom_prestataire, montant, montant_restant, lot_name, type_contrat, statut, ville, prestataire_id)
VALUES (
    'CONTRAT-IT-SOLUTIONS-001',
    '2023-01-01',
    '2023-12-31',
    'IT Solutions Burkina',
    1000000.00,
    1000000.00,
    'lot1',
    'MAINTENANCE_INFORMATIQUE',
    'ACTIF',
    'Ouagadougou',
    (SELECT id FROM prestataires WHERE structure = 'IT Solutions Burkina')
);

-- Insert contracts for other prestataires if they exist
-- For example, if there's a prestataire with structure 'Softlink Technologies'
-- INSERT INTO contrats (id_contrat, date_debut, date_fin, nom_prestataire, montant, montant_restant, lot_name, type_contrat, statut, ville, prestataire_id)
-- VALUES (
--     'CONTRAT-SOFTLINK-001',
--     '2023-01-01',
--     '2023-12-31',
--     'Softlink Technologies',
--     1500000.00,
--     1500000.00,
--     'lot4',
--     'MAINTENANCE_INFORMATIQUE',
--     'ACTIF',
--     'Ouagadougou',
--     (SELECT id FROM prestataires WHERE structure = 'Softlink Technologies')
-- );

-- Check inserted contracts
SELECT * FROM contrats;

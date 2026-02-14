-- Script SQL pour réinitialiser le système de fiches et items

-- Supprimer toutes les fiches de prestation
DELETE FROM fiches_prestation;

-- Supprimer toutes les prestations
DELETE FROM prestations;

-- Réinitialiser les compteurs d'ID pour les tables
ALTER TABLE fiches_prestation ALTER COLUMN id RESTART WITH 1;
ALTER TABLE prestations ALTER COLUMN id RESTART WITH 1;

-- Réinitialiser les quantités utilisées des items
UPDATE items SET quantite_utilisee = 0, quantite_utilisee_trimestre = 0;

-- Vérifier les modifications
SELECT COUNT(*) AS nb_fiches FROM fiches_prestation;
SELECT COUNT(*) AS nb_prestations FROM prestations;
SELECT id, nom_item, quantite_utilisee, quantite_utilisee_trimestre FROM items;

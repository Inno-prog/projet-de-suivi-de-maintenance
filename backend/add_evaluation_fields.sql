-- Script SQL pour ajouter les nouveaux champs à la table evaluation_trimestrielle
-- Conforme aux exigences du formulaire d'évaluation

ALTER TABLE evaluation_trimestrielle
ADD COLUMN instance1 VARCHAR(500),
ADD COLUMN direction1 VARCHAR(500),
ADD COLUMN date_debut1 DATE,
ADD COLUMN jours_penalite1 INTEGER,
ADD COLUMN obs_instance1 VARCHAR(500),
ADD COLUMN signature_prestataire VARCHAR(200),
ADD COLUMN signature_direction VARCHAR(200),
ADD COLUMN signature_dgsi VARCHAR(200);

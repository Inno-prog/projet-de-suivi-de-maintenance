-- Script pour ajouter le champ montant_restant à la table contrats
-- et l'initialiser avec la valeur du montant original

-- Ajouter la colonne montant_restant si elle n'existe pas déjà
ALTER TABLE contrats ADD COLUMN IF NOT EXISTS montant_restant DOUBLE;

-- Initialiser montant_restant avec la valeur du montant pour les contrats existants
UPDATE contrats 
SET montant_restant = montant 
WHERE montant_restant IS NULL;

-- Vérifier les résultats
SELECT id, id_contrat, nom_prestataire, montant, montant_restant, statut 
FROM contrats 
ORDER BY id;
DROP TABLE IF EXISTS evaluation_trimestrielle;

CREATE TABLE evaluation_trimestrielle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Champs principaux
    session_id BIGINT,
    trimestre VARCHAR(50),
    lot VARCHAR(50),
    prestataire_nom VARCHAR(200),
    date_evaluation DATE,
    evaluateur_nom VARCHAR(200),
    correspondant_id BIGINT,
    
    -- Liste des techniciens (format JSON)
    techniciens_liste TEXT,
    techniciens_certifies BOOLEAN,
    
    -- Critères d'évaluation
    rapport_intervention_transmis BOOLEAN,
    registre_rempli BOOLEAN,
    horaires_respectes BOOLEAN,
    delai_reaction_respecte BOOLEAN,
    delai_intervention_respecte BOOLEAN,
    vehicule_disponible BOOLEAN,
    tenue_disponible BOOLEAN,
    
    -- Observations pour chaque critère
    obs_techniciens VARCHAR(500),
    obs_rapport VARCHAR(500),
    obs_registre VARCHAR(500),
    obs_horaires VARCHAR(500),
    obs_delai_reaction VARCHAR(500),
    obs_delai_intervention VARCHAR(500),
    obs_vehicule VARCHAR(500),
    obs_tenue VARCHAR(500),
    
    -- Exigences détaillées (9 exigences)
    exigence1 VARCHAR(500),
    exigence2 VARCHAR(500),
    exigence3 VARCHAR(500),
    exigence4 VARCHAR(500),
    exigence5 VARCHAR(500),
    exigence6 VARCHAR(500),
    exigence7 VARCHAR(500),
    exigence8 VARCHAR(500),
    exigence9 VARCHAR(500),
    
    -- Observations pour chaque exigence
    obs1 VARCHAR(500),
    obs2 VARCHAR(500),
    obs3 VARCHAR(500),
    obs4 VARCHAR(500),
    obs5 VARCHAR(500),
    obs6 VARCHAR(500),
    obs7 VARCHAR(500),
    obs8 VARCHAR(500),
    obs9 VARCHAR(500),
    
    -- Instances non résolues
    instance1 VARCHAR(500),
    direction1 VARCHAR(500),
    date_debut1 DATE,
    jours_penalite1 INTEGER,
    obs_instance1 VARCHAR(500),
    
    -- Signatures
    signature_prestataire VARCHAR(200),
    signature_direction VARCHAR(200),
    signature_dgsi VARCHAR(200),
    
    -- Champs additionnels
    prestations_verifiees VARCHAR(500),
    instances_non_resolues VARCHAR(500),
    observations_generales TEXT,
    appreciation_representant TEXT,
    signature_representant TEXT,
    signature_evaluateur TEXT,
    preuves VARCHAR(500),
    statut VARCHAR(50),
    penalites_calcul DECIMAL(10, 2),
    note_finale DECIMAL(5, 2),
    prestataire_declasse BOOLEAN,
    score_global INTEGER,
    recommandation VARCHAR(50),
    
    -- Champs de audit
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    utilisateur_creation BIGINT,
    utilisateur_modification BIGINT,
    
    -- Fichier PDF généré
    fichier_pdf VARCHAR(500)
);

-- Créer les indexes pour améliorer les performances
CREATE INDEX idx_eval_trimestre ON evaluation_trimestrielle(trimestre);
CREATE INDEX idx_eval_prestataire ON evaluation_trimestrielle(prestataire_nom);
CREATE INDEX idx_eval_lot ON evaluation_trimestrielle(lot);
CREATE INDEX idx_eval_statut ON evaluation_trimestrielle(statut);
CREATE INDEX idx_eval_date ON evaluation_trimestrielle(date_evaluation);

-- Ajouter des commentaires
COMMENT ON TABLE evaluation_trimestrielle IS 'Table des évaluations trimestrielles des prestataires de maintenance';
COMMENT ON COLUMN evaluation_trimestrielle.trimestre IS 'Trimestre de l''évaluation (T1, T2, T3, T4)';
COMMENT ON COLUMN evaluation_trimestrielle.lot IS 'Numéro du lot concerné par l''évaluation';
COMMENT ON COLUMN evaluation_trimestrielle.prestataire_nom IS 'Nom du prestataire évalué';

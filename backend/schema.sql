-- ===========================================
-- SCHÉMA DE BASE DE DONNÉES - DGSI Maintenance
-- Généré automatiquement à partir des entités JPA
-- Date: 17/12/2025
-- ===========================================

-- ===========================================
-- TABLES PRINCIPALES
-- ===========================================

-- Table des utilisateurs (base pour tous les types d'utilisateurs)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    telephone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des lots
CREATE TABLE lots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom_lot VARCHAR(255) NOT NULL,
    description TEXT,
    budget_alloue DECIMAL(15,2),
    budget_utilise DECIMAL(15,2) DEFAULT 0,
    statut VARCHAR(50) DEFAULT 'ACTIF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des prestataires (hérite de users)
CREATE TABLE prestataires (
    id BIGINT PRIMARY KEY,
    qualification VARCHAR(255),
    structure VARCHAR(255),
    direction VARCHAR(255),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des administrateurs (hérite de users)
CREATE TABLE administrators (
    id BIGINT PRIMARY KEY,
    privileges TEXT,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des agents DGSI (hérite de users)
CREATE TABLE agent_dgsi (
    id BIGINT PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE,
    poste VARCHAR(255),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des structures MEFP
CREATE TABLE structures_mefp (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom_structure VARCHAR(255) NOT NULL,
    type_structure VARCHAR(100),
    adresse VARCHAR(500),
    telephone VARCHAR(50),
    email VARCHAR(255),
    responsable VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des ordres de commande
CREATE TABLE ordres_commande (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_ordre VARCHAR(100) UNIQUE NOT NULL,
    date_commande DATE NOT NULL,
    montant_total DECIMAL(15,2),
    statut VARCHAR(50) DEFAULT 'EN_COURS',
    prestataire_id BIGINT,
    lot_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prestataire_id) REFERENCES prestataires(id),
    FOREIGN KEY (lot_id) REFERENCES lots(id)
);

-- Table des contrats
CREATE TABLE contrats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_contrat VARCHAR(100) UNIQUE NOT NULL,
    objet_contrat TEXT,
    montant_contrat DECIMAL(15,2),
    date_signature DATE,
    date_debut DATE,
    date_fin DATE,
    statut VARCHAR(50) DEFAULT 'ACTIF',
    prestataire_id BIGINT NOT NULL,
    fichiers_contrat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prestataire_id) REFERENCES prestataires(id)
);

-- Table des équipements
CREATE TABLE equipements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom_equipement VARCHAR(255) NOT NULL,
    type_equipement VARCHAR(100),
    numero_serie VARCHAR(100) UNIQUE,
    marque VARCHAR(100),
    modele VARCHAR(100),
    date_acquisition DATE,
    valeur_acquisition DECIMAL(12,2),
    statut VARCHAR(50) DEFAULT 'ACTIF',
    structure_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (structure_id) REFERENCES structures_mefp(id)
);

-- Table des items/équipements de maintenance
CREATE TABLE items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_item INT UNIQUE,
    nom_item VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    prix FLOAT NOT NULL,
    quantite_min_trimestre INT,
    quantite_max_trimestre INT NOT NULL,
    quantite_utilisee INT DEFAULT 0,
    quantite_utilisee_trimestre INT DEFAULT 0,
    lot VARCHAR(255),
    ordre_commande_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ordre_commande_id) REFERENCES ordres_commande(id)
);

-- Table des prestations
CREATE TABLE prestations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prestataire_id VARCHAR(255),
    nom_prestataire VARCHAR(255) NOT NULL,
    nom_responsable_prestation VARCHAR(255),
    contact_responsable_prestation VARCHAR(255),
    qualification_responsable_prestation VARCHAR(255),
    structure_prestataire VARCHAR(255),
    service_prestataire VARCHAR(255),
    role_prestataire VARCHAR(255),
    qualification_prestataire VARCHAR(255),
    montant_intervention DECIMAL(10,2),
    date_heure_debut TIMESTAMP NOT NULL,
    date_heure_fin TIMESTAMP NOT NULL,
    statut_intervention VARCHAR(255) NOT NULL,
    statut_validation VARCHAR(50) DEFAULT 'EN_ATTENTE',
    deleted BOOLEAN DEFAULT FALSE,
    nom_structure VARCHAR(255) NOT NULL,
    contact_structure VARCHAR(255),
    adresse_structure VARCHAR(255),
    fonction_structure VARCHAR(255),
    nom_ci VARCHAR(255),
    prenom_ci VARCHAR(255),
    contact_ci VARCHAR(255),
    fonction_ci VARCHAR(255),
    direction_prestataire VARCHAR(255),
    prenom_structure VARCHAR(255),
    service_structure VARCHAR(255),
    nom_prestation VARCHAR(255),
    montant_prest DECIMAL(10,2),
    nb_prest_realise INT,
    trimestre VARCHAR(50),
    date_debut DATE,
    date_fin DATE,
    statut VARCHAR(50),
    description TEXT,
    ordre_commande_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ordre_commande_id) REFERENCES ordres_commande(id)
);

-- Table des fiches de prestation
CREATE TABLE fiches_prestation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_prestation VARCHAR(255) UNIQUE NOT NULL,
    nom_prestataire VARCHAR(255) NOT NULL,
    nom_item VARCHAR(255),
    nom_structure VARCHAR(255),
    items_couverts TEXT,
    date_realisation TIMESTAMP NOT NULL,
    statut VARCHAR(50) DEFAULT 'EN_ATTENTE',
    quantite INT,
    commentaire TEXT,
    fichiers_contrat TEXT,
    statut_intervention VARCHAR(255),
    prestataire_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prestataire_id) REFERENCES prestataires(id)
);

-- Table des rapports de suivi
CREATE TABLE rapports_suivi (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    contenu TEXT,
    type_rapport VARCHAR(50),
    periode_debut DATE,
    periode_fin DATE,
    auteur_id BIGINT,
    statut VARCHAR(50) DEFAULT 'BROUILLON',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auteur_id) REFERENCES users(id)
);

-- Table des notifications
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    message TEXT,
    type_notification VARCHAR(50),
    destinataire_id BIGINT,
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destinataire_id) REFERENCES users(id)
);

-- ===========================================
-- TABLES DE RELATIONS (Many-to-Many)
-- ===========================================

-- Table de liaison prestation-item
CREATE TABLE prestation_item (
    prestation_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    PRIMARY KEY (prestation_id, item_id),
    FOREIGN KEY (prestation_id) REFERENCES prestations(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Table de liaison item-équipement
CREATE TABLE item_equipement (
    item_id BIGINT NOT NULL,
    equipement_id BIGINT NOT NULL,
    PRIMARY KEY (item_id, equipement_id),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (equipement_id) REFERENCES equipements(id) ON DELETE CASCADE
);

-- ===========================================
-- TABLES D'ÉNUMÉRATIONS/STATUTS
-- ===========================================

-- Table des rôles
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom_role VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Table des statuts de commande
CREATE TABLE statuts_commande (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table des statuts de contrat
CREATE TABLE statuts_contrat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table des statuts de fiche
CREATE TABLE statuts_fiche (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table des statuts de rapport
CREATE TABLE statuts_rapport (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table des trimestres
CREATE TABLE trimestres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code_trimestre VARCHAR(10) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    annee INT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL
);

-- Table des types d'items
CREATE TABLE types_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code_type VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    description TEXT
);

-- ===========================================
-- INDEXES POUR LES PERFORMANCES
-- ===========================================

-- Indexes sur les tables principales
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_fiches_prestation_id_prestation ON fiches_prestation(id_prestation);
CREATE INDEX idx_fiches_prestation_date ON fiches_prestation(date_realisation);
CREATE INDEX idx_fiches_prestation_statut ON fiches_prestation(statut);

CREATE INDEX idx_prestations_date_debut ON prestations(date_heure_debut);
CREATE INDEX idx_prestations_date_fin ON prestations(date_heure_fin);
CREATE INDEX idx_prestations_statut ON prestations(statut_intervention);

CREATE INDEX idx_items_nom ON items(nom_item);
CREATE INDEX idx_items_lot ON items(lot);

CREATE INDEX idx_contrats_numero ON contrats(numero_contrat);
CREATE INDEX idx_contrats_statut ON contrats(statut);

CREATE INDEX idx_ordres_commande_numero ON ordres_commande(numero_ordre);
CREATE INDEX idx_ordres_commande_statut ON ordres_commande(statut);

-- ===========================================
-- DONNÉES DE BASE (Enums)
-- ===========================================

-- Insertion des rôles de base
INSERT INTO roles (nom_role, description) VALUES
('ADMIN', 'Administrateur système'),
('PRESTATAIRE', 'Prestataire de maintenance'),
('AGENT_DGSI', 'Agent DGSI');

-- Insertion des statuts de base
INSERT INTO statuts_fiche (code, libelle, description) VALUES
('EN_ATTENTE', 'En attente', 'Fiche en attente de validation'),
('VALIDE', 'Validée', 'Fiche validée'),
('REJETE', 'Rejetée', 'Fiche rejetée');

INSERT INTO statuts_contrat (code, libelle, description) VALUES
('BROUILLON', 'Brouillon', 'Contrat en cours de rédaction'),
('ACTIF', 'Actif', 'Contrat actif'),
('SUSPENDU', 'Suspendu', 'Contrat suspendu'),
('TERMINE', 'Terminé', 'Contrat terminé');

INSERT INTO statuts_commande (code, libelle, description) VALUES
('EN_COURS', 'En cours', 'Commande en cours de traitement'),
('LIVREE', 'Livrée', 'Commande livrée'),
('ANNULEE', 'Annulée', 'Commande annulée');

-- ===========================================
-- CONTRAINTES SUPPLÉMENTAIRES
-- ===========================================

-- Contrainte de vérification pour les montants
ALTER TABLE contrats ADD CONSTRAINT chk_montant_contrat CHECK (montant_contrat >= 0);
ALTER TABLE prestations ADD CONSTRAINT chk_montant_intervention CHECK (montant_intervention >= 0);
ALTER TABLE items ADD CONSTRAINT chk_prix_item CHECK (prix >= 0);

-- Contrainte de vérification pour les quantités
ALTER TABLE items ADD CONSTRAINT chk_quantite_max CHECK (quantite_max_trimestre >= quantite_min_trimestre);

-- Contrainte pour s'assurer que la date de fin est après la date de début
ALTER TABLE prestations ADD CONSTRAINT chk_dates_prestation CHECK (date_heure_fin >= date_heure_debut);
ALTER TABLE contrats ADD CONSTRAINT chk_dates_contrat CHECK (date_fin >= date_debut);

-- ===========================================
-- COMMENTAIRES SUR LES TABLES
-- ===========================================

-- Commentaire général sur le schéma
COMMENT ON DATABASE maintenance_db IS 'Base de données du système de suivi de maintenance DGSI - Ministère de l''Économie et des Finances';

-- Commentaires sur les tables principales
COMMENT ON TABLE users IS 'Table des utilisateurs du système (base pour l''héritage)';
COMMENT ON TABLE prestataires IS 'Prestataires de maintenance externes';
COMMENT ON TABLE fiches_prestation IS 'Fiches détaillées des prestations réalisées';
COMMENT ON TABLE prestations IS 'Prestations de maintenance programmées';
COMMENT ON TABLE items IS 'Équipements et consommables de maintenance';
COMMENT ON TABLE contrats IS 'Contrats passés avec les prestataires';
COMMENT ON TABLE ordres_commande IS 'Ordres de commande pour les équipements';
COMMENT ON TABLE lots IS 'Lots budgétaires pour la maintenance';
COMMENT ON TABLE structures_mefp IS 'Structures du Ministère de l''Économie et des Finances';

-- ===========================================
-- FIN DU SCHÉMA
-- ===========================================

-- Script pour mapper les contrats aux prestataires Keycloak
-- Basé sur les données de Maintenance-DGSI-users-0.json

-- =====================================================
-- MAPPING DES PRESTATAIRES KEYCLOAK
-- =====================================================
-- ID Keycloak -> Nom Prestataire
-- cybertech: ba42c460-f9c9-4898-b306-55e68ef6e1e1 -> CyberTech SARL
-- digitalsolutions: 32cd5a51-781c-4b6f-8a82-24418aa0ecd7 -> Digital Solutions
-- infotech: 6fd12a0e-134d-4a0d-9d37-ffd7d736ac01 -> InfoTech Burkina
-- itsolutions: 6aef439b-9ccf-40f5-b308-c88d6e1bf86d -> IT Solutions Burkina
-- netcom: ec37b3b0-f6a0-40da-ac99-796e0bdb6748 -> NetCom Afrique
-- prestataire: 06ec7a2e-288b-44ee-bc55-62a95238a5ca -> Prestataire Service
-- softlink: 4bfe28fb-fb80-4319-8e98-9b4ad4a8a8ab -> SoftLink Technologies
-- techpro: b87e5fb6-e35f-43ac-91a1-265ed480dd46 -> TechPro Services
-- techserve: c3d71146-fbe7-45d2-81ad-14ee60051d68 -> TechServe SARL

-- =====================================================
-- MISE A JOUR DES CONTRATS
-- =====================================================

-- CyberTech SARL
UPDATE contrats 
SET prestataire_id = 'ba42c460-f9c9-4898-b306-55e68ef6e1e1'
WHERE nom_prestataire LIKE '%CyberTech%';

-- Digital Solutions
UPDATE contrats 
SET prestataire_id = '32cd5a51-781c-4b6f-8a82-24418aa0ecd7'
WHERE nom_prestataire LIKE '%Digital Solutions%';

-- InfoTech Burkina
UPDATE contrats 
SET prestataire_id = '6fd12a0e-134d-4a0d-9d37-ffd7d736ac01'
WHERE nom_prestataire LIKE '%InfoTech%';

-- IT Solutions Burkina
UPDATE contrats 
SET prestataire_id = '6aef439b-9ccf-40f5-b308-c88d6e1bf86d'
WHERE nom_prestataire LIKE '%IT Solutions%';

-- NetCom Afrique
UPDATE contrats 
SET prestataire_id = 'ec37b3b0-f6a0-40da-ac99-796e0bdb6748'
WHERE nom_prestataire LIKE '%NetCom%';

-- Prestataire Service
UPDATE contrats 
SET prestataire_id = '06ec7a2e-288b-44ee-bc55-62a95238a5ca'
WHERE nom_prestataire LIKE '%Prestataire Service%';

-- SoftLink Technologies
UPDATE contrats 
SET prestataire_id = '4bfe28fb-fb80-4319-8e98-9b4ad4a8a8ab'
WHERE nom_prestataire LIKE '%SoftLink%';

-- TechPro Services
UPDATE contrats 
SET prestataire_id = 'b87e5fb6-e35f-43ac-91a1-265ed480dd46'
WHERE nom_prestataire LIKE '%TechPro%';

-- TechServe SARL
UPDATE contrats 
SET prestataire_id = 'c3d71146-fbe7-45d2-81ad-14ee60051d68'
WHERE nom_prestataire LIKE '%TechServe%';

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT id, id_contrat, nom_prestataire, prestataire_id 
FROM contrats 
WHERE prestataire_id IS NOT NULL 
ORDER BY nom_prestataire;

SELECT COUNT(*) as total_contrats, COUNT(prestataire_id) as contrats_mappes 
FROM contrats;

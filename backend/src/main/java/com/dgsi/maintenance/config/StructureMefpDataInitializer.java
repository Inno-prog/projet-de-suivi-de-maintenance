package com.dgsi.maintenance.config;

import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.StructureMefp;
import com.dgsi.maintenance.repository.StructureMefpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(3)
public class StructureMefpDataInitializer implements CommandLineRunner {
    private static final Logger logger = Logger.getLogger(StructureMefpDataInitializer.class.getName());

    @Autowired
    private StructureMefpRepository structureMefpRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Structure MEFP data initialization started");

        // Initialiser les structures MEFP si la base est vide
        if (structureMefpRepository.count() == 0) {
            logger.info("Initializing StructureMefp data...");
            initStructuresMefp();
            logger.info("StructureMefp data initialized");
        } else {
            logger.info("StructureMefp data already exists, skipping initialization");
        }
    }

    private void initStructuresMefp() {
        List<StructureMefp> structures = Arrays.asList(
            createStructure(
                "Direction Générale du Budget",
                "DGB",
                "dgb@finances.gov.bf",
                "Ouagadougou",
                "Avenue de l'Indépendance, Secteur 4, 01 BP 7008 Ouagadougou 01",
                "Direction centrale chargée de la préparation et de l'exécution du budget de l'État",
                "DIRECTION_CENTRALE",
                "OUEDRAOGO",
                "Amadou",
                "+226 25 30 60 70",
                "Directeur des Systèmes d'Information"
            ),
            createStructure(
                "Direction Générale des Impôts",
                "DGI",
                "dgi@finances.gov.bf",
                "Ouagadougou",
                "Avenue Kwame Nkrumah, Secteur 1, 01 BP 7010 Ouagadougou 01",
                "Direction centrale chargée de la collecte des impôts et taxes",
                "DIRECTION_CENTRALE",
                "SAWADOGO",
                "Fatimata",
                "+226 25 30 60 80",
                "Chef Service Informatique"
            ),
            createStructure(
                "Direction Générale des Douanes",
                "DGD",
                "dgd@finances.gov.bf",
                "Ouagadougou",
                "Avenue Charles de Gaulle, Secteur 2, 01 BP 7012 Ouagadougou 01",
                "Direction centrale chargée des opérations douanières",
                "DIRECTION_CENTRALE",
                "KONE",
                "Ibrahim",
                "+226 25 30 60 90",
                "Responsable Informatique"
            ),
            createStructure(
                "Direction Générale du Trésor et de la Comptabilité Publique",
                "DGTCP",
                "dgtcp@finances.gov.bf",
                "Ouagadougou",
                "Avenue de la Nation, Secteur 3, 01 BP 7014 Ouagadougou 01",
                "Direction centrale chargée de la gestion du trésor public",
                "DIRECTION_CENTRALE",
                "TRAORE",
                "Mariam",
                "+226 25 30 61 00",
                "Directrice Adjointe SI"
            ),
            createStructure(
                "Direction Régionale du Centre",
                "DR-CENTRE",
                "dr.centre@finances.gov.bf",
                "Ouagadougou",
                "Boulevard Circular, Secteur 7, 01 BP 7016 Ouagadougou 01",
                "Direction régionale couvrant la région du Centre",
                "DIRECTION_REGIONALE",
                "COMPAORE",
                "Jean-Baptiste",
                "+226 25 30 61 10",
                "Chef Service Technique"
            ),
            createStructure(
                "Direction Régionale des Hauts-Bassins",
                "DR-HAUTS-BASSINS",
                "dr.hautsbassins@finances.gov.bf",
                "Bobo-Dioulasso",
                "Avenue de la République, Secteur 5, 01 BP 1018 Bobo-Dioulasso 01",
                "Direction régionale couvrant la région des Hauts-Bassins",
                "DIRECTION_REGIONALE",
                "OUATTARA",
                "Aminata",
                "+226 20 97 00 50",
                "Responsable Maintenance IT"
            ),
            createStructure(
                "Direction Régionale du Nord",
                "DR-NORD",
                "dr.nord@finances.gov.bf",
                "Ouahigouya",
                "Avenue de l'Unité Africaine, BP 20 Ouahigouya",
                "Direction régionale couvrant la région du Nord",
                "DIRECTION_REGIONALE",
                "YAMEOGO",
                "Paul",
                "+226 24 55 00 30",
                "Technicien Informatique"
            ),
            createStructure(
                "Direction Régionale de l'Est",
                "DR-EST",
                "dr.est@finances.gov.bf",
                "Fada N'Gourma",
                "Route Nationale 4, BP 25 Fada N'Gourma",
                "Direction régionale couvrant la région de l'Est",
                "DIRECTION_REGIONALE",
                "KABORE",
                "Salimata",
                "+226 24 77 00 20",
                "Correspondante Informatique"
            ),
            createStructure(
                "Inspection Générale des Finances",
                "IGF",
                "igf@finances.gov.bf",
                "Ouagadougou",
                "Rue de la Révolution, Secteur 4, 01 BP 7020 Ouagadougou 01",
                "Service d'inspection et de contrôle des finances publiques",
                "SERVICE_CONTROLE",
                "ZONGO",
                "Abdoulaye",
                "+226 25 30 61 20",
                "Inspecteur Général Adjoint"
            ),
            createStructure(
                "Secrétariat Général",
                "SG-MINEFID",
                "sg@finances.gov.bf",
                "Ouagadougou",
                "Immeuble du Ministère, Secteur 4, 03 BP 7022 Ouagadougou 03",
                "Secrétariat général du Ministère de l'Économie et des Finances",
                "SECRETARIAT",
                "ILBOUDO",
                "Christine",
                "+226 25 30 61 30",
                "Secrétaire Général Adjoint"
            )
        );

        // Sauvegarder les structures
        structureMefpRepository.saveAll(structures);
        logger.info("Structures MEFP créées avec succès: " + structures.size() + " structures");
    }

    private StructureMefp createStructure(String nom, String contact, String email, String ville, 
                                         String adresse, String description, String categorie,
                                         String nomCI, String prenomCI, String contactCI, String fonctionCI) {
        StructureMefp structure = new StructureMefp();
        structure.setNom(nom);
        structure.setContact(contact);
        structure.setEmail(email);
        structure.setVille(ville);
        structure.setAdresseStructure(adresse);
        structure.setDescription(description);
        structure.setCategorie(categorie);
        
        // Informations du Correspondant Informatique
        structure.setNomCI(nomCI);
        structure.setPrenomCI(prenomCI);
        structure.setContactCI(contactCI);
        structure.setFonctionCI(fonctionCI);
        
        return structure;
    }
}
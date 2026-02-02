package com.dgsi.maintenance.config;

import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.Prestation;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import com.dgsi.maintenance.repository.PrestationRepository;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.service.FichePrestationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Component
@Profile("development")
public class UpdateFicheNumerationFix implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(UpdateFicheNumerationFix.class.getName());

    @Autowired
    private FichePrestationRepository ficheRepository;

    @Autowired
    private PrestationRepository prestationRepository;

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private FichePrestationService fichePrestationService;

    @Override
    public void run(String... args) {
        logger.info("Début de la mise à jour des numéros de fiches");

        List<FichePrestation> fiches = ficheRepository.findAll();
        logger.info("Nombre de fiches à traiter: " + fiches.size());

        int updatedCount = 0;

        for (FichePrestation fiche : fiches) {
            // Vérifier si le numéro de fiche est déjà au format correct
            if (fiche.getNumeroFiche() != null && fiche.getNumeroFiche().matches("T\\d+-L\\d+-\\d+")) {
                logger.info("Fiche " + fiche.getId() + " déjà au format correct: " + fiche.getNumeroFiche());
                continue;
            }

            // Tentative de récupération de la prestation associée
            int trimestre = 1;
            int lot = 1;

            try {
                if (fiche.getIdPrestation() != null && !fiche.getIdPrestation().trim().isEmpty()) {
                    Long prestationId = Long.parseLong(fiche.getIdPrestation());
                    Optional<Prestation> prestationOpt = prestationRepository.findById(prestationId);

                    if (prestationOpt.isPresent()) {
                        Prestation prestation = prestationOpt.get();

                        // Extraire le trimestre
                        if (prestation.getTrimestre() != null) {
                            switch (prestation.getTrimestre()) {
                                case "T1":
                                    trimestre = 1;
                                    break;
                                case "T2":
                                    trimestre = 2;
                                    break;
                                case "T3":
                                    trimestre = 3;
                                    break;
                                case "T4":
                                    trimestre = 4;
                                    break;
                            }
                        }

                        // Extraire le lot à partir de la relation prestataire-contrat
                        if (prestation.getNomPrestataire() != null) {
                            var contrats = contratRepository.findByNomPrestataire(prestation.getNomPrestataire());
                            if (!contrats.isEmpty()) {
                                for (var contrat : contrats) {
                                    if (contrat.getLot() != null && !contrat.getLot().trim().isEmpty()) {
                                        lot = fichePrestationService.extractLotNumber(contrat.getLot());
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                logger.warning("Erreur lors de l'extraction du trimestre/lot pour la fiche " + fiche.getId() + ": " + e.getMessage());
            }

            // Générer le nouveau numéro de fiche
            String newNumero = fichePrestationService.getNextAvailableNumero(trimestre, lot);
            fiche.setNumeroFiche(newNumero);
            ficheRepository.save(fiche);
            updatedCount++;

            logger.info("Fiche " + fiche.getId() + " mise à jour: " + newNumero);
        }

        logger.info("Mise à jour terminée. Nombre de fiches modifiées: " + updatedCount);
    }
}

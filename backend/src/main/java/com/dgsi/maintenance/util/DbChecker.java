package com.dgsi.maintenance.util;

import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.repository.ContratRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DbChecker implements CommandLineRunner {

    private final ContratRepository contratRepository;
    private final DatabaseFixer databaseFixer;

    public DbChecker(ContratRepository contratRepository, DatabaseFixer databaseFixer) {
        this.contratRepository = contratRepository;
        this.databaseFixer = databaseFixer;
    }

    @Override
    @Transactional
    public void run(String... args) {
        System.out.println("=== Analyse des données de la base ===");
        
        // Exécuter les corrections de la base de données
        System.out.println("\n=== Exécution des corrections ===");
        databaseFixer.fixPrestataireContracts();
        
        // Vérifier les contrats
        List<Contrat> allContrats = contratRepository.findAll();
        System.out.println("\n=== Contrats totaux: " + allContrats.size() + " ===");
        
        // Vérifier les contrats actifs
        List<Contrat> activeContrats = allContrats.stream()
                .filter(c -> c.getStatut() == com.dgsi.maintenance.entity.StatutContrat.ACTIF)
                .collect(Collectors.toList());
        System.out.println("\n=== Contrats actifs: " + activeContrats.size() + " ===");
        
        // Vérifier les prestataires uniques
        Set<String> uniquePrestataires = activeContrats.stream()
                .map(Contrat::getNomPrestataire)
                .collect(Collectors.toSet());
        System.out.println("\n=== Prestataires uniques avec contrats actifs: " + uniquePrestataires.size() + " ===");
        uniquePrestataires.stream()
                .sorted()
                .forEach(prestataire -> System.out.println("  - " + prestataire));
        
        // Vérifier les lots des contrats actifs
        System.out.println("\n=== Lots des contrats actifs ===");
        activeContrats.stream()
                .sorted((c1, c2) -> c1.getNomPrestataire().compareToIgnoreCase(c2.getNomPrestataire()))
                .forEach(contrat -> {
                    System.out.printf("  Prestataire: %-30s Lot: %-10s Statut: %-10s PrestataireId: %s%n",
                            contrat.getNomPrestataire(),
                            contrat.getLot() != null ? contrat.getLot() : "null",
                            contrat.getStatut(),
                            contrat.getPrestataire() != null ? contrat.getPrestataire().getId() : "null");
                });
        
        System.out.println("\n=== Fin de l'analyse ===");
    }
}

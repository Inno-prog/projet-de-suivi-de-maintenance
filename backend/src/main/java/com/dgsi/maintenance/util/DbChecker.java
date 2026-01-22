package com.dgsi.maintenance.util;

import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.ItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DbChecker implements CommandLineRunner {

    private final ContratRepository contratRepository;
    private final ItemRepository itemRepository;
    private final DatabaseFixer databaseFixer;

    public DbChecker(ContratRepository contratRepository, ItemRepository itemRepository, DatabaseFixer databaseFixer) {
        this.contratRepository = contratRepository;
        this.itemRepository = itemRepository;
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
        
        // Vérifier les items
        List<Item> allItems = itemRepository.findAll();
        System.out.println("\n=== Items totaux: " + allItems.size() + " ===");
        
        // Vérifier les items par lot
        System.out.println("\n=== Items par lot ===");
        allItems.stream()
                .collect(Collectors.groupingBy(Item::getLot))
                .entrySet().stream()
                .sorted((e1, e2) -> {
                    if (e1.getKey() == null && e2.getKey() == null) return 0;
                    if (e1.getKey() == null) return -1;
                    if (e2.getKey() == null) return 1;
                    return e1.getKey().compareToIgnoreCase(e2.getKey());
                })
                .forEach(entry -> {
                    System.out.printf("  Lot: %-10s Nombre: %-3d Items: %s%n",
                            entry.getKey() != null ? entry.getKey() : "null",
                            entry.getValue().size(),
                            entry.getValue().stream()
                                    .map(Item::getNomItem)
                                    .limit(3)
                                    .collect(Collectors.joining(", ")));
                });
        
        // Vérifier la correspondance entre contrats et items par prestataire
        System.out.println("\n=== Vérification des items par prestataire ===");
        for (String prestataire : uniquePrestataires) {
            System.out.printf("\n  --- Prestataire: %s ---%n", prestataire);
            
            List<Contrat> prestataireContrats = activeContrats.stream()
                    .filter(c -> c.getNomPrestataire().equals(prestataire))
                    .collect(Collectors.toList());
            
            Set<String> prestataireLots = prestataireContrats.stream()
                    .map(Contrat::getLot)
                    .filter(lot -> lot != null && !lot.trim().isEmpty())
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());
            
            System.out.printf("  Contrats actifs: %d%n", prestataireContrats.size());
            System.out.printf("  Lots associés: %s%n", prestataireLots);
            
            List<Item> matchingItems = allItems.stream()
                    .filter(item -> item.getLot() != null && !item.getLot().trim().isEmpty())
                    .filter(item -> {
                        String itemLot = item.getLot().trim().toLowerCase();
                        return prestataireLots.stream().anyMatch(prestataireLot -> {
                            // Correspondance exacte ou sans préfixe
                            return itemLot.equals(prestataireLot) ||
                                   itemLot.replaceAll("(?i)^lot\\s*", "").equals(prestataireLot.replaceAll("(?i)^lot\\s*", ""));
                        });
                    })
                    .collect(Collectors.toList());
            
            System.out.printf("  Items correspondants: %d%n", matchingItems.size());
            matchingItems.forEach(item -> {
                System.out.printf("    - %s (Lot: %s)%n", item.getNomItem(), item.getLot());
            });
            
            if (matchingItems.isEmpty()) {
                System.out.println("    Aucun item correspondant trouvé");
            }
        }
        
        System.out.println("\n=== Fin de l'analyse ===");
    }
}

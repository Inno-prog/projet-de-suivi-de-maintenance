import com.dgsi.maintenance.config.StructureRegionFix;
import com.dgsi.maintenance.entity.Lot;
import com.dgsi.maintenance.entity.StructureMefp;
import com.dgsi.maintenance.repository.LotRepository;
import com.dgsi.maintenance.repository.StructureMefpRepository;
import com.dgsi.maintenance.service.ReferenceDataService;
import com.dgsi.maintenance.service.StructureMefpService;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;
import java.util.Optional;

@Configuration
@ComponentScan(basePackages = "com.dgsi.maintenance")
@EnableJpaRepositories(basePackages = "com.dgsi.maintenance.repository")
@EnableTransactionManagement
public class TestLot7Structures {

    public static void main(String[] args) {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TestLot7Structures.class)) {

            LotRepository lotRepository = context.getBean(LotRepository.class);
            StructureMefpRepository structureMefpRepository = context.getBean(StructureMefpRepository.class);
            StructureMefpService structureMefpService = context.getBean(StructureMefpService.class);
            ReferenceDataService referenceDataService = context.getBean(ReferenceDataService.class);

            // Check Lot 7 details
            System.out.println("=== Lot 7 Details ===");
            Optional<Lot> lotOpt = lotRepository.findById(7L);
            if (lotOpt.isPresent()) {
                Lot lot7 = lotOpt.get();
                System.out.println("ID: " + lot7.getId());
                System.out.println("Nom: " + lot7.getNomLot());
                System.out.println("Villes: " + lot7.getVilles());
                System.out.println("Regions: " + lot7.getRegions());
            } else {
                System.out.println("Lot 7 not found!");
            }

            // Check all available regions
            System.out.println("\n=== All Regions ===");
            List<String> regions = referenceDataService.getAllRegions();
            regions.forEach(System.out::println);

            // Check villes for Yaadga region
            System.out.println("\n=== Villes in Yaadga Region ===");
            List<String> yaadgaVilles = referenceDataService.getVillesByRegion("Yaadga");
            yaadgaVilles.forEach(System.out::println);

            // Check all structures in database
            System.out.println("\n=== All Structures ===");
            List<StructureMefp> allStructures = structureMefpRepository.findAll();
            System.out.println("Total structures: " + allStructures.size());
            
            System.out.println("\n=== Structures by Region ===");
            for (StructureMefp structure : allStructures) {
                System.out.println("Structure: " + structure.getNom() + 
                        " | Ville: " + structure.getVille() + 
                        " | Region: " + structure.getRegion() + 
                        " | Lot ID: " + structure.getLot().getId());
            }

            // Test getStructuresByRegions method with Lot 7 regions
            System.out.println("\n=== Test getStructuresByRegions for Lot 7 ===");
            if (lotOpt.isPresent()) {
                List<StructureMefp> lot7Structures = structureMefpService.getStructuresByRegions(lotOpt.get().getRegions());
                System.out.println("Structures found for Lot 7 regions: " + lot7Structures.size());
                lot7Structures.forEach(s -> System.out.println("  - " + s.getNom() + " (" + s.getVille() + ", " + s.getRegion() + ")"));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

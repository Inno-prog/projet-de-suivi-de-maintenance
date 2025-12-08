package com.dgsi.maintenance.service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import com.dgsi.maintenance.dto.LotWithContractorDto;
import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.FichePrestationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FichePrestationService {

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private FichePrestationRepository ficheRepository;

    @Autowired
    private FichePrestationPdfService pdfService;

    public List<LotWithContractorDto> getLotsWithContractors(int annee, int trimestre) {
        List<Contrat> contrats = contratRepository.findAll();
        java.util.Map<String, LotWithContractorDto> lotMap = new java.util.HashMap<>();

        for (Contrat contrat : contrats) {
            if (contrat.getLot() != null && !contrat.getLot().trim().isEmpty()) {
                LotWithContractorDto dto = lotMap.computeIfAbsent(contrat.getLot(), k -> new LotWithContractorDto(k));
                if (contrat.getVille() != null) dto.addVille(contrat.getVille());
                if (contrat.getIdContrat() != null) dto.addContractId(contrat.getIdContrat());
            }
        }

        return lotMap.values().stream()
            .sorted(Comparator.comparing(LotWithContractorDto::getLot))
            .collect(Collectors.toList());
    }

    public List<FichePrestation> getFichesForLotAndQuarter(String lot, int annee, int trimestre) {
        // This would need to be implemented based on your business logic
        // For now, return empty list - you'll need to implement the actual logic
        return ficheRepository.findAll().stream()
            .filter(fiche -> {
                // Add your filtering logic here based on lot, year, and quarter
                // This is a placeholder implementation
                return true;
            })
            .sorted(Comparator.comparing(FichePrestation::getDateRealisation).reversed()
                .thenComparing(FichePrestation::getIdPrestation))
            .collect(Collectors.toList());
    }

    public byte[] generateGlobalFiche(String lot, int annee, int trimestre) throws Exception {
        List<FichePrestation> fiches = getFichesForLotAndQuarter(lot, annee, trimestre);

        if (fiches.isEmpty()) {
            throw new RuntimeException("Aucune fiche trouvée pour ce lot et trimestre");
        }

        // Utiliser le service PDF pour générer un rapport global
        return pdfService.generateGlobalServiceSheetPdf(lot, annee, trimestre, fiches);
    }
}

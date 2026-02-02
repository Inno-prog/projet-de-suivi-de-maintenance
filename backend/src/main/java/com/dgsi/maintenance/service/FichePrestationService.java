package com.dgsi.maintenance.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.dgsi.maintenance.dto.LotWithContractorDto;
import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.FichePrestation;
import com.dgsi.maintenance.entity.StatutContrat;
import com.dgsi.maintenance.entity.StatutFiche;
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

    @Autowired
    private com.dgsi.maintenance.repository.PrestationRepository prestationRepository;

    /**
     * Calcule le prochain numéro de fiche disponible pour un trimestre et lot spécifique.
     * Le format est T{trimestre}-L{lot}-{index} où index est un nombre à 2 chiffres.
     * 
     * @param trimestre Le trimestre (1-4)
     * @param lot Le numéro de lot (1-...)
     * @return Le prochain numéro de fiche formaté
     */
    public String getNextAvailableNumero(int trimestre, int lot) {
        // Générer le préfixe pour le trimestre et lot
        String prefix = String.format("T%d-L%d-", trimestre, lot);
        
        // Compter le nombre de fiches existantes pour ce préfixe
        long count = ficheRepository.countFichesByPrefix(prefix);
        
        // Calculer le prochain index (en commençant à 1)
        int nextIndex = (int) count + 1;
        
        // Formater avec 2 chiffres (01, 02, ..., 10, etc.)
        return String.format("%s%02d", prefix, nextIndex);
    }
    
    /**
     * Extrait le numéro de lot à partir d'un nom de lot normalisé ou brut.
     * @param rawLotName Nom de lot tel que "Lot 1", "LOT01", "lot 2 (test)"
     * @return Numéro de lot sous forme d'entier
     */
    public int extractLotNumber(String rawLotName) {
        if (rawLotName == null) {
            return 1;
        }
        
        // Supprimer les caractères non numériques sauf les chiffres
        String normalized = rawLotName.replaceAll("[^0-9]", "");
        if (normalized.isEmpty()) {
            return 1;
        }
        
        try {
            return Integer.parseInt(normalized);
        } catch (NumberFormatException e) {
            return 1;
        }
    }

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
        List<FichePrestation> allFiches = ficheRepository.findAll();
        List<FichePrestation> filteredFiches = new ArrayList<>();

        // Normalize lot for comparison
        String normalizedLot = lot.replaceAll("[()]", " ").trim().replaceAll("\\s+", " ").toLowerCase();

        // Map to store lots for each prestataire
        java.util.Map<String, String> prestataireToLotMap = new java.util.HashMap<>();
        List<Contrat> allContrats = contratRepository.findAll();
        for (Contrat contrat : allContrats) {
            if (contrat.getLot() != null && !contrat.getLot().trim().isEmpty() && 
                contrat.getStatut() == StatutContrat.ACTIF) {
                if (contrat.getNomPrestataire() != null) {
                    prestataireToLotMap.put(contrat.getNomPrestataire(), contrat.getLot());
                }
            }
        }

        for (FichePrestation fiche : allFiches) {
            // Only include VALIDE fiches
            if (fiche.getStatut() != StatutFiche.VALIDE) {
                continue;
            }

            boolean matchesLot = false;

            // Strategy 1: If fiche has linked prestataire with contract
            if (fiche.getPrestataire() != null) {
                List<Contrat> contrats = contratRepository.findByPrestataireId(fiche.getPrestataire().getId());
                for (Contrat contrat : contrats) {
                    if (contrat.getLot() != null && contrat.getStatut() == StatutContrat.ACTIF) {
                        String normalizedContratLot = contrat.getLot().replaceAll("[()]", " ").trim().replaceAll("\\s+", " ").toLowerCase().replaceAll("lot\\s*", "");
                        String normalizedSearchLot = normalizedLot.replaceAll("lot\\s*", "");
                        if (normalizedContratLot.equals(normalizedSearchLot) || 
                            normalizedContratLot.contains(normalizedSearchLot) || 
                            normalizedSearchLot.contains(normalizedContratLot)) {
                            matchesLot = true;
                            break;
                        }
                    }
                }
            }

            // Strategy 2: Fallback - use prestataire to lot mapping
            if (!matchesLot && fiche.getNomPrestataire() != null) {
                String prestLot = prestataireToLotMap.get(fiche.getNomPrestataire());
                if (prestLot != null) {
                    String normalizedPrestLot = prestLot.replaceAll("[()]", " ").trim().replaceAll("\\s+", " ").toLowerCase().replaceAll("lot\\s*", "");
                    String normalizedSearchLot = normalizedLot.replaceAll("lot\\s*", "");
                    if (normalizedPrestLot.equals(normalizedSearchLot) || 
                        normalizedPrestLot.contains(normalizedSearchLot) || 
                        normalizedSearchLot.contains(normalizedPrestLot)) {
                        matchesLot = true;
                    }
                }
            }

            // Strategy 3: Check trimestre and year
            if (matchesLot) {
                boolean matchesQuarter = true;
                boolean matchesYear = true;
                
                if (fiche.getIdPrestation() != null && fiche.getIdPrestation().matches("\\d+")) {
                    try {
                        Long prestationId = Long.parseLong(fiche.getIdPrestation());
                        Optional<com.dgsi.maintenance.entity.Prestation> prestationOpt = prestationRepository.findById(prestationId);
                        if (prestationOpt.isPresent()) {
                            com.dgsi.maintenance.entity.Prestation prestation = prestationOpt.get();
                            
                            // Check trimestre
                            if (prestation.getTrimestre() != null) {
                                int prestationTrimestre = 0;
                                switch (prestation.getTrimestre()) {
                                    case "T1": prestationTrimestre = 1; break;
                                    case "T2": prestationTrimestre = 2; break;
                                    case "T3": prestationTrimestre = 3; break;
                                    case "T4": prestationTrimestre = 4; break;
                                }
                                matchesQuarter = prestationTrimestre == trimestre;
                            }
                            
                            // Check year
                            if (prestation.getDateHeureDebut() != null) {
                                matchesYear = prestation.getDateHeureDebut().getYear() == annee;
                            } else if (prestation.getDateHeureFin() != null) {
                                matchesYear = prestation.getDateHeureFin().getYear() == annee;
                            } else {
                                // Fallback to fiche creation date if prestation dates are null
                                if (fiche.getDateRealisation() != null) {
                                    matchesYear = fiche.getDateRealisation().getYear() == annee;
                                }
                            }
                        }
                    } catch (Exception e) {
                        // Skip if we can't parse the prestation id or get the date
                        continue;
                    }
                } else {
                    // Si pas d'idPrestation numérique, vérifier via la date de réalisation de la fiche
                    if (fiche.getDateRealisation() != null) {
                        matchesYear = fiche.getDateRealisation().getYear() == annee;
                    }
                }
                
                if (!matchesQuarter || !matchesYear) {
                    continue;
                }
            }

            if (matchesLot) {
                filteredFiches.add(fiche);
            }
        }

        return filteredFiches.stream()
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

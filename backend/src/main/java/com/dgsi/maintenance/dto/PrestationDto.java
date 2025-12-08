package com.dgsi.maintenance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrestationDto {
    private Long id;
    private String nomPrestataire;
    private String nomPrestation;
    private BigDecimal montantIntervention;
    private BigDecimal montantPrest;
    private String trimestre;
    private LocalDateTime dateHeureDebut;
    private LocalDateTime dateHeureFin;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statutIntervention;
    private String statutValidation;
    private String nomStructure;
    private String contactStructure;
    private String nomCi;
    private String prenomCi;
    private String contactCi;
    private String fonctionCi;
    private String description;
    private List<String> itemsNames; // Noms des items utilisés
}
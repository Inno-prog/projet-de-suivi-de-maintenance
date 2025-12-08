package com.dgsi.maintenance.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rapports_suivi")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RapportSuivi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ordre_commande_id")
    private Long ordreCommandeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordre_commande_id", insertable = false, updatable = false)
    private OrdreCommande ordreCommande;

    @Column(name = "date_rapport", nullable = false)
    private LocalDate dateRapport;

    @Column(name = "trimestre", nullable = false)
    private String trimestre;

    @Column(name = "prestataire", nullable = false)
    private String prestataire;

    @Column(name = "prestations_realisees", nullable = false)
    private Integer prestationsRealisees = 0;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    // Étape 2: Observations sur les prestations réalisées
    @Column(name = "observations_prestations", columnDefinition = "TEXT")
    private String observationsPrestations;

    // Étape 3: Observations sur les ordres de commande
    @Column(name = "observations_ordres", columnDefinition = "TEXT")
    private String observationsOrdres;

    // Étape 4: Observations sur les contrats
    @Column(name = "observations_contrats", columnDefinition = "TEXT")
    private String observationsContrats;

    // Étape 5: Observations sur les items/équipements
    @Column(name = "observations_items", columnDefinition = "TEXT")
    private String observationsItems;

    // Étape 6: Observations sur les structures
    @Column(name = "observations_structures", columnDefinition = "TEXT")
    private String observationsStructures;

    // Observations générales et recommandations
    @Column(name = "observations_generales", columnDefinition = "TEXT")
    private String observationsGenerales;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutRapport statut = StatutRapport.EN_ATTENTE;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}

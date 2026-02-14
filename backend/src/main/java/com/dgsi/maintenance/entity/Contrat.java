package com.dgsi.maintenance.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "contrats")
@JsonIgnoreProperties({"ordresCommande", "prestataire", "hibernateLazyInitializer", "handler"})
public class Contrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_contrat", unique = true)
    private String idContrat;

    @NotNull
    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @NotNull
    @Column(name = "date_fin")
    private LocalDate dateFin;

    @NotBlank
    @Column(name = "nom_prestataire")
    private String nomPrestataire;

    @NotNull
    @Column(name = "montant")
    private Double montant;

    @Column(name = "montant_restant")
    private Double montantRestant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lot_id")
    @JsonIgnore
    private Lot lot;

    @Column(name = "ville")
    private String ville;

    @Column(name = "lot_name")
    private String lotName;

    @Column(name = "type_contrat")
    private String typeContrat;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutContrat statut = StatutContrat.ACTIF;

    @Column(name = "fichier_contrat", length = 500)
    private String fichierContrat;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prestataire_id")
    private Prestataire prestataire;

    @OneToMany(mappedBy = "contrat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrdreCommande> ordresCommande = new ArrayList<>();

    // Constructors
    public Contrat() {}

    public Contrat(String idContrat, LocalDate dateDebut, LocalDate dateFin, String nomPrestataire,
                   Double montant, Lot lot, String ville) {
        this.idContrat = idContrat;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.nomPrestataire = nomPrestataire;
        this.montant = montant;
        this.montantRestant = montant;
        this.lot = lot;
        this.ville = ville;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdContrat() {
        return idContrat;
    }

    public void setIdContrat(String idContrat) {
        this.idContrat = idContrat;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    } 

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public String getNomPrestataire() {
        return nomPrestataire;
    }

    public void setNomPrestataire(String nomPrestataire) {
        this.nomPrestataire = nomPrestataire;
    }

    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
        // Initialize montantRestant if not yet defined
        if (this.montantRestant == null) {
            this.montantRestant = montant;
        }
    }

    public Double getMontantRestant() {
        return montantRestant;
    }

    public void setMontantRestant(Double montantRestant) {
        this.montantRestant = montantRestant;
    }

    @JsonProperty("lot")
    public String getLot() {
        return lotName;
    }

    public void setLot(String lotName) {
        this.lotName = lotName;
    }

    @JsonIgnore
    public Lot getLotEntity() {
        return lot;
    }

    public void setLotEntity(Lot lot) {
        this.lot = lot;
        this.lotName = lot != null ? lot.getNomLot() : null;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getTypeContrat() {
        return typeContrat;
    }

    public void setTypeContrat(String typeContrat) {
        this.typeContrat = typeContrat;
    }

    public StatutContrat getStatut() {
        return statut;
    }

    public void setStatut(StatutContrat statut) {
        this.statut = statut;
    }

    public String getFichierContrat() {
        return fichierContrat;
    }

    public void setFichierContrat(String fichierContrat) {
        this.fichierContrat = fichierContrat;
    }

    public Prestataire getPrestataire() {
        return prestataire;
    }

    public void setPrestataire(Prestataire prestataire) {
        this.prestataire = prestataire;
    }

    public List<OrdreCommande> getOrdresCommande() {
        return ordresCommande;
    }

    public void setOrdresCommande(List<OrdreCommande> ordresCommande) {
        this.ordresCommande = ordresCommande;
    }

    @JsonIgnore
    public List<Item> getItems() {
        if (ordresCommande == null) {
            return new ArrayList<>();
        }
        return ordresCommande.stream()
            .filter(oc -> oc.getItems() != null)
            .flatMap(oc -> oc.getItems().stream())
            .distinct()
            .collect(java.util.stream.Collectors.toList());
    }

    public void setItems(java.util.Set<Item> items) {
        // Direct item association with contracts has been removed
        // Items are now associated via OrdreCommande entities
        // This method is kept for backward compatibility but does nothing
    }
}

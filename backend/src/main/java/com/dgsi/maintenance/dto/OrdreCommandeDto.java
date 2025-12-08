package com.dgsi.maintenance.dto;

import java.time.LocalDateTime;

public class OrdreCommandeDto {
    private Long id;
    private String numero; // numéro de la prestation
    private String prestations; // noms des items de la prestation
    private Integer quantite; // quantité (0 pour items non utilisés)
    private String nomItem;
    private String prestataireItem;
    private Integer trimestre;
    private Integer annee;
    private Double montant;
    private LocalDateTime dateCreation;

    // Constructors
    public OrdreCommandeDto() {}

    public OrdreCommandeDto(Long id, String numero, String prestations, Integer quantite,
                           String nomItem, String prestataireItem, Integer trimestre,
                           Integer annee, Double montant, LocalDateTime dateCreation) {
        this.id = id;
        this.numero = numero;
        this.prestations = prestations;
        this.quantite = quantite;
        this.nomItem = nomItem;
        this.prestataireItem = prestataireItem;
        this.trimestre = trimestre;
        this.annee = annee;
        this.montant = montant;
        this.dateCreation = dateCreation;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getPrestations() {
        return prestations;
    }

    public void setPrestations(String prestations) {
        this.prestations = prestations;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public String getNomItem() {
        return nomItem;
    }

    public void setNomItem(String nomItem) {
        this.nomItem = nomItem;
    }

    public String getPrestataireItem() {
        return prestataireItem;
    }

    public void setPrestataireItem(String prestataireItem) {
        this.prestataireItem = prestataireItem;
    }

    public Integer getTrimestre() {
        return trimestre;
    }

    public void setTrimestre(Integer trimestre) {
        this.trimestre = trimestre;
    }

    public Integer getAnnee() {
        return annee;
    }

    public void setAnnee(Integer annee) {
        this.annee = annee;
    }

    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}

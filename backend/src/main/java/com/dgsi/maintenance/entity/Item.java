package com.dgsi.maintenance.entity;

import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_item", unique = true)
    private Integer idItem;

    @NotBlank
    @Column(name = "nom_item")
    private String nomItem;

    @Column(name = "description", length = 1000)
    private String description;

    @NotNull
    @Column(name = "prix")
    private Float prix;


    @Column(name = "quantite_min_trimestre")
    private Integer quantiteMinTrimestre;

    @NotNull
    @Column(name = "quantite_max_trimestre")
    private Integer quantiteMaxTrimestre;

    @Column(name = "quantite_utilisee")
    private Integer quantiteUtilisee;

    @Column(name = "quantite_utilisee_trimestre")
    private Integer quantiteUtiliseeTrimestre = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordre_commande_id")
    private OrdreCommande ordreCommande;

    @JsonBackReference
    @ManyToMany(mappedBy = "itemsUtilises", fetch = FetchType.LAZY)
    private Set<Prestation> prestations = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "item_equipement",
        joinColumns = @JoinColumn(name = "item_id"),
        inverseJoinColumns = @JoinColumn(name = "equipement_id")
    )
    private Set<Equipement> equipements = new HashSet<>();

    private String lot;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getIdItem() { return idItem; }
    public void setIdItem(Integer idItem) { this.idItem = idItem; }

    public String getNomItem() { return nomItem; }
    public void setNomItem(String nomItem) { this.nomItem = nomItem; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Float getPrix() { return prix; }
    public void setPrix(Float prix) { this.prix = prix; }


    public Integer getQuantiteMinTrimestre() { return quantiteMinTrimestre; }
    public void setQuantiteMinTrimestre(Integer quantiteMinTrimestre) { this.quantiteMinTrimestre = quantiteMinTrimestre; }

    public Integer getQuantiteMaxTrimestre() { return quantiteMaxTrimestre; }
    public void setQuantiteMaxTrimestre(Integer quantiteMaxTrimestre) { this.quantiteMaxTrimestre = quantiteMaxTrimestre; }

    public Integer getQuantiteUtilisee() { return quantiteUtilisee; }
    public void setQuantiteUtilisee(Integer quantiteUtilisee) { this.quantiteUtilisee = quantiteUtilisee; }

    public OrdreCommande getOrdreCommande() { return ordreCommande; }
    public void setOrdreCommande(OrdreCommande ordreCommande) { this.ordreCommande = ordreCommande; }

    public Set<Prestation> getPrestations() { return prestations; }
    public void setPrestations(Set<Prestation> prestations) { this.prestations = prestations; }

    public Set<Equipement> getEquipements() { return equipements; }
    public void setEquipements(Set<Equipement> equipements) { this.equipements = equipements; }

    public String getLot() { return lot; }
    public void setLot(String lot) { this.lot = lot; }

    public Integer getQuantiteUtiliseeTrimestre() { return quantiteUtiliseeTrimestre; }
    public void setQuantiteUtiliseeTrimestre(Integer quantiteUtiliseeTrimestre) { this.quantiteUtiliseeTrimestre = quantiteUtiliseeTrimestre; }
}

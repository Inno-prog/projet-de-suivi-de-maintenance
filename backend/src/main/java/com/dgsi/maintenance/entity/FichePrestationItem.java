package com.dgsi.maintenance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "fiche_prestation_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FichePrestationItem {
    @EmbeddedId
    private FichePrestationItemId id;

    @ManyToOne
    @MapsId("fichePrestationId")
    @JoinColumn(name = "fiche_prestation_id")
    private FichePrestation fichePrestation;

    @ManyToOne
    @MapsId("itemId")
    @JoinColumn(name = "item_id")
    private Item item;

    @Column(name = "quantite_utilisee")
    private Integer quantiteUtilisee = 1; // Default to 1 if not specified
}
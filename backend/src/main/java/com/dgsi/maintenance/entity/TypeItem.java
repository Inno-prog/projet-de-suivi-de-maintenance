package com.dgsi.maintenance.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "type_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TypeItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numero;

    @Column(nullable = false, length = 1000)
    private String prestation;

    @Column(name = "min_articles", nullable = false)
    private Integer minItems;

    @Column(name = "max_articles", nullable = false)
    private Integer maxItems;

    @Column(name = "prix_unitaire", nullable = false)
    private Integer prixUnitaire;

    @Column(nullable = false)
    private String lot;

    @Column(name = "oc1_quantity")
    private Integer oc1Quantity = 0;
}
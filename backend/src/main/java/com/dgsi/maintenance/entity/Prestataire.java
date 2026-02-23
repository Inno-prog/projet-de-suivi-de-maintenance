package com.dgsi.maintenance.entity;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "prestataires")
@DiscriminatorValue("PRESTATAIRE")
@PrimaryKeyJoinColumn(name = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Prestataire extends User {

    @Column(name = "qualification")
    private String qualification;

    @Column(name = "structure")
    private String structure;

    @Column(name = "direction")
    private String direction;

    // Restore JPA relationship to Contrat so that when a Prestataire entity is fetched from the
    // database we can navigate to its contracts (read-only navigation using Contrat.prestataire).
    // The Contrat entity keeps the prestataireId String column; the relationship is backed by the
    // same column but managed as read-only on the Contrat side (insertable=false, updatable=false).
    @OneToMany(mappedBy = "prestataire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Contrat> contrats = new ArrayList<>();

    @OneToMany(mappedBy = "prestataire", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FichePrestation> fichesPrestation = new HashSet<>();

    public Prestataire() {
        super.setRole("PRESTATAIRE");
    }

    // Getters and Setters
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getStructure() { return structure; }
    public void setStructure(String structure) { this.structure = structure; }

    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }

    public List<Contrat> getContrats() { return contrats; }
    public void setContrats(List<Contrat> contrats) { this.contrats = contrats; }

    public Set<FichePrestation> getFichesPrestation() { return fichesPrestation; }
    public void setFichesPrestation(Set<FichePrestation> fichesPrestation) { this.fichesPrestation = fichesPrestation; }
}
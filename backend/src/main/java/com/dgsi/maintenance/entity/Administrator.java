package com.dgsi.maintenance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "administrators")
@DiscriminatorValue("ADMINISTRATEUR")
@PrimaryKeyJoinColumn(name = "id")
public class Administrator extends User {
    
    @Column(name = "poste")
    private String poste;

    public Administrator() {
        super.setRole("ADMINISTRATEUR");
    }

    public String getPoste() { return poste; }
    public void setPoste(String poste) { this.poste = poste; }
}
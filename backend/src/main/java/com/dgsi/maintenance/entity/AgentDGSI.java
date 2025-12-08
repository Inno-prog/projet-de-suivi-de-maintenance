package com.dgsi.maintenance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "agents_dgsi")
@DiscriminatorValue("AGENT_DGSI")
@PrimaryKeyJoinColumn(name = "id")
public class AgentDGSI extends User {

    @Column(name = "structure")
    private String structure;

    public AgentDGSI() {
        super.setRole("AGENT_DGSI");
    }

    public String getStructure() { return structure; }
    public void setStructure(String structure) { this.structure = structure; }
}
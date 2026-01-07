package com.dgsi.maintenance.dto;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LotWithContractorDto {
    private String lot;
    private List<String> villes;
    private List<String> contractIds;
    private int fichesCount;

    public LotWithContractorDto() {
        this.villes = new ArrayList<>();
        this.contractIds = new ArrayList<>();
        this.fichesCount = 0;
    }

    public LotWithContractorDto(String lot) {
        this.lot = lot;
        this.villes = new ArrayList<>();
        this.contractIds = new ArrayList<>();
        this.fichesCount = 0;
    }

    public String getLot() {
        return lot;
    }

    public void setLot(String lot) {
        this.lot = lot;
    }

    /**
     * Retourne la représentation affichée du lot, p.ex. "lot3 (ville1, ville2)"
     * Cette méthode est sérialisée sous la propriété JSON 'lot'.
     */
    @JsonProperty("lot")
    public String getLotDisplay() {
        if (this.lot == null) return null;
        if (this.villes == null || this.villes.isEmpty()) return this.lot;
        return this.lot + " (" + String.join(", ", this.villes) + ")";
    }

    // Keep raw lot name accessible internally but ignore in JSON serialization
    @JsonIgnore
    public String getLotRaw() {
        return this.lot;
    }

    public List<String> getVilles() {
        return villes;
    }

    public void setVilles(List<String> villes) {
        this.villes = villes;
    }

    public void addVille(String ville) {
        if (!this.villes.contains(ville)) {
            this.villes.add(ville);
        }
    }

    public List<String> getContractIds() {
        return contractIds;
    }

    public void setContractIds(List<String> contractIds) {
        this.contractIds = contractIds;
    }

    public void addContractId(String contractId) {
        if (!this.contractIds.contains(contractId)) {
            this.contractIds.add(contractId);
        }
    }

    public int getFichesCount() {
        return fichesCount;
    }

    public void setFichesCount(int fichesCount) {
        this.fichesCount = fichesCount;
    }
}

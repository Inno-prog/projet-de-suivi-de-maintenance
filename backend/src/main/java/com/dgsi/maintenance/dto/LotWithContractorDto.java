package com.dgsi.maintenance.dto;

import java.util.ArrayList;
import java.util.List;

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

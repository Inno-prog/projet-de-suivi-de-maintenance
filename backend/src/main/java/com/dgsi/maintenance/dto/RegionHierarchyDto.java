package com.dgsi.maintenance.dto;

import java.util.List;

/**
 * DTO for hierarchical structure of MEFP organizations
 * Format: MEF -> Region -> Ville -> Structures
 */
public class RegionHierarchyDto {
    private String nom;
    private List<VilleHierarchyDto> villes;

    public RegionHierarchyDto() {}

    public RegionHierarchyDto(String nom, List<VilleHierarchyDto> villes) {
        this.nom = nom;
        this.villes = villes;
    }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public List<VilleHierarchyDto> getVilles() { return villes; }
    public void setVilles(List<VilleHierarchyDto> villes) { this.villes = villes; }

    /**
     * DTO for ville level in hierarchy
     */
    public static class VilleHierarchyDto {
        private String nom;
        private List<StructureInfoDto> structures;

        public VilleHierarchyDto() {}

        public VilleHierarchyDto(String nom, List<StructureInfoDto> structures) {
            this.nom = nom;
            this.structures = structures;
        }

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }

        public List<StructureInfoDto> getStructures() { return structures; }
        public void setStructures(List<StructureInfoDto> structures) { this.structures = structures; }
    }

    /**
     * DTO for structure information
     */
    public static class StructureInfoDto {
        private String id;
        private String nom;
        private String categorie;
        private String contact;
        private String email;
        private String adresseStructure;
        private String description;

        public StructureInfoDto() {}

        public StructureInfoDto(String id, String nom, String categorie, String contact, 
                               String email, String adresseStructure, String description) {
            this.id = id;
            this.nom = nom;
            this.categorie = categorie;
            this.contact = contact;
            this.email = email;
            this.adresseStructure = adresseStructure;
            this.description = description;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }

        public String getCategorie() { return categorie; }
        public void setCategorie(String categorie) { this.categorie = categorie; }

        public String getContact() { return contact; }
        public void setContact(String contact) { this.contact = contact; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getAdresseStructure() { return adresseStructure; }
        public void setAdresseStructure(String adresseStructure) { this.adresseStructure = adresseStructure; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}


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
         private String contact1;
         private String contact2;
         private String contact3;
         private String email;
         private String adresseStructure;
         private String description;

         public StructureInfoDto() {}

         public StructureInfoDto(String id, String nom, String categorie, String contact1, 
                                String contact2, String contact3, String email, 
                                String adresseStructure, String description) {
             this.id = id;
             this.nom = nom;
             this.categorie = categorie;
             this.contact1 = contact1;
             this.contact2 = contact2;
             this.contact3 = contact3;
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

         public String getContact1() { return contact1; }
         public void setContact1(String contact1) { this.contact1 = contact1; }

         public String getContact2() { return contact2; }
         public void setContact2(String contact2) { this.contact2 = contact2; }

         public String getContact3() { return contact3; }
         public void setContact3(String contact3) { this.contact3 = contact3; }

         public String getEmail() { return email; }
         public void setEmail(String email) { this.email = email; }

         public String getAdresseStructure() { return adresseStructure; }
         public void setAdresseStructure(String adresseStructure) { this.adresseStructure = adresseStructure; }

         public String getDescription() { return description; }
         public void setDescription(String description) { this.description = description; }
     }
}


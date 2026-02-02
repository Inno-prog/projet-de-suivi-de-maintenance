package com.dgsi.maintenance.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "structures_mefp")
public class StructureMefp {
    @Id
    private String id;

    @NotBlank
    @Size(max = 100)
    private String nom;

    @Size(max = 100)
    private String contact1;
    
    @Size(max = 100)
    private String contact2;
    
    @Size(max = 100)
    private String contact3;

    @Size(max = 100)
    private String email;

    @Size(max = 100)
    private String ville;

    @Size(max = 100)
    private String region;

    @Size(max = 200)
    @Column(name = "adresse_structure")
    private String adresseStructure;

    @Size(max = 500)
    private String description;

    @NotBlank
    @Size(max = 100)
    @Column(name = "CATEGORIE")
    private String categorie;

    @ManyToOne
    @JoinColumn(name = "lot_id")
    private Lot lot;

    // Correspondant Informatique (CI) fields
    @Size(max = 100)
    @Column(name = "nom_ci")
    private String nomCI;

    @Size(max = 100)
    @Column(name = "prenom_ci")
    private String prenomCI;

    @Size(max = 100)
    @Column(name = "contact_ci")
    private String contactCI;

    @Size(max = 100)
    @Column(name = "fonction_ci")
    private String fonctionCI;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            id = java.util.UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getContact1() { return contact1; }
    public void setContact1(String contact1) { this.contact1 = contact1; }

    // Convenience method for getting the primary contact
    public String getContact() { return contact1; }
    public void setContact(String contact) { this.contact1 = contact; }
    
    public String getContact2() { return contact2; }
    public void setContact2(String contact2) { this.contact2 = contact2; }
    
    public String getContact3() { return contact3; }
    public void setContact3(String contact3) { this.contact3 = contact3; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public Lot getLot() { return lot; }
    public void setLot(Lot lot) { this.lot = lot; }

    public String getAdresseStructure() { return adresseStructure; }
    public void setAdresseStructure(String adresseStructure) { this.adresseStructure = adresseStructure; }

    public String getNomCI() { return nomCI; }
    public void setNomCI(String nomCI) { this.nomCI = nomCI; }

    public String getPrenomCI() { return prenomCI; }
    public void setPrenomCI(String prenomCI) { this.prenomCI = prenomCI; }

    public String getContactCI() { return contactCI; }
    public void setContactCI(String contactCI) { this.contactCI = contactCI; }

    public String getFonctionCI() { return fonctionCI; }
    public void setFonctionCI(String fonctionCI) { this.fonctionCI = fonctionCI; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}


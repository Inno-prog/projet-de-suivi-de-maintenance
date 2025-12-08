package com.dgsi.maintenance.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
    private String contact;

    @Size(max = 100)
    private String email;

    @Size(max = 100)
    private String ville;

    @Size(max = 200)
    @Column(name = "adresse_structure")
    private String adresseStructure;

    @Size(max = 500)
    private String description;

    @NotBlank
    @Size(max = 100)
    @Column(name = "CATEGORIE")
    private String categorie;

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

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

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

package com.dgsi.maintenance.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "fiches_prestation")
public class FichePrestation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "id_prestation", unique = true)
    private String idPrestation;

    @NotBlank
    @Column(name = "nom_prestataire")
    private String nomPrestataire;

    @Column(name = "nom_item")
    private String nomItem;

    @Column(name = "nom_structure")
    private String nomStructure;

    @Column(name = "items_couverts", columnDefinition = "TEXT")
    private String itemsCouverts;

    @NotNull
    @Column(name = "date_realisation")
    private LocalDateTime dateRealisation;

    @Enumerated(EnumType.ORDINAL)
    private StatutFiche statut = StatutFiche.EN_ATTENTE;

    @Column(name = "quantite")
    private Integer quantite;

    @Column(name = "prix_unitaire")
    private Double prixUnitaire;

    @Column(name = "montant_total")
    private Double montantTotal;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "fichiers_contrat", columnDefinition = "TEXT")
    private String fichiersContrat;

    @Column(name = "statut_intervention")
    private String statutIntervention;

    @ManyToOne
    @JoinColumn(name = "prestataire_id")
    private Prestataire prestataire;

    @OneToMany(mappedBy = "fichePrestation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<FichePrestationItem> fichePrestationItems = new HashSet<>();

    @Column(name = "numero_fiche")
    private String numeroFiche;

    @PrePersist
    @PreUpdate
    private void ensurePrestataireInfo() {
        // Initialisation des champs de base lors de la création
        if (dateRealisation == null) {
            dateRealisation = LocalDateTime.now();
        }

        // CORRECTION: Ne générer un idPrestation automatique que si aucun n'est défini
        // Cela permet de préserver la liaison avec la prestation si idPrestation est déjà set
        if (idPrestation == null || idPrestation.isEmpty()) {
            idPrestation = "FP-" + System.currentTimeMillis();
            System.out.println("[DEBUG] Generated automatic idPrestation: " + idPrestation);
        } else {
            System.out.println("[DEBUG] Preserving existing idPrestation: " + idPrestation);
        }

        // S'assurer que les informations du prestataire sont correctes
        if (this.prestataire != null) {
            if (this.nomPrestataire == null) {
                this.nomPrestataire = this.prestataire.getNom();
            }
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdPrestation() { return idPrestation; }
    public void setIdPrestation(String idPrestation) { this.idPrestation = idPrestation; }

    public String getNomPrestataire() { return nomPrestataire; }
    public void setNomPrestataire(String nomPrestataire) { this.nomPrestataire = nomPrestataire; }

    public String getNomItem() { return nomItem; }
    public void setNomItem(String nomItem) { this.nomItem = nomItem; }

    public String getNomStructure() { return nomStructure; }
    public void setNomStructure(String nomStructure) { this.nomStructure = nomStructure; }

    public String getItemsCouverts() { return itemsCouverts; }
    public void setItemsCouverts(String itemsCouverts) { this.itemsCouverts = itemsCouverts; }

    public LocalDateTime getDateRealisation() { return dateRealisation; }
    public void setDateRealisation(LocalDateTime dateRealisation) { this.dateRealisation = dateRealisation; }

    public StatutFiche getStatut() { return statut; }
    public void setStatut(StatutFiche statut) { this.statut = statut; }

    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }

    public Double getPrixUnitaire() { return prixUnitaire; }
    public void setPrixUnitaire(Double prixUnitaire) { this.prixUnitaire = prixUnitaire; }

    public Double getMontantTotal() { return montantTotal; }
    public void setMontantTotal(Double montantTotal) { this.montantTotal = montantTotal; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public String getFichiersContrat() { return fichiersContrat; }
    public void setFichiersContrat(String fichiersContrat) { this.fichiersContrat = fichiersContrat; }

    public String getStatutIntervention() { return statutIntervention; }
    public void setStatutIntervention(String statutIntervention) { this.statutIntervention = statutIntervention; }

    public Prestataire getPrestataire() { return prestataire; }
    public void setPrestataire(Prestataire prestataire) { this.prestataire = prestataire; }

    public Set<FichePrestationItem> getFichePrestationItems() { return fichePrestationItems; }
    public void setFichePrestationItems(Set<FichePrestationItem> fichePrestationItems) { this.fichePrestationItems = fichePrestationItems; }

    public String getNumeroFiche() { return numeroFiche; }
    public void setNumeroFiche(String numeroFiche) { this.numeroFiche = numeroFiche; }
}

package com.dgsi.maintenance.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "prestations")
public class Prestation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Prestataire information
    @Column(name = "prestataire_id")
    private String prestataireId;

    @NotBlank
    @Column(name = "nom_prestataire")
    private String nomPrestataire;

    @Column(name = "contact_prestataire")
    private String contactPrestataire;

    @Column(name = "structure_prestataire")
    private String structurePrestataire;

    @NotBlank
    @Column(name = "service_prestataire")
    private String servicePrestataire;

    @NotBlank
    @Column(name = "role_prestataire")
    private String rolePrestataire;

    @NotBlank
    @Column(name = "qualification_prestataire")
    private String qualificationPrestataire;

    // Intervention details
    @Column(name = "montant_intervention", precision = 10, scale = 2)
    private BigDecimal montantIntervention;

    @NotNull
    @Column(name = "date_heure_debut")
    private LocalDateTime dateHeureDebut;

    @NotNull
    @Column(name = "date_heure_fin")
    private LocalDateTime dateHeureFin;


    @NotBlank
    @Column(name = "statut_intervention")
    private String statutIntervention;

    @Column(name = "statut_validation")
    private String statutValidation; // EN_ATTENTE, VALIDE, REJETE

    @Column(name = "deleted", nullable = false)
    private Boolean deleted = false; // Soft delete flag

    // Structure information (recipient of the maintenance service)
    @NotBlank
    @Column(name = "nom_structure")
    private String nomStructure;

    @Column(name = "contact_structure")
    private String contactStructure;

    @Column(name = "adresse_structure")
    private String adresseStructure;

    @Column(name = "fonction_structure")
    private String fonctionStructure;

    // Correspondant Informatique (CI) - IT Contact Person
    @Column(name = "nom_ci")
    private String nomCi;

    @Column(name = "prenom_ci")
    private String prenomCi;

    @Column(name = "contact_ci")
    private String contactCi;

    @Column(name = "fonction_ci")
    private String fonctionCi;


    // Additional fields for PDF generation
    @Column(name = "direction_prestataire")
    private String directionPrestataire;

    @Column(name = "prenom_structure")
    private String prenomStructure;

    @Column(name = "service_structure")
    private String serviceStructure;

    // Legacy fields for backward compatibility (keeping for existing data)
    @Column(name = "nom_prestation")
    private String nomPrestation;

    @Column(name = "montant_prest", precision = 10, scale = 2)
    private BigDecimal montantPrest;



    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "prestation_item",
        joinColumns = @JoinColumn(name = "prestation_id"),
        inverseJoinColumns = @JoinColumn(name = "item_id")
    )
    private Set<Item> itemsUtilises = new HashSet<>();

    @Column(name = "nb_prest_realise")
    private Integer nbPrestRealise;

    @Column(name = "trimestre")
    private String trimestre;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "statut")
    private String statut;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordre_commande_id")
    private OrdreCommande ordreCommande;

    // Constructeurs
    public Prestation() {}

    // Legacy constructor for backward compatibility
    public Prestation(String nomPrestataire, String nomPrestation, BigDecimal montantPrest,
                     Set<Item> itemsUtilises, Integer nbPrestRealise, String trimestre,
                     LocalDate dateDebut, LocalDate dateFin, String statut, String description) {
        this.nomPrestataire = nomPrestataire;
        this.nomPrestation = nomPrestation;
        this.montantPrest = montantPrest;
        this.itemsUtilises = itemsUtilises;
        this.nbPrestRealise = nbPrestRealise;
        this.trimestre = trimestre;
        this.trimestre = trimestre;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.statut = statut;
        this.description = description;
    }

    // New constructor for the enhanced prestation form
    public Prestation(String prestataireId, String nomPrestataire, String contactPrestataire, String structurePrestataire,
                      String servicePrestataire, String rolePrestataire, String qualificationPrestataire,
                      BigDecimal montantIntervention, Set<Item> itemsCouverts,
                      String trimestre, LocalDateTime dateHeureDebut, LocalDateTime dateHeureFin,
                      String statutIntervention) {
        this.prestataireId = prestataireId;
        this.nomPrestataire = nomPrestataire;
        this.contactPrestataire = contactPrestataire;
        this.structurePrestataire = structurePrestataire;
        this.servicePrestataire = servicePrestataire;
        this.rolePrestataire = rolePrestataire;
        this.qualificationPrestataire = qualificationPrestataire;
        this.montantIntervention = montantIntervention;
        this.itemsUtilises = itemsCouverts != null ? itemsCouverts : new HashSet<>();
        this.trimestre = trimestre;
        this.dateHeureDebut = dateHeureDebut;
        this.dateHeureFin = dateHeureFin;
        this.statutIntervention = statutIntervention;
        this.nbPrestRealise = 0;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomPrestataire() { return nomPrestataire; }
    public void setNomPrestataire(String nomPrestataire) { this.nomPrestataire = nomPrestataire; }

    public String getNomPrestation() { return nomPrestation; }
    public void setNomPrestation(String nomPrestation) { this.nomPrestation = nomPrestation; }

    public BigDecimal getMontantPrest() { return montantPrest; }
    public void setMontantPrest(BigDecimal montantPrest) { this.montantPrest = montantPrest; }



    public Set<Item> getItemsUtilises() { return itemsUtilises; }
    public void setItemsUtilises(Set<Item> itemsUtilises) { this.itemsUtilises = itemsUtilises; }

    public Integer getNbPrestRealise() { return nbPrestRealise; }
    public void setNbPrestRealise(Integer nbPrestRealise) { this.nbPrestRealise = nbPrestRealise; }

    public String getTrimestre() { return trimestre; }
    public void setTrimestre(String trimestre) { this.trimestre = trimestre; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public OrdreCommande getOrdreCommande() { return ordreCommande; }
    public void setOrdreCommande(OrdreCommande ordreCommande) { this.ordreCommande = ordreCommande; }

    // New getters and setters for enhanced fields
    public String getPrestataireId() { return prestataireId; }
    public void setPrestataireId(String prestataireId) { this.prestataireId = prestataireId; }

    public String getContactPrestataire() { return contactPrestataire; }
    public void setContactPrestataire(String contactPrestataire) { this.contactPrestataire = contactPrestataire; }

    public String getStructurePrestataire() { return structurePrestataire; }
    public void setStructurePrestataire(String structurePrestataire) { this.structurePrestataire = structurePrestataire; }

    public String getServicePrestataire() { return servicePrestataire; }
    public void setServicePrestataire(String servicePrestataire) { this.servicePrestataire = servicePrestataire; }

    public String getRolePrestataire() { return rolePrestataire; }
    public void setRolePrestataire(String rolePrestataire) { this.rolePrestataire = rolePrestataire; }

    public String getQualificationPrestataire() { return qualificationPrestataire; }
    public void setQualificationPrestataire(String qualificationPrestataire) { this.qualificationPrestataire = qualificationPrestataire; }

    public BigDecimal getMontantIntervention() { return montantIntervention; }
    public void setMontantIntervention(BigDecimal montantIntervention) { this.montantIntervention = montantIntervention; }



    public LocalDateTime getDateHeureDebut() { return dateHeureDebut; }
    public void setDateHeureDebut(LocalDateTime dateHeureDebut) { this.dateHeureDebut = dateHeureDebut; }

    public LocalDateTime getDateHeureFin() { return dateHeureFin; }
    public void setDateHeureFin(LocalDateTime dateHeureFin) { this.dateHeureFin = dateHeureFin; }


    public String getStatutIntervention() { return statutIntervention; }
    public void setStatutIntervention(String statutIntervention) { this.statutIntervention = statutIntervention; }

    public String getNomStructure() { return nomStructure; }
    public void setNomStructure(String nomStructure) { this.nomStructure = nomStructure; }

    public String getContactStructure() { return contactStructure; }
    public void setContactStructure(String contactStructure) { this.contactStructure = contactStructure; }

    public String getAdresseStructure() { return adresseStructure; }
    public void setAdresseStructure(String adresseStructure) { this.adresseStructure = adresseStructure; }

    public String getFonctionStructure() { return fonctionStructure; }
    public void setFonctionStructure(String fonctionStructure) { this.fonctionStructure = fonctionStructure; }

    // CI (Correspondant Informatique) getters and setters
    public String getNomCi() { return nomCi; }
    public void setNomCi(String nomCi) { this.nomCi = nomCi; }

    public String getPrenomCi() { return prenomCi; }
    public void setPrenomCi(String prenomCi) { this.prenomCi = prenomCi; }

    public String getContactCi() { return contactCi; }
    public void setContactCi(String contactCi) { this.contactCi = contactCi; }

    public String getFonctionCi() { return fonctionCi; }
    public void setFonctionCi(String fonctionCi) { this.fonctionCi = fonctionCi; }

    // Getters and setters for additional fields
    public String getDirectionPrestataire() { return directionPrestataire; }
    public void setDirectionPrestataire(String directionPrestataire) { this.directionPrestataire = directionPrestataire; }

    public String getPrenomStructure() { return prenomStructure; }
    public void setPrenomStructure(String prenomStructure) { this.prenomStructure = prenomStructure; }

    public String getServiceStructure() { return serviceStructure; }
    public void setServiceStructure(String serviceStructure) { this.serviceStructure = serviceStructure; }

    public String getStatutValidation() { return statutValidation; }
    public void setStatutValidation(String statutValidation) { this.statutValidation = statutValidation; }

    public Boolean getDeleted() { return deleted; }
    public void setDeleted(Boolean deleted) { this.deleted = deleted; }

    // Helper method to get items names without loading the full collection
    @JsonIgnore
    public String getItemsNames() {
        if (itemsUtilises == null || itemsUtilises.isEmpty()) {
            return "";
        }
        return itemsUtilises.stream()
            .map(Item::getNomItem)
            .reduce((a, b) -> a + ", " + b)
            .orElse("");
    }
}

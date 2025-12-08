package com.dgsi.maintenance.entity;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "ordres_commande")
public class OrdreCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_oc", nullable = false, unique = true)
    private String idOC;

    @Column(name = "numero_oc")
    private String numeroOc;

    @Column(name = "max_prestations")
    private Integer maxPrestations;

    @Column(name = "min_prestations")
    private Integer minPrestations;

    @Column(name = "prix_unit_prest")
    private Double prixUnitPrest;

    @Column(name = "montant_oc")
    private Double montantOC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCommande statut = StatutCommande.EN_ATTENTE;

    @Column(length = 1000)
    private String observations;

    // Relations
    @OneToMany(mappedBy = "ordreCommande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Prestation> prestations;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id", insertable = false, updatable = false)
    private Contrat contrat;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "ordre_commande_items",
        joinColumns = @JoinColumn(name = "ordre_commande_id"),
        inverseJoinColumns = @JoinColumn(name = "item_id")
    )
    private List<Item> items;

    // Optional helpers and legacy fields
    @Column(name = "numero_commande")
    private String numeroCommande;

    @Column(name = "nom_item")
    private String nomItem;

    @Column(name = "min_articles")
    private Integer minArticles;

    @Column(name = "max_articles")
    private Integer maxArticles;

    @Column(name = "nombre_articles_utilise")
    private Integer nombreArticlesUtilise;

    @Column(name = "ecart_articles")
    private Integer ecartArticles;

    @Column(name = "trimestre")
    private Integer trimestre;

    @Column(name = "annee")
    private Integer annee;

    @Column(name = "lot")
    private String lot;

    @Column(name = "prestataire_item")
    private String prestataireItem;

    private Double montant;

    @Column(length = 1000)
    private String description;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "contrat_id")
    private Long contratId;

    private Double penalites;

    // Nouvelles propriétés calculées
    @Column(name = "montant_total_calcule")
    private Double montantTotalCalcule;

    @Column(name = "penalites_calculees")
    private Double penalitesCalculees;

    @Column(name = "prix_unitaires_items_json", length = 2000)
    private String prixUnitairesItemsJson;

    @Column(name = "ecart_calcule")
    private Double ecartCalcule;

    @Column(name = "total_general")
    private Double totalGeneral;

    @Column(name = "total_ecart")
    private Double totalEcart;

    // Constructors
    public OrdreCommande() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdOC() {
        return idOC;
    }

    public void setIdOC(String idOC) {
        this.idOC = idOC;
    }

    public String getNumeroOc() {
        return numeroOc;
    }

    public void setNumeroOc(String numeroOc) {
        this.numeroOc = numeroOc;
    }

    public Integer getMaxPrestations() {
        return maxPrestations;
    }

    public void setMaxPrestations(Integer maxPrestations) {
        this.maxPrestations = maxPrestations;
    }

    public Integer getMinPrestations() {
        return minPrestations;
    }

    public void setMinPrestations(Integer minPrestations) {
        this.minPrestations = minPrestations;
    }

    public Double getPrixUnitPrest() {
        return prixUnitPrest;
    }

    public void setPrixUnitPrest(Double prixUnitPrest) {
        this.prixUnitPrest = prixUnitPrest;
    }

    public Double getMontantOC() {
        return montantOC;
    }

    public void setMontantOC(Double montantOC) {
        this.montantOC = montantOC;
    }

    public StatutCommande getStatut() {
        return statut;
    }

    public void setStatut(StatutCommande statut) {
        this.statut = statut;
    }

    public String getObservations() {
        return observations;
    }

    public void setObservations(String observations) {
        this.observations = observations;
    }

    public List<Prestation> getPrestations() {
        return prestations;
    }

    public void setPrestations(List<Prestation> prestations) {
        this.prestations = prestations;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public String getNumeroCommande() {
        return numeroCommande;
    }

    public void setNumeroCommande(String numeroCommande) {
        this.numeroCommande = numeroCommande;
    }

    public String getNomItem() {
        return nomItem;
    }

    public void setNomItem(String nomItem) {
        this.nomItem = nomItem;
    }

    public Integer getMinArticles() {
        return minArticles;
    }

    public void setMinArticles(Integer minArticles) {
        this.minArticles = minArticles;
    }

    public Integer getMaxArticles() {
        return maxArticles;
    }

    public void setMaxArticles(Integer maxArticles) {
        this.maxArticles = maxArticles;
    }

    public Integer getNombreArticlesUtilise() {
        return nombreArticlesUtilise;
    }

    public void setNombreArticlesUtilise(Integer nombreArticlesUtilise) {
        this.nombreArticlesUtilise = nombreArticlesUtilise;
    }

    public Integer getEcartArticles() {
        return ecartArticles;
    }

    public void setEcartArticles(Integer ecartArticles) {
        this.ecartArticles = ecartArticles;
    }

    public Integer getTrimestre() {
        return trimestre;
    }

    public void setTrimestre(Integer trimestre) {
        this.trimestre = trimestre;
    }

    public Integer getAnnee() {
        return annee;
    }

    public void setAnnee(Integer annee) {
        this.annee = annee;
    }

    public String getLot() {
        return lot;
    }

    public void setLot(String lot) {
        this.lot = lot;
    }

    public String getPrestataireItem() {
        return prestataireItem;
    }

    public void setPrestataireItem(String prestataireItem) {
        this.prestataireItem = prestataireItem;
    }

    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Long getContratId() {
        return contratId;
    }

    public void setContratId(Long contratId) {
        this.contratId = contratId;
    }

    public Double getPenalites() {
        return penalites;
    }

    public void setPenalites(Double penalites) {
        this.penalites = penalites;
    }

    public Double getMontantTotalCalcule() {
        return montantTotalCalcule;
    }

    public void setMontantTotalCalcule(Double montantTotalCalcule) {
        this.montantTotalCalcule = montantTotalCalcule;
    }

    public Double getPenalitesCalculees() {
        return penalitesCalculees;
    }

    public void setPenalitesCalculees(Double penalitesCalculees) {
        this.penalitesCalculees = penalitesCalculees;
    }

    public String getPrixUnitairesItemsJson() {
        return prixUnitairesItemsJson;
    }

    public void setPrixUnitairesItemsJson(String prixUnitairesItemsJson) {
        this.prixUnitairesItemsJson = prixUnitairesItemsJson;
    }

    public Double getEcartCalcule() {
        return ecartCalcule;
    }

    public void setEcartCalcule(Double ecartCalcule) {
        this.ecartCalcule = ecartCalcule;
    }

    public Double getTotalGeneral() {
        return totalGeneral;
    }

    public void setTotalGeneral(Double totalGeneral) {
        this.totalGeneral = totalGeneral;
    }

    public Double getTotalEcart() {
        return totalEcart;
    }

    public void setTotalEcart(Double totalEcart) {
        this.totalEcart = totalEcart;
    }

    public Contrat getContrat() {
        return contrat;
    }

    public void setContrat(Contrat contrat) {
        this.contrat = contrat;
    }

    // Helper methods
    public double calculerEcartItem() {
        if (items == null || items.isEmpty()) {
            return 0.0;
        }

        int totalMax = items.stream()
            .mapToInt(item -> item.getQuantiteMaxTrimestre() != null ? item.getQuantiteMaxTrimestre() : 0)
            .sum();

        int totalUsed = items.stream()
            .mapToInt(item -> item.getQuantiteUtilisee() != null ? item.getQuantiteUtilisee().intValue() : 0)
            .sum();

        return Math.max(0, totalMax - totalUsed);
    }

    public double calculMontantTotal() {
        if (prestations != null && !prestations.isEmpty()) {
            return prestations.stream()
                .mapToDouble(p -> p.getMontantPrest() != null ? p.getMontantPrest().doubleValue() : 0.0)
                .sum();
        }
        return montant != null ? montant : 0.0;
    }

    public double calculPenalite() {
        if (prestations != null && !prestations.isEmpty()) {
            double realizedAmount = prestations.stream()
                .mapToDouble(p -> p.getMontantPrest() != null ? p.getMontantPrest().doubleValue() : 0.0)
                .sum();

            double maxAmount = items != null && !items.isEmpty() ?
                items.stream()
                    .mapToDouble(item ->
                        (item.getQuantiteMaxTrimestre() != null ? item.getQuantiteMaxTrimestre() : 0) *
                        (item.getPrix() != null ? item.getPrix().doubleValue() : 0.0))
                    .sum() : 0.0;

            return Math.max(0, maxAmount - realizedAmount);
        }

        double ecart = calculerEcartItem();
        double prix = prixUnitPrest != null ? prixUnitPrest : (montant != null ? montant : 0.0);

        // Default penalty rule: 10% of unit price per missing prestation
        double penalite = Math.max(0, ecart) * prix * 0.1;
        return Math.round(penalite);
    }

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }
}

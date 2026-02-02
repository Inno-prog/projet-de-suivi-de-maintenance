package com.dgsi.maintenance.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.JsonNode;
import org.hibernate.annotations.Type;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_trimestrielle")
public class EvaluationTrimestrielle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "session_id")
    private Long sessionId;
    
    @Column(name = "trimestre", length = 50)
    private String trimestre;
    
    @Column(name = "lot", length = 50)
    private String lot;
    
    @Column(name = "prestataire_nom", length = 200)
    private String prestataireNom;
    
    @Column(name = "prestataire_email", length = 200)
    private String prestataireEmail;
    
    @Column(name = "date_evaluation")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateEvaluation;
    
    @Column(name = "evaluateur_nom", length = 200)
    private String evaluateurNom;
    
    @Column(name = "correspondant_id")
    private Long correspondantId;
    
    @Column(name = "techniciens_liste", columnDefinition = "TEXT")
    private String techniciensListe;

    @Column(name = "techniciens_certifies")
    private Boolean techniciensCertifies;

    @Column(name = "rapport_intervention_transmis")
    private Boolean rapportInterventionTransmis;
    
    @Column(name = "registre_rempli")
    private Boolean registreRempli;
    
    @Column(name = "horaires_respectes")
    private Boolean horairesRespectes;
    
    @Column(name = "delai_reaction_respecte")
    private Boolean delaiReactionRespecte;
    
    @Column(name = "delai_intervention_respecte")
    private Boolean delaiInterventionRespecte;
    
    @Column(name = "vehicule_disponible")
    private Boolean vehiculeDisponible;
    
    @Column(name = "tenue_disponible")
    private Boolean tenueDisponible;

    @Column(name = "obs_techniciens", length = 500)
    private String obsTechniciens;

    @Column(name = "obs_rapport", length = 500)
    private String obsRapport;

    @Column(name = "obs_registre", length = 500)
    private String obsRegistre;

    @Column(name = "obs_horaires", length = 500)
    private String obsHoraires;

    @Column(name = "obs_delai_reaction", length = 500)
    private String obsDelaiReaction;

    @Column(name = "obs_delai_intervention", length = 500)
    private String obsDelaiIntervention;

    @Column(name = "obs_vehicule", length = 500)
    private String obsVehicule;

    @Column(name = "obs_tenue", length = 500)
    private String obsTenue;

    @Column(name = "exigence1", length = 500)
    private String exigence1;

    @Column(name = "exigence2", length = 500)
    private String exigence2;

    @Column(name = "exigence3", length = 500)
    private String exigence3;

    @Column(name = "exigence4", length = 500)
    private String exigence4;

    @Column(name = "exigence5", length = 500)
    private String exigence5;

    @Column(name = "exigence6", length = 500)
    private String exigence6;

    @Column(name = "exigence7", length = 500)
    private String exigence7;

    @Column(name = "exigence8", length = 500)
    private String exigence8;

    @Column(name = "exigence9", length = 500)
    private String exigence9;

    @Column(name = "obs1", length = 500)
    private String obs1;

    @Column(name = "obs2", length = 500)
    private String obs2;

    @Column(name = "obs3", length = 500)
    private String obs3;

    @Column(name = "obs4", length = 500)
    private String obs4;

    @Column(name = "obs5", length = 500)
    private String obs5;

    @Column(name = "obs6", length = 500)
    private String obs6;

    @Column(name = "obs7", length = 500)
    private String obs7;

    @Column(name = "obs8", length = 500)
    private String obs8;

    @Column(name = "obs9", length = 500)
    private String obs9;

    @Column(name = "instance1", length = 500)
    private String instance1;

    @Column(name = "direction1", length = 500)
    private String direction1;

    @Column(name = "date_debut1")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDebut1;

    @Column(name = "jours_penalite1")
    private Integer joursPenalite1;

    @Column(name = "obs_instance1", length = 500)
    private String obsInstance1;

    @Column(name = "signature_prestataire", length = 200)
    private String signaturePrestataire;

    @Column(name = "signature_direction", length = 200)
    private String signatureDirection;

    @Column(name = "signature_dgsi", length = 200)
    private String signatureDGSI;

    @Column(name = "prestations_verifiees", length = 500)
    private String prestationsVerifiees;
    
    @Column(name = "instances_non_resolues", length = 500)
    private String instancesNonResolues;
    
    @Column(name = "observations_generales", columnDefinition = "TEXT")
    private String observationsGenerales;
    
    @Column(name = "appreciation_representant", columnDefinition = "TEXT")
    private String appreciationRepresentant;
    
    @Column(name = "signature_representant")
    private String signatureRepresentant;
    
    @Column(name = "signature_evaluateur")
    private String signatureEvaluateur;
    
    @Column(name = "preuves", length = 500)
    private String preuves;
    
    @Column(name = "statut", length = 50)
    private String statut;
    
    @Column(name = "penalites_calcul", precision = 10, scale = 2)
    private BigDecimal penalitesCalcul;
    
    @Column(name = "note_finale", precision = 5, scale = 2)
    private BigDecimal noteFinale;
    
    @Column(name = "prestataire_declasse")
    private Boolean prestataireDeclasse;
    
    @Column(name = "score_global")
    private Integer scoreGlobal;
    
    @Column(name = "recommandation", length = 50)
    private String recommandation;
    
    @Column(name = "date_creation")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateCreation;
    
    @Column(name = "date_modification")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateModification;
    
    @Column(name = "utilisateur_creation")
    private Long utilisateurCreation;
    
    @Column(name = "utilisateur_modification")
    private Long utilisateurModification;
    
    @Column(name = "fichier_pdf")
    private String fichierPdf;

    // Constructors
    public EvaluationTrimestrielle() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getTrimestre() { return trimestre; }
    public void setTrimestre(String trimestre) { this.trimestre = trimestre; }

    public String getLot() { return lot; }
    public void setLot(String lot) { this.lot = lot; }

    public String getPrestataireNom() { return prestataireNom; }
    public void setPrestataireNom(String prestataireNom) { this.prestataireNom = prestataireNom; }

    public String getPrestataireEmail() { return prestataireEmail; }
    public void setPrestataireEmail(String prestataireEmail) { this.prestataireEmail = prestataireEmail; }

    public LocalDate getDateEvaluation() { return dateEvaluation; }
    public void setDateEvaluation(LocalDate dateEvaluation) { this.dateEvaluation = dateEvaluation; }

    public String getEvaluateurNom() { return evaluateurNom; }
    public void setEvaluateurNom(String evaluateurNom) { this.evaluateurNom = evaluateurNom; }

    public Long getCorrespondantId() { return correspondantId; }
    public void setCorrespondantId(Long correspondantId) { this.correspondantId = correspondantId; }

    public String getTechniciensListe() { return techniciensListe; }
    public void setTechniciensListe(String techniciensListe) { this.techniciensListe = techniciensListe; }

    public Boolean getRapportInterventionTransmis() { return rapportInterventionTransmis; }
    public void setRapportInterventionTransmis(Boolean rapportInterventionTransmis) { this.rapportInterventionTransmis = rapportInterventionTransmis; }

    public Boolean getRegistreRempli() { return registreRempli; }
    public void setRegistreRempli(Boolean registreRempli) { this.registreRempli = registreRempli; }

    public Boolean getHorairesRespectes() { return horairesRespectes; }
    public void setHorairesRespectes(Boolean horairesRespectes) { this.horairesRespectes = horairesRespectes; }

    public Boolean getDelaiReactionRespecte() { return delaiReactionRespecte; }
    public void setDelaiReactionRespecte(Boolean delaiReactionRespecte) { this.delaiReactionRespecte = delaiReactionRespecte; }

    public Boolean getDelaiInterventionRespecte() { return delaiInterventionRespecte; }
    public void setDelaiInterventionRespecte(Boolean delaiInterventionRespecte) { this.delaiInterventionRespecte = delaiInterventionRespecte; }

    public Boolean getVehiculeDisponible() { return vehiculeDisponible; }
    public void setVehiculeDisponible(Boolean vehiculeDisponible) { this.vehiculeDisponible = vehiculeDisponible; }

    public Boolean getTenueDisponible() { return tenueDisponible; }
    public void setTenueDisponible(Boolean tenueDisponible) { this.tenueDisponible = tenueDisponible; }

    public Boolean getTechniciensCertifies() { return techniciensCertifies; }
    public void setTechniciensCertifies(Boolean techniciensCertifies) { this.techniciensCertifies = techniciensCertifies; }

    public String getObsTechniciens() { return obsTechniciens; }
    public void setObsTechniciens(String obsTechniciens) { this.obsTechniciens = obsTechniciens; }

    public String getObsRapport() { return obsRapport; }
    public void setObsRapport(String obsRapport) { this.obsRapport = obsRapport; }

    public String getObsRegistre() { return obsRegistre; }
    public void setObsRegistre(String obsRegistre) { this.obsRegistre = obsRegistre; }

    public String getObsHoraires() { return obsHoraires; }
    public void setObsHoraires(String obsHoraires) { this.obsHoraires = obsHoraires; }

    public String getObsDelaiReaction() { return obsDelaiReaction; }
    public void setObsDelaiReaction(String obsDelaiReaction) { this.obsDelaiReaction = obsDelaiReaction; }

    public String getObsDelaiIntervention() { return obsDelaiIntervention; }
    public void setObsDelaiIntervention(String obsDelaiIntervention) { this.obsDelaiIntervention = obsDelaiIntervention; }

    public String getObsVehicule() { return obsVehicule; }
    public void setObsVehicule(String obsVehicule) { this.obsVehicule = obsVehicule; }

    public String getObsTenue() { return obsTenue; }
    public void setObsTenue(String obsTenue) { this.obsTenue = obsTenue; }

    public String getPrestationsVerifiees() { return prestationsVerifiees; }
    public void setPrestationsVerifiees(String prestationsVerifiees) { this.prestationsVerifiees = prestationsVerifiees; }

    public String getInstancesNonResolues() { return instancesNonResolues; }
    public void setInstancesNonResolues(String instancesNonResolues) { this.instancesNonResolues = instancesNonResolues; }

    public String getObservationsGenerales() { return observationsGenerales; }
    public void setObservationsGenerales(String observationsGenerales) { this.observationsGenerales = observationsGenerales; }

    public String getAppreciationRepresentant() { return appreciationRepresentant; }
    public void setAppreciationRepresentant(String appreciationRepresentant) { this.appreciationRepresentant = appreciationRepresentant; }

    public String getSignatureRepresentant() { return signatureRepresentant; }
    public void setSignatureRepresentant(String signatureRepresentant) { this.signatureRepresentant = signatureRepresentant; }

    public String getSignatureEvaluateur() { return signatureEvaluateur; }
    public void setSignatureEvaluateur(String signatureEvaluateur) { this.signatureEvaluateur = signatureEvaluateur; }

    public String getPreuves() { return preuves; }
    public void setPreuves(String preuves) { this.preuves = preuves; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public BigDecimal getPenalitesCalcul() { return penalitesCalcul; }
    public void setPenalitesCalcul(BigDecimal penalitesCalcul) { this.penalitesCalcul = penalitesCalcul; }

    public BigDecimal getNoteFinale() { return noteFinale; }
    public void setNoteFinale(BigDecimal noteFinale) { this.noteFinale = noteFinale; }

    public Boolean getPrestataireDeclasse() { return prestataireDeclasse; }
    public void setPrestataireDeclasse(Boolean prestataireDeclasse) { this.prestataireDeclasse = prestataireDeclasse; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }

    public String getExigence1() { return exigence1; }
    public void setExigence1(String exigence1) { this.exigence1 = exigence1; }

    public String getExigence2() { return exigence2; }
    public void setExigence2(String exigence2) { this.exigence2 = exigence2; }

    public String getExigence3() { return exigence3; }
    public void setExigence3(String exigence3) { this.exigence3 = exigence3; }

    public String getExigence4() { return exigence4; }
    public void setExigence4(String exigence4) { this.exigence4 = exigence4; }

    public String getExigence5() { return exigence5; }
    public void setExigence5(String exigence5) { this.exigence5 = exigence5; }

    public String getExigence6() { return exigence6; }
    public void setExigence6(String exigence6) { this.exigence6 = exigence6; }

    public String getExigence7() { return exigence7; }
    public void setExigence7(String exigence7) { this.exigence7 = exigence7; }

    public String getExigence8() { return exigence8; }
    public void setExigence8(String exigence8) { this.exigence8 = exigence8; }

    public String getExigence9() { return exigence9; }
    public void setExigence9(String exigence9) { this.exigence9 = exigence9; }

    public String getObs1() { return obs1; }
    public void setObs1(String obs1) { this.obs1 = obs1; }

    public String getObs2() { return obs2; }
    public void setObs2(String obs2) { this.obs2 = obs2; }

    public String getObs3() { return obs3; }
    public void setObs3(String obs3) { this.obs3 = obs3; }

    public String getObs4() { return obs4; }
    public void setObs4(String obs4) { this.obs4 = obs4; }

    public String getObs5() { return obs5; }
    public void setObs5(String obs5) { this.obs5 = obs5; }

    public String getObs6() { return obs6; }
    public void setObs6(String obs6) { this.obs6 = obs6; }

    public String getObs7() { return obs7; }
    public void setObs7(String obs7) { this.obs7 = obs7; }

    public String getObs8() { return obs8; }
    public void setObs8(String obs8) { this.obs8 = obs8; }

    public String getObs9() { return obs9; }
    public void setObs9(String obs9) { this.obs9 = obs9; }

    public String getInstance1() { return instance1; }
    public void setInstance1(String instance1) { this.instance1 = instance1; }

    public String getDirection1() { return direction1; }
    public void setDirection1(String direction1) { this.direction1 = direction1; }

    public LocalDate getDateDebut1() { return dateDebut1; }
    public void setDateDebut1(LocalDate dateDebut1) { this.dateDebut1 = dateDebut1; }

    public Integer getJoursPenalite1() { return joursPenalite1; }
    public void setJoursPenalite1(Integer joursPenalite1) { this.joursPenalite1 = joursPenalite1; }

    public String getObsInstance1() { return obsInstance1; }
    public void setObsInstance1(String obsInstance1) { this.obsInstance1 = obsInstance1; }

    public String getSignaturePrestataire() { return signaturePrestataire; }
    public void setSignaturePrestataire(String signaturePrestataire) { this.signaturePrestataire = signaturePrestataire; }

    public String getSignatureDirection() { return signatureDirection; }
    public void setSignatureDirection(String signatureDirection) { this.signatureDirection = signatureDirection; }

    public String getSignatureDGSI() { return signatureDGSI; }
    public void setSignatureDGSI(String signatureDGSI) { this.signatureDGSI = signatureDGSI; }

    public Long getUtilisateurCreation() { return utilisateurCreation; }
    public void setUtilisateurCreation(Long utilisateurCreation) { this.utilisateurCreation = utilisateurCreation; }

    public Long getUtilisateurModification() { return utilisateurModification; }
    public void setUtilisateurModification(Long utilisateurModification) { this.utilisateurModification = utilisateurModification; }

    public String getFichierPdf() { return fichierPdf; }
    public void setFichierPdf(String fichierPdf) { this.fichierPdf = fichierPdf; }

    public Integer getScoreGlobal() { return scoreGlobal; }
    public void setScoreGlobal(Integer scoreGlobal) { this.scoreGlobal = scoreGlobal; }

    public String getRecommandation() { return recommandation; }
    public void setRecommandation(String recommandation) { this.recommandation = recommandation; }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}
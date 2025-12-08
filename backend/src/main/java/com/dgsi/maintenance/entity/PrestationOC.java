package com.dgsi.maintenance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class PrestationOC {
    @Column(name = "numero", length = 50)
    private String numero;

    @Column(name = "designation", length = 255)
    private String designation;

    @Column(name = "min_quantite")
    private Integer min;

    @Column(name = "max_quantite")
    private Integer max;

    @Column(name = "prix_unitaire")
    private Float pu;

    @Column(name = "quantite_trimestre_1")
    private Integer oc1;

    @Column(name = "quantite_trimestre_2")
    private Integer oc2;

    @Column(name = "quantite_trimestre_3")
    private Integer oc3;

    @Column(name = "quantite_trimestre_4")
    private Integer oc4;

    @Column(name = "montant_trimestre_1")
    private Float montantOc1;

    @Column(name = "montant_trimestre_2")
    private Float montantOc2;

    @Column(name = "montant_trimestre_3")
    private Float montantOc3;

    @Column(name = "montant_trimestre_4")
    private Float montantOc4;

    @Column(name = "ecart_calcule")
    private Float ecart;

    // Constructors, getters and setters
    public PrestationOC() {}

    public PrestationOC(String numero, String designation, Integer min, Integer max,
                       Float pu, Integer oc1, Integer oc2, Integer oc3, Integer oc4,
                       Float montantOc1, Float montantOc2, Float montantOc3, Float montantOc4,
                       Float ecart) {
        this.numero = numero;
        this.designation = designation;
        this.min = min;
        this.max = max;
        this.pu = pu;
        this.oc1 = oc1;
        this.oc2 = oc2;
        this.oc3 = oc3;
        this.oc4 = oc4;
        this.montantOc1 = montantOc1;
        this.montantOc2 = montantOc2;
        this.montantOc3 = montantOc3;
        this.montantOc4 = montantOc4;
        this.ecart = ecart;
    }

    // Getters and setters
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public Integer getMin() { return min; }
    public void setMin(Integer min) { this.min = min; }

    public Integer getMax() { return max; }
    public void setMax(Integer max) { this.max = max; }

    public Float getPu() { return pu; }
    public void setPu(Float pu) { this.pu = pu; }

    public Integer getOc1() { return oc1; }
    public void setOc1(Integer oc1) { this.oc1 = oc1; }

    public Integer getOc2() { return oc2; }
    public void setOc2(Integer oc2) { this.oc2 = oc2; }

    public Integer getOc3() { return oc3; }
    public void setOc3(Integer oc3) { this.oc3 = oc3; }

    public Integer getOc4() { return oc4; }
    public void setOc4(Integer oc4) { this.oc4 = oc4; }

    public Float getMontantOc1() { return montantOc1; }
    public void setMontantOc1(Float montantOc1) { this.montantOc1 = montantOc1; }

    public Float getMontantOc2() { return montantOc2; }
    public void setMontantOc2(Float montantOc2) { this.montantOc2 = montantOc2; }

    public Float getMontantOc3() { return montantOc3; }
    public void setMontantOc3(Float montantOc3) { this.montantOc3 = montantOc3; }

    public Float getMontantOc4() { return montantOc4; }
    public void setMontantOc4(Float montantOc4) { this.montantOc4 = montantOc4; }

    public Float getEcart() { return ecart; }
    public void setEcart(Float ecart) { this.ecart = ecart; }
}

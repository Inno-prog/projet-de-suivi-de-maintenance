package com.dgsi.maintenance.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrestataireDto {
    private String id;
    private String nom;
    private String email;
    private String contact;
    private String qualification;
    private String structure;
    private String direction;
    private String role = "PRESTATAIRE";
}
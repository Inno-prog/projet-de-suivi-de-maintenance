package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.Map;

import com.dgsi.maintenance.service.KeycloakService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/keycloak")
@CrossOrigin(origins = "*", maxAge = 3600)
public class KeycloakController {

    @Autowired
    private KeycloakService keycloakService;

    /**
     * Récupère tous les prestataires (utilisateurs avec le rôle PRESTATAIRE) depuis Keycloak
     */
    @GetMapping("/prestataires")
    public ResponseEntity<List<Map<String, Object>>> getPrestataires() {
        try {
            log.info("Récupération de la liste des prestataires depuis Keycloak");
            List<Map<String, Object>> prestataires = keycloakService.getAllPrestataires();
            log.info("Nombre de prestataires récupérés: {}", prestataires.size());
            return ResponseEntity.ok(prestataires);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des prestataires depuis Keycloak: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupère tous les utilisateurs depuis Keycloak
     */
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        try {
            log.info("Récupération de tous les utilisateurs depuis Keycloak");
            List<Map<String, Object>> users = keycloakService.getAllUsers();
            log.info("Nombre d'utilisateurs récupérés: {}", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des utilisateurs depuis Keycloak: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}


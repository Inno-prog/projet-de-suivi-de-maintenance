package com.dgsi.maintenance.controller;

import java.util.Map;

import com.dgsi.maintenance.service.ContratItemService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ContratItemService contratItemService;

    @Autowired
    public AdminController(ContratItemService contratItemService) {
        this.contratItemService = contratItemService;
    }

    /**
     * Endpoint admin pour synchroniser les quantités des items à partir des prestations existantes.
     * Protégé pour les administrateurs seulement.
     */
    @PostMapping("/sync-item-quantities")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Map<String, Object>> syncItemQuantities() {
        Map<String, Object> report = contratItemService.synchroniserQuantitesAvecPrestationsExistantes();
        return ResponseEntity.ok(report);
    }
}

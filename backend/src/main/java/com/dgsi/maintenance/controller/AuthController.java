package com.dgsi.maintenance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestParam(required = false) String refreshToken) {
        try {
            // Ici, vous pourriez invalider le refresh token côté serveur
            // Pour l'instant, on retourne simplement un succès
            return ResponseEntity.ok().body("Déconnexion réussie");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}

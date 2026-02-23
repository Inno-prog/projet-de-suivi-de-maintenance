package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.dto.RegisterRequest;
import com.dgsi.maintenance.entity.User;
import com.dgsi.maintenance.service.KeycloakService;
import com.dgsi.maintenance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private KeycloakService keycloakService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            // Créer l'utilisateur dans Keycloak avec email vérifié
            String keycloakUserId = keycloakService.createUser(
                registerRequest.getEmail(), // Utiliser email comme username
                registerRequest.getEmail(),
                registerRequest.getNom().split(" ")[0], // Prénom (premier mot)
                registerRequest.getNom().substring(registerRequest.getNom().indexOf(" ") + 1), // Nom de famille (reste)
                registerRequest.getPassword(),
                registerRequest.getRole()
            );

            // Créer l'utilisateur dans la base de données avec le même ID que Keycloak
            User user = userService.createUser(registerRequest, keycloakUserId);

            return ResponseEntity.ok().body("Inscription réussie");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

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

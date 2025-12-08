package com.dgsi.maintenance.service;

import java.util.Collections;
import java.util.List;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import jakarta.ws.rs.core.Response;

@Service
public class KeycloakService {

    // Commented out Keycloak properties for now since Keycloak is not running
    // @Value("${keycloak.auth-server-url}")
    // private String authServerUrl;

    // @Value("${keycloak.realm}")
    // private String realm;

    // @Value("${keycloak.admin.username}")
    // private String adminUsername;

    // @Value("${keycloak.admin.password}")
    // private String adminPassword;

    // @Value("${keycloak.admin.client-id}")
    // private String adminClientId;

    // Temporary hardcoded values for testing without Keycloak
    private String authServerUrl = "http://localhost:8080";
    private String realm = "Maintenance-DGSI";
    private String adminUsername = "admin";
    private String adminPassword = "admin";
    private String adminClientId = "admin-cli";

    private Keycloak getKeycloakInstance() {
        return KeycloakBuilder.builder()
                .serverUrl(authServerUrl)
                .realm(realm)
                .username(adminUsername)
                .password(adminPassword)
                .clientId(adminClientId)
                .build();
    }

    public String createUser(String username, String email, String firstName, String lastName, String password, String role) {
        Keycloak keycloak = getKeycloakInstance();
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            // Vérifier si l'utilisateur existe déjà
            List<UserRepresentation> existingUsers = usersResource.search(username, true);
            if (!existingUsers.isEmpty()) {
                throw new RuntimeException("User with username " + username + " already exists");
            }

            existingUsers = usersResource.search(null, null, null, email, 0, 1);
            if (!existingUsers.isEmpty()) {
                throw new RuntimeException("User with email " + email + " already exists");
            }

            UserRepresentation user = new UserRepresentation();
            user.setUsername(username);
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEnabled(true);
            user.setEmailVerified(true);

            // Créer l'utilisateur
            Response response = usersResource.create(user);
            if (response.getStatus() != 201) {
                throw new RuntimeException("Failed to create user in Keycloak");
            }

            String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

            // Définir le mot de passe
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(password);
            credential.setTemporary(false);
            usersResource.get(userId).resetPassword(credential);

            // Assigner le rôle
            RoleRepresentation realmRole = realmResource.roles().get(role).toRepresentation();
            usersResource.get(userId).roles().realmLevel().add(Collections.singletonList(realmRole));

            return userId;
        } finally {
            keycloak.close();
        }
    }

    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            // If no refresh token, we can't revoke it, but logout is still successful
            System.out.println("No refresh token provided for logout");
            return;
        }

        try {
            // Use HTTP call to revoke the refresh token via Keycloak's token revocation endpoint
            RestTemplate restTemplate = new RestTemplate();

            // Prepare the request body
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("token", refreshToken);
            params.add("token_type_hint", "refresh_token");
            params.add("client_id", "maintenance-app"); // Use the client ID
            params.add("client_secret", ""); // Public client, no secret needed

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            // Call Keycloak's token revocation endpoint
            String revocationUrl = authServerUrl + "/realms/" + realm + "/protocol/openid-connect/revoke";
            System.out.println("Calling Keycloak token revocation endpoint: " + revocationUrl);

            ResponseEntity<String> response = restTemplate.postForEntity(revocationUrl, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Successfully revoked refresh token in Keycloak");
            } else {
                System.err.println("Failed to revoke refresh token. Status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            // Log the error but don't fail the logout process
            System.err.println("Error revoking refresh token in Keycloak: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

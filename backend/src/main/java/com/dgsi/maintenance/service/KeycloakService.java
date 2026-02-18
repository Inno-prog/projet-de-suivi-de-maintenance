package com.dgsi.maintenance.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.RoleMappingResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class KeycloakService {

    @Value("${keycloak.auth-server-url:http://localhost:8080}")
    private String authServerUrl;

    @Value("${keycloak.realm:Maintenance-DGSI}")
    private String realm;

    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:admin123}")
    private String adminPassword;

    @Value("${keycloak.admin.client-id:admin-cli}")
    private String adminClientId;

    private Keycloak getKeycloakInstance() {
        return KeycloakBuilder.builder()
                .serverUrl(authServerUrl)
                .realm("master") // Must use master realm for admin operations
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

    /**
     * Get access token from Keycloak for admin API
     */
    private String getAdminAccessToken() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            String tokenUrl = authServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "password");
            params.add("client_id", "admin-cli");
            params.add("username", adminUsername);
            params.add("password", adminPassword);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            log.error("Failed to get admin access token: {}", e.getMessage());
        }
        return null;
    }
    
    public List<Map<String, Object>> getAllPrestataires() {
        List<Map<String, Object>> prestataires = new ArrayList<>();
        
        Keycloak keycloak = getKeycloakInstance();
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            RoleRepresentation prestataireRole = realmResource.roles().get("PRESTATAIRE").toRepresentation();
            
            // Get all users
            List<UserRepresentation> allUsers = usersResource.list();
            
            if (allUsers != null && !allUsers.isEmpty()) {
                for (UserRepresentation user : allUsers) {
                    if (user.isEnabled()) {
                        // Check if user has PRESTATAIRE role
                        List<RoleRepresentation> userRoles = usersResource.get(user.getId()).roles().realmLevel().listEffective();
                        
                        boolean hasPrestataireRole = userRoles.stream()
                            .anyMatch(role -> "PRESTATAIRE".equals(role.getName()));
                        
                        if (hasPrestataireRole) {
                            Map<String, Object> presta = new HashMap<>();
                            presta.put("id", user.getId());
                            presta.put("username", user.getUsername());
                            presta.put("email", user.getEmail());
                            presta.put("firstName", user.getFirstName());
                            presta.put("lastName", user.getLastName());
                            
                            // Create display name
                            String displayName = "";
                            if (user.getFirstName() != null && !user.getFirstName().isEmpty()) {
                                displayName = user.getFirstName();
                            }
                            if (user.getLastName() != null && !user.getLastName().isEmpty()) {
                                if (!displayName.isEmpty()) {
                                    displayName += " ";
                                }
                                displayName += user.getLastName();
                            }
                            if (displayName.isEmpty() && user.getUsername() != null) {
                                displayName = user.getUsername();
                            }
                            
                            presta.put("displayName", displayName);
                            prestataires.add(presta);
                        }
                    }
                }
            }
            
            log.info("Nombre de prestataires trouvés dans Keycloak: {}", prestataires.size());
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des prestataires depuis Keycloak: ", e);
        } finally {
            keycloak.close();
        }
        
        return prestataires;
    }

    public List<Map<String, Object>> getAllUsers() {
        List<Map<String, Object>> users = new ArrayList<>();
        
        Keycloak keycloak = getKeycloakInstance();
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            
            // Get all users
            List<UserRepresentation> allUsers = usersResource.list();
            
            if (allUsers != null && !allUsers.isEmpty()) {
                for (UserRepresentation user : allUsers) {
                    if (user.isEnabled()) {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", user.getId());
                        userMap.put("username", user.getUsername());
                        userMap.put("email", user.getEmail());
                        userMap.put("firstName", user.getFirstName());
                        userMap.put("lastName", user.getLastName());
                        
                        // Create display name
                        String displayName = "";
                        if (user.getFirstName() != null && !user.getFirstName().isEmpty()) {
                            displayName = user.getFirstName();
                        }
                        if (user.getLastName() != null && !user.getLastName().isEmpty()) {
                            if (!displayName.isEmpty()) {
                                displayName += " ";
                            }
                            displayName += user.getLastName();
                        }
                        if (displayName.isEmpty() && user.getUsername() != null) {
                            displayName = user.getUsername();
                        }
                        
                        userMap.put("displayName", displayName);
                        users.add(userMap);
                    }
                }
            }
            
            log.info("Nombre d'utilisateurs trouvés dans Keycloak: {}", users.size());
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des utilisateurs depuis Keycloak: ", e);
        } finally {
            keycloak.close();
        }
        
        return users;
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

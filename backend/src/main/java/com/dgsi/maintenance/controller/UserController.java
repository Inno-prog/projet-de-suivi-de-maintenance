package com.dgsi.maintenance.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import com.dgsi.maintenance.dto.PrestataireDto;
import com.dgsi.maintenance.entity.User;
import com.dgsi.maintenance.repository.UserRepository;
import com.dgsi.maintenance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private static final Logger logger = Logger.getLogger(UserController.class.getName());

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    private User createUserFromMap(Map<String, Object> userData) {
        String role = (String) userData.get("role");
        User user;

        if ("PRESTATAIRE".equals(role)) {
            com.dgsi.maintenance.entity.Prestataire prestataire = new com.dgsi.maintenance.entity.Prestataire();
            @SuppressWarnings("unchecked")
            Map<String, Object> prestataireDetails = (Map<String, Object>) userData.get("prestataireDetails");
            if (prestataireDetails != null) {
                prestataire.setStructure((String) prestataireDetails.get("structure"));
                prestataire.setDirection((String) prestataireDetails.get("direction"));
                prestataire.setQualification((String) prestataireDetails.get("qualification"));
            }
            user = prestataire;
        } else if ("ADMINISTRATEUR".equals(role)) {
            user = new com.dgsi.maintenance.entity.Administrator();
            // Set administrator-specific fields if any
        } else if ("AGENT_DGSI".equals(role)) {
            user = new com.dgsi.maintenance.entity.AgentDGSI();
            // Set agent-specific fields if any
        } else {
            // Default to Administrator if role is not recognized
            user = new com.dgsi.maintenance.entity.Administrator();
        }

        // Set common fields
        user.setNom((String) userData.get("nom"));
        user.setEmail((String) userData.get("email"));
        user.setPassword((String) userData.get("password"));
        user.setContact((String) userData.get("contact"));
        user.setAdresse((String) userData.get("adresse"));

        return user;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<User> createUser(@RequestBody Map<String, Object> userData) {
        try {
            User user = createUserFromMap(userData);
            // Ensure password is set for new users
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                // Set a default password or generate one
                user.setPassword("default123"); // You might want to generate a random password
            }
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> response = users.stream()
            .map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("email", user.getEmail());
                userMap.put("nom", user.getNom());
                userMap.put("contact", user.getContact());
                userMap.put("adresse", user.getAdresse());
                userMap.put("role", user.getRole());

                // Initialize fields to null for all users
                userMap.put("qualification", null);
                userMap.put("structure", null);
                userMap.put("direction", null);

                if (user instanceof com.dgsi.maintenance.entity.Prestataire) {
                    com.dgsi.maintenance.entity.Prestataire prestataire = (com.dgsi.maintenance.entity.Prestataire) user;
                    userMap.put("qualification", prestataire.getQualification());
                    userMap.put("structure", prestataire.getStructure());
                    userMap.put("direction", prestataire.getDirection());
                } else if (user instanceof com.dgsi.maintenance.entity.AgentDGSI) {
                    com.dgsi.maintenance.entity.AgentDGSI agent = (com.dgsi.maintenance.entity.AgentDGSI) user;
                    userMap.put("structure", agent.getStructure());
                }

                return userMap;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or @userRepository.findById(#id).get().email == authentication.name")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
            .map(user -> ResponseEntity.ok().body(user))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or @userRepository.findById(#id).get().email == authentication.name")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody Map<String, Object> userData) {
        return userRepository.findById(id)
            .map(user -> {
                // Update common fields
                if (userData.containsKey("nom")) user.setNom((String) userData.get("nom"));
                if (userData.containsKey("contact")) user.setContact((String) userData.get("contact"));
                if (userData.containsKey("adresse")) user.setAdresse((String) userData.get("adresse"));

                // Handle prestataire-specific fields
                if (user instanceof com.dgsi.maintenance.entity.Prestataire) {
                    com.dgsi.maintenance.entity.Prestataire prestataire = (com.dgsi.maintenance.entity.Prestataire) user;

                    // Check for nested prestataireDetails (legacy format)
                    @SuppressWarnings("unchecked")
                    Map<String, Object> prestataireDetails = (Map<String, Object>) userData.get("prestataireDetails");
                    if (prestataireDetails != null) {
                        if (prestataireDetails.containsKey("structure")) prestataire.setStructure((String) prestataireDetails.get("structure"));
                        if (prestataireDetails.containsKey("direction")) prestataire.setDirection((String) prestataireDetails.get("direction"));
                        if (prestataireDetails.containsKey("qualification")) prestataire.setQualification((String) prestataireDetails.get("qualification"));
                    } else {
                        // Check for direct fields in userData (new format from frontend)
                        if (userData.containsKey("qualification")) prestataire.setQualification((String) userData.get("qualification"));
                        if (userData.containsKey("structure")) prestataire.setStructure((String) userData.get("structure"));
                        if (userData.containsKey("direction")) prestataire.setDirection((String) userData.get("direction"));
                    }
                }
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/prestataires")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<Map<String, Object>>> getAllPrestataires() {
        List<User> prestataires = userRepository.findAllPrestataires();
        List<Map<String, Object>> dtos = prestataires.stream()
            .map(user -> {
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("email", user.getEmail());
                response.put("nom", user.getNom());
                response.put("contact", user.getContact());
                response.put("adresse", user.getAdresse());
                response.put("role", user.getRole());

                if (user instanceof com.dgsi.maintenance.entity.Prestataire) {
                    com.dgsi.maintenance.entity.Prestataire prestataire = (com.dgsi.maintenance.entity.Prestataire) user;
                    Map<String, Object> details = new HashMap<>();
                    details.put("structure", prestataire.getStructure());
                    details.put("direction", prestataire.getDirection());
                    details.put("qualification", prestataire.getQualification());
                    response.put("prestataireDetails", details);
                }
                return response;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUser() {
        org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
            .map(user -> {
                // If user is a Prestataire, return PrestataireDto
                if (user instanceof com.dgsi.maintenance.entity.Prestataire) {
                    com.dgsi.maintenance.entity.Prestataire prestataire = (com.dgsi.maintenance.entity.Prestataire) user;

                    PrestataireDto dto = new PrestataireDto();
                    dto.setId(prestataire.getId());
                    dto.setNom(prestataire.getNom());
                    dto.setEmail(prestataire.getEmail());
                    dto.setContact(prestataire.getContact());
                    dto.setStructure(prestataire.getStructure());
                    dto.setDirection(prestataire.getDirection());
                    dto.setQualification(prestataire.getQualification());

                    return ResponseEntity.ok(dto);
                }

                // For other user types, return basic user info
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("email", user.getEmail());
                userData.put("nom", user.getNom());
                userData.put("contact", user.getContact());
                userData.put("adresse", user.getAdresse());

                // Determine role from instance type
                String role = "USER";
                if (user instanceof com.dgsi.maintenance.entity.Administrator) {
                    role = "ADMINISTRATEUR";
                } else if (user instanceof com.dgsi.maintenance.entity.AgentDGSI) {
                    role = "AGENT_DGSI";
                }

                userData.put("role", role);
                return ResponseEntity.ok(userData);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/prestataires/me")
    @PreAuthorize("hasRole('PRESTATAIRE')")
    public ResponseEntity<?> getCurrentPrestataireProfile() {
        org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
            .map(user -> {
                if (!(user instanceof com.dgsi.maintenance.entity.Prestataire)) {
                    return ResponseEntity.status(403).body("Access denied: User is not a prestataire");
                }

                com.dgsi.maintenance.entity.Prestataire prestataire = (com.dgsi.maintenance.entity.Prestataire) user;

                Map<String, Object> profileData = new HashMap<>();
                profileData.put("id", prestataire.getId());
                profileData.put("nom", prestataire.getNom());
                profileData.put("email", prestataire.getEmail());
                profileData.put("contact", prestataire.getContact());
                profileData.put("structure", prestataire.getStructure());
                profileData.put("direction", prestataire.getDirection());
                profileData.put("qualification", prestataire.getQualification());
                profileData.put("adresse", prestataire.getAdresse());
                profileData.put("role", "PRESTATAIRE");

                return ResponseEntity.ok(profileData);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, Object> userData, java.security.Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email)
            .map(user -> {
                if (userData.containsKey("nom")) user.setNom((String) userData.get("nom"));
                if (userData.containsKey("email")) user.setEmail((String) userData.get("email"));
                if (userData.containsKey("contact")) user.setContact((String) userData.get("contact"));
                if (userData.containsKey("adresse")) user.setAdresse((String) userData.get("adresse"));

                // Handle prestataire-specific fields for profile updates
                if (user instanceof com.dgsi.maintenance.entity.Prestataire) {
                    com.dgsi.maintenance.entity.Prestataire prestataire = (com.dgsi.maintenance.entity.Prestataire) user;
                    if (userData.containsKey("qualification")) prestataire.setQualification((String) userData.get("qualification"));
                    if (userData.containsKey("structure")) prestataire.setStructure((String) userData.get("structure"));
                    if (userData.containsKey("direction")) prestataire.setDirection((String) userData.get("direction"));
                }

                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        return userRepository.findById(id)
            .map(user -> {
                userRepository.delete(user);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/fix-data")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<String> fixUserData() {
        try {
            int updated = userService.fixUserData();
            return ResponseEntity.ok("Updated " + updated + " users with missing structure/direction data");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fixing data: " + e.getMessage());
        }
    }

    @GetMapping("/debug/prestataires")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<Map<String, Object>>> debugPrestataires() {
        List<User> prestataires = userRepository.findAll().stream()
            .filter(user -> "PRESTATAIRE".equals(user.getRole()))
            .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();

        for (User p : prestataires) {
            Map<String, Object> data = new HashMap<>();
            data.put("id", p.getId());
            data.put("email", p.getEmail());
            data.put("nom", p.getNom());
            if (p instanceof com.dgsi.maintenance.entity.Prestataire) {
                com.dgsi.maintenance.entity.Prestataire prestataire = (com.dgsi.maintenance.entity.Prestataire) p;
                data.put("structure", prestataire.getStructure());
                data.put("direction", prestataire.getDirection());
            } else {
                data.put("structure", null);
                data.put("direction", null);
            }
            data.put("class", p.getClass().getName());
            result.add(data);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/force-fix-data")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<String> forceFixData() {
        try {
            logger.info("=== FORÇAGE DE LA MISE À JOUR DES DONNÉES ===");
            int updated = userService.fixUserData();
            logger.info("=== FIN DU FORÇAGE ===");
            return ResponseEntity.ok("Force updated " + updated + " users with structure/direction data");
        } catch (Exception e) {
            logger.severe("Error during force fix: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error during force fix: " + e.getMessage());
        }
    }
}

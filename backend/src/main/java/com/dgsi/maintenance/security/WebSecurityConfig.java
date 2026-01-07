package com.dgsi.maintenance.security;

import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
// @EnableMethodSecurity  // Disabled for development mode
public class WebSecurityConfig {

    private final KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter;

    public WebSecurityConfig(KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter) {
        this.keycloakJwtAuthenticationConverter = keycloakJwtAuthenticationConverter;
    }

    @Bean
    public String profile() {
        return System.getProperty("spring.profiles.active", "default");
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        boolean isProduction = "production".equals(System.getProperty("spring.profiles.active"));

        // If not production, insert a development authentication filter that grants role-specific authentication
        if (!isProduction) {
            // Temporarily disable dev filter for testing
            // http.addFilterBefore(new OncePerRequestFilter() {
            //     @Override
            //     protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            //             throws ServletException, IOException {
            //         // In development, simulate different user authentications based on request context
            //         System.out.println("🔧 DEV FILTER: Setting authentication for request: " + request.getRequestURI());

            //         // Check for user simulation headers/parameters
            //         String simulatedUser = request.getHeader("X-Simulated-User");
            //         if (simulatedUser == null) {
            //             // Check query parameter
            //             simulatedUser = request.getParameter("simulatedUser");
            //         }
            //         if (simulatedUser == null) {
            //             // Check session attribute
            //             simulatedUser = (String) request.getSession().getAttribute("simulatedUser");
            //         }

            //         // Default to softlink (prestataire) if no simulation specified for better testing
            //         if (simulatedUser == null || simulatedUser.isEmpty()) {
            //             simulatedUser = "softlink";
            //         }

            //         String principalName;
            //         List<SimpleGrantedAuthority> authorities;

            //         switch (simulatedUser.toLowerCase()) {
            //             case "admin":
            //             case "administrateur":
            //                 principalName = "admin@gmail.com";
            //                 authorities = Arrays.asList(
            //                     new SimpleGrantedAuthority("ROLE_ADMINISTRATEUR"),
            //                     new SimpleGrantedAuthority("ROLE_PRESTATAIRE"),
            //                     new SimpleGrantedAuthority("ROLE_AGENT_DGSI")
            //                 );
            //                 break;
            //             case "prestataire":
            //             case "presta":
            //                 principalName = "presta@gmail.com";
            //                 authorities = Arrays.asList(
            //                     new SimpleGrantedAuthority("ROLE_PRESTATAIRE")
            //                 );
            //                 break;
            //             case "agent":
            //             case "agent_dgsi":
            //                 principalName = "agent@gmail.com";
            //                 authorities = Arrays.asList(
            //                     new SimpleGrantedAuthority("ROLE_AGENT_DGSI")
            //                 );
            //                 break;
            //             default:
            //                 // Fallback to admin
            //                 principalName = "admin@gmail.com";
            //                 authorities = Arrays.asList(
            //                     new SimpleGrantedAuthority("ROLE_ADMINISTRATEUR"),
            //                     new SimpleGrantedAuthority("ROLE_PRESTATAIRE"),
            //                     new SimpleGrantedAuthority("ROLE_AGENT_DGSI")
            //                 );
            //                 break;
            //         }

            //         UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principalName, null, authorities);
            //         SecurityContextHolder.getContext().setAuthentication(auth);
            //         System.out.println("✅ DEV FILTER: Authentication set for user: " + simulatedUser + " (" + principalName + ") with roles: " + authorities);
            //         filterChain.doFilter(request, response);
            //     }
            // }, org.springframework.security.web.authentication.AnonymousAuthenticationFilter.class);
        }
        http
            // Configurer CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Désactiver CSRF pour les points de terminaison API
            .csrf(csrf -> csrf.disable())

            // Configurer la gestion des sessions
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Configurer les en-têtes de sécurité
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny())
                .contentTypeOptions(contentTypeOptions -> {})
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                )
            )

            // Configurer les règles d'autorisation
            .authorizeHttpRequests(authz -> authz
                // Autoriser l'accès non authentifié au point de terminaison d'inscription
                .requestMatchers("/api/auth/register").permitAll()

                // Autoriser l'accès à la console H2 pour le développement (supprimer en production)
                .requestMatchers("/h2-console/**").permitAll()

                // Déclarer explicitement les endpoints dev pour fiches (permissifs en dev)
                .requestMatchers("/api/fiches-prestation/dev/**").permitAll()

                // Permettre l'accès aux PDFs en développement (bypass @PreAuthorize)
                .requestMatchers("/api/fiches-prestation/*/pdf").permitAll()
                .requestMatchers("/api/prestations/*/pdf").permitAll()
                .requestMatchers("/api/reports/*/pdf").permitAll()
                
                // Permettre l'accès aux notifications SSE en développement
                .requestMatchers("/api/notifications/stream/**").permitAll()
                
                // Permettre l'accès aux endpoints d'authentification en développement
                .requestMatchers("/api/auth/**").permitAll()
                
                // Permettre l'accès aux WebSocket endpoints en développement
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/topic/**").permitAll()
                .requestMatchers("/app/**").permitAll()

                // TEMPORAIRE : Permettre l'accès aux ordres de commande pour voir les calculs corrigés
                .requestMatchers("/api/ordres-commande/**").permitAll()

                // Permettre l'accès aux prestations pour les tests
                .requestMatchers("/api/prestations/**").permitAll()

                // En développement, autoriser toutes les requêtes API sans authentification
                .requestMatchers("/api/**").permitAll()

                // Exiger l'authentification pour toutes les autres requêtes (par défaut en prod)
                // .anyRequest().authenticated()
            );

        // Configure OAuth2 Resource Server with JWT converter pour Keycloak
        // En production, cela validera les JWT depuis Keycloak et extraira les rôles
        if (isProduction) {
            http.oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtAuthenticationConverter))
            );
        } else {
            // En développement, le dev filter injecte les rôles directement
            http.oauth2ResourceServer(oauth2 -> oauth2.disable());
        }

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Configuration des origines basée sur l'environnement
        boolean isProduction = "production".equals(System.getProperty("spring.profiles.active"));

        if (isProduction) {
            // Production : Autoriser uniquement des domaines spécifiques
            configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://yourdomain.com",           // Remplacer par votre domaine de production
                "https://www.yourdomain.com",       // Remplacer par votre domaine www
                "https://app.yourdomain.com"        // Remplacer par votre sous-domaine app
            ));
        } else {
            // Développement : Autoriser localhost avec différents ports
            configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:4200",     // Serveur de développement Angular
                "http://localhost:8080",     // Serveur de développement Keycloak
                "http://localhost:8085"      // Serveur de développement backend (port courant)
            ));
        }

        // Autoriser des méthodes HTTP spécifiques
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        // Autoriser des en-têtes spécifiques
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Cache-Control"
        ));

        // Exposer des en-têtes spécifiques au client
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Length"
        ));

        // Autoriser les informations d'identification (important pour les tokens JWT)
        configuration.setAllowCredentials(true);

        // Mettre en cache la réponse preflight (plus courte en production pour la sécurité)
        configuration.setMaxAge(isProduction ? 1800L : 3600L); // 30 min prod, 1 heure dev

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}

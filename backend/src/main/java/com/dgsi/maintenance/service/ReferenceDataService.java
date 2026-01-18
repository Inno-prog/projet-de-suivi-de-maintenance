package com.dgsi.maintenance.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Service;

/**
 * Service pour gérer les données de référence des régions et villes du Burkina Faso
 */
@Service
public class ReferenceDataService {

    private static final Map<String, List<String>> REGION_VILLES = new HashMap<>();
    private static final Map<String, String> VILLE_REGION = new HashMap<>();
    
    static {
        // 1. Bankui (Chef-lieu : Dédougou)
        REGION_VILLES.put("Bankui", Arrays.asList("Dédougou", "Nouna", "Tougan", "Solenzo", "Toma"));
        for (String ville : REGION_VILLES.get("Bankui")) {
            VILLE_REGION.put(ville, "Bankui");
        }
        
        // 2. Djôrô (Chef-lieu : Gaoua)
        REGION_VILLES.put("Djôrô", Arrays.asList("Gaoua", "Diébougou", "Dano", "Batié"));
        for (String ville : REGION_VILLES.get("Djôrô")) {
            VILLE_REGION.put(ville, "Djôrô");
        }
        
        // 3. Goulmou (Chef-lieu : Fada N'Gourma)
        REGION_VILLES.put("Goulmou", Arrays.asList("Fada N'Gourma", "Diapaga", "Bogandé", "Manni"));
        for (String ville : REGION_VILLES.get("Goulmou")) {
            VILLE_REGION.put(ville, "Goulmou");
        }
        
        // 4. Guiriko (Chef-lieu : Bobo-Dioulasso)
        REGION_VILLES.put("Guiriko", Arrays.asList("Bobo-Dioulasso", "Houndé", "Orodara", "Banfora"));
        for (String ville : REGION_VILLES.get("Guiriko")) {
            VILLE_REGION.put(ville, "Guiriko");
        }
        
        // 5. Kadiogo (Chef-lieu : Ouagadougou)
        REGION_VILLES.put("Kadiogo", Arrays.asList("Ouagadougou", "Saaba", "Koubri", "Tanghin-Dassouri"));
        for (String ville : REGION_VILLES.get("Kadiogo")) {
            VILLE_REGION.put(ville, "Kadiogo");
        }
        
        // 6. Kuilsé (Chef-lieu : Kaya)
        REGION_VILLES.put("Kuilsé", Arrays.asList("Kaya", "Kongoussi", "Boulsa", "Pissila"));
        for (String ville : REGION_VILLES.get("Kuilsé")) {
            VILLE_REGION.put(ville, "Kuilsé");
        }
        
        // 7. Liptako (Chef-lieu : Dori)
        REGION_VILLES.put("Liptako", Arrays.asList("Dori", "Gorom-Gorom", "Sebba"));
        for (String ville : REGION_VILLES.get("Liptako")) {
            VILLE_REGION.put(ville, "Liptako");
        }
        
        // 8. Nando (Chef-lieu : Koudougou)
        REGION_VILLES.put("Nando", Arrays.asList("Koudougou", "Réo", "Léo", "Sabou"));
        for (String ville : REGION_VILLES.get("Nando")) {
            VILLE_REGION.put(ville, "Nando");
        }
        
        // 9. Nakambé (Chef-lieu : Tenkodogo)
        REGION_VILLES.put("Nakambé", Arrays.asList("Tenkodogo", "Koupéla", "Pouytenga", "Garango"));
        for (String ville : REGION_VILLES.get("Nakambé")) {
            VILLE_REGION.put(ville, "Nakambé");
        }
        
        // 10. Nazinon (Chef-lieu : Manga)
        REGION_VILLES.put("Nazinon", Arrays.asList("Manga", "Kombissiri", "Pô"));
        for (String ville : REGION_VILLES.get("Nazinon")) {
            VILLE_REGION.put(ville, "Nazinon");
        }
        
        // 11. Oubri (Chef-lieu : Ziniaré)
        REGION_VILLES.put("Oubri", Arrays.asList("Ziniaré", "Boussé", "Zorgho"));
        for (String ville : REGION_VILLES.get("Oubri")) {
            VILLE_REGION.put(ville, "Oubri");
        }
        
        // 12. Sirba (Chef-lieu : Bogandé) - Note: Bogandé peut être dans Goulmou ou Sirba
        REGION_VILLES.put("Sirba", Arrays.asList("Bogandé", "Manni", "Coalla"));
        for (String ville : REGION_VILLES.get("Sirba")) {
            VILLE_REGION.put(ville, "Sirba");
        }
        
        // 13. Soum (Chef-lieu : Djibo)
        REGION_VILLES.put("Soum", Arrays.asList("Djibo", "Arbinda", "Tongomayel"));
        for (String ville : REGION_VILLES.get("Soum")) {
            VILLE_REGION.put(ville, "Soum");
        }
        
        // 14. Tannounyan (Chef-lieu : Banfora)
        REGION_VILLES.put("Tannounyan", Arrays.asList("Banfora", "Sindou", "Mangodara"));
        for (String ville : REGION_VILLES.get("Tannounyan")) {
            VILLE_REGION.put(ville, "Tannounyan");
        }
        
        // 15. Tapoa (Chef-lieu : Diapaga)
        REGION_VILLES.put("Tapoa", Arrays.asList("Diapaga", "Pama"));
        for (String ville : REGION_VILLES.get("Tapoa")) {
            VILLE_REGION.put(ville, "Tapoa");
        }
        
        // 16. Sourou (Chef-lieu : Tougan)
        REGION_VILLES.put("Sourou", Arrays.asList("Tougan", "Lankoué", "Kiembara"));
        for (String ville : REGION_VILLES.get("Sourou")) {
            VILLE_REGION.put(ville, "Sourou");
        }
        
        // 17. Yaadga (Chef-lieu : Ouahigouya)
        REGION_VILLES.put("Yaadga", Arrays.asList("Ouahigouya", "Gourcy", "Titao"));
        for (String ville : REGION_VILLES.get("Yaadga")) {
            VILLE_REGION.put(ville, "Yaadga");
        }
    }
    
    /**
     * Récupérer toutes les régions triées alphabétiquement
     */
    public List<String> getAllRegions() {
        List<String> regions = new ArrayList<>(REGION_VILLES.keySet());
        Collections.sort(regions);
        return regions;
    }
    
    /**
     * Récupérer toutes les villes triées alphabétiquement
     */
    public List<String> getAllVilles() {
        List<String> villes = new ArrayList<>(VILLE_REGION.keySet());
        Collections.sort(villes);
        return villes;
    }
    
    /**
     * Récupérer les villes d'une région spécifique
     */
    public List<String> getVillesByRegion(String region) {
        List<String> villes = REGION_VILLES.get(region);
        if (villes != null) {
            List<String> sortedVilles = new ArrayList<>(villes);
            Collections.sort(sortedVilles);
            return sortedVilles;
        }
        return Collections.emptyList();
    }
    
    /**
     * Récupérer la région d'une ville spécifique
     */
    public String getRegionByVille(String ville) {
        return VILLE_REGION.get(ville);
    }
    
    /**
     * Vérifier si une ville existe
     */
    public boolean villeExists(String ville) {
        return VILLE_REGION.containsKey(ville);
    }
    
    /**
     * Vérifier si une région existe
     */
    public boolean regionExists(String region) {
        return REGION_VILLES.containsKey(region);
    }
    
    /**
     * Récupérer la carte complète région -> villes
     */
    public Map<String, List<String>> getAllRegionVilles() {
        Map<String, List<String>> sorted = new TreeMap<>(REGION_VILLES);
        // Trier les villes de chaque région
        for (String region : sorted.keySet()) {
            List<String> sortedVilles = new ArrayList<>(sorted.get(region));
            Collections.sort(sortedVilles);
            sorted.put(region, sortedVilles);
        }
        return sorted;
    }
    
    /**
     * Attribuer automatiquement la région à une structure en fonction de sa ville
     */
    public String assignRegionFromVille(String ville) {
        if (ville == null || ville.trim().isEmpty()) {
            return null;
        }
        // Chercher une correspondance exacte ou approximative
        for (Map.Entry<String, List<String>> entry : REGION_VILLES.entrySet()) {
            for (String v : entry.getValue()) {
                if (v.equalsIgnoreCase(ville.trim())) {
                    return entry.getKey();
                }
            }
        }
        // Si aucune correspondance exacte, essayer avec contains
        for (Map.Entry<String, List<String>> entry : REGION_VILLES.entrySet()) {
            for (String v : entry.getValue()) {
                if (ville.toLowerCase().contains(v.toLowerCase()) || 
                    v.toLowerCase().contains(ville.toLowerCase())) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }
}


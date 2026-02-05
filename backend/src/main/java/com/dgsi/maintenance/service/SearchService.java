package com.dgsi.maintenance.service;

import com.dgsi.maintenance.entity.*;
import com.dgsi.maintenance.repository.*;
import com.dgsi.maintenance.dto.LotWithContractorDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private FichePrestationRepository fichePrestationRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private EvaluationTrimestrielleRepository evaluationTrimestrielleRepository;

    @Autowired
    private PrestationRepository prestationRepository;

    @Autowired
    private StructureMefpRepository structureMefpRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LotRepository lotRepository;

    public List<SearchResult> search(String query) {
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }

        String searchTerm = query.toLowerCase().trim();
        List<SearchResult> results = new ArrayList<>();

        // Search in contrats
        results.addAll(searchContrats(searchTerm));
        // Search in fiches
        results.addAll(searchFiches(searchTerm));
        // Search in items
        results.addAll(searchItems(searchTerm));
        // Search in prestations
        results.addAll(searchPrestations(searchTerm));
        // Search in structures
        results.addAll(searchStructures(searchTerm));
        // Search in users
        results.addAll(searchUsers(searchTerm));
        // Search in lots
        results.addAll(searchLots(searchTerm));

        return results.stream()
                .sorted((a, b) -> a.getTitle().compareToIgnoreCase(b.getTitle()))
                .collect(Collectors.toList());
    }

    private List<SearchResult> searchContrats(String term) {
        List<Contrat> contrats = contratRepository.findAll();
        return contrats.stream()
                .filter(contrat -> 
                    (contrat.getNomPrestataire() != null && contrat.getNomPrestataire().toLowerCase().contains(term)) ||
                    (contrat.getIdContrat() != null && contrat.getIdContrat().toLowerCase().contains(term)) ||
                    (contrat.getVille() != null && contrat.getVille().toLowerCase().contains(term))
                )
                .map(contrat -> new SearchResult(
                        contrat.getId(),
                        "contrat",
                        contrat.getNomPrestataire() != null ? contrat.getNomPrestataire() : "Contrat",
                        "ID: " + (contrat.getIdContrat() != null ? contrat.getIdContrat() : "") + " - " + (contrat.getVille() != null ? contrat.getVille() : ""),
                        "📄",
                        "/contrats/" + contrat.getId()
                ))
                .collect(Collectors.toList());
    }

    private List<SearchResult> searchFiches(String term) {
        List<FichePrestation> fiches = fichePrestationRepository.findAll();
        return fiches.stream()
                .filter(fiche -> 
                    (fiche.getIdPrestation() != null && fiche.getIdPrestation().toLowerCase().contains(term)) ||
                    (fiche.getNomPrestataire() != null && fiche.getNomPrestataire().toLowerCase().contains(term)) ||
                    (fiche.getNomItem() != null && fiche.getNomItem().toLowerCase().contains(term))
                )
                .map(fiche -> new SearchResult(
                        fiche.getId(),
                        "fiche",
                        "Fiche " + (fiche.getIdPrestation() != null ? fiche.getIdPrestation() : ""),
                        (fiche.getNomPrestataire() != null ? fiche.getNomPrestataire() : "") + " - " + (fiche.getNomItem() != null ? fiche.getNomItem() : ""),
                        "📋",
                        "/fiches-prestation/" + fiche.getId()
                ))
                .collect(Collectors.toList());
    }

    private List<SearchResult> searchItems(String term) {
        List<Item> items = itemRepository.findAll();
        return items.stream()
                .filter(item -> 
                    (item.getNomItem() != null && item.getNomItem().toLowerCase().contains(term)) ||
                    (item.getLot() != null && item.getLot().toLowerCase().contains(term))
                )
                .map(item -> new SearchResult(
                        item.getId(),
                        "item",
                        item.getNomItem() != null ? item.getNomItem() : "Item",
                        item.getLot() != null ? item.getLot() : "",
                        "🧰",
                        "/items/" + item.getId()
                ))
                .collect(Collectors.toList());
    }

    private List<SearchResult> searchPrestations(String term) {
        List<Prestation> prestations = prestationRepository.findAll();
        return prestations.stream()
                .filter(prestation -> 
                    (prestation.getNomPrestation() != null && prestation.getNomPrestation().toLowerCase().contains(term)) ||
                    (prestation.getNomPrestataire() != null && prestation.getNomPrestataire().toLowerCase().contains(term))
                )
                .map(prestation -> new SearchResult(
                        prestation.getId(),
                        "prestation",
                        prestation.getNomPrestation() != null ? prestation.getNomPrestation() : "Prestation",
                        prestation.getNomPrestataire() != null ? prestation.getNomPrestataire() : "",
                        "⚡",
                        "/prestations/" + prestation.getId()
                ))
                .collect(Collectors.toList());
    }

    private List<SearchResult> searchStructures(String term) {
        List<StructureMefp> structures = structureMefpRepository.findAll();
        return structures.stream()
                .filter(structure -> 
                    (structure.getNom() != null && structure.getNom().toLowerCase().contains(term)) ||
                    (structure.getVille() != null && structure.getVille().toLowerCase().contains(term))
                )
                .map(structure -> new SearchResult(
                        structure.getId(),
                        "structure",
                        structure.getNom() != null ? structure.getNom() : "Structure",
                        structure.getVille() != null ? structure.getVille() : "",
                        "🏢",
                        "/structures-mefp/" + structure.getId()
                ))
                .collect(Collectors.toList());
    }

    private List<SearchResult> searchUsers(String term) {
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(user -> 
                    (user.getNom() != null && user.getNom().toLowerCase().contains(term)) ||
                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(term)) ||
                    (user.getContact() != null && user.getContact().toLowerCase().contains(term))
                )
                .map(user -> new SearchResult(
                        user.getId(),
                        "user",
                        user.getNom() != null ? user.getNom() : "Utilisateur",
                        user.getEmail() != null ? user.getEmail() : "",
                        "👥",
                        "/users/" + user.getId()
                ))
                .collect(Collectors.toList());
    }

    private List<SearchResult> searchLots(String term) {
        List<Lot> lots = lotRepository.findAll();
        return lots.stream()
                .filter(lot -> 
                    (lot.getNomLot() != null && lot.getNomLot().toLowerCase().contains(term)) ||
                    (lot.getVilles() != null && lot.getVilles().stream().anyMatch(ville -> ville.toLowerCase().contains(term))) ||
                    (lot.getCodeLot() != null && lot.getCodeLot().toLowerCase().contains(term))
                )
                .map(lot -> new SearchResult(
                        lot.getNomLot(),
                        "lot",
                        lot.getNomLot() != null ? lot.getNomLot() : "Lot",
                        lot.getVilles() != null ? String.join(", ", lot.getVilles()) : "",
                        "📦",
                        "/lots/" + URLEncoder.encode(lot.getNomLot() != null ? lot.getNomLot() : "", StandardCharsets.UTF_8)
                ))
                .collect(Collectors.toList());
    }

    public static class SearchResult {
        private Object id;
        private String type;
        private String title;
        private String description;
        private String icon;
        private String route;

        public SearchResult(Object id, String type, String title, String description, String icon, String route) {
            this.id = id;
            this.type = type;
            this.title = title;
            this.description = description;
            this.icon = icon;
            this.route = route;
        }

        // Getters and Setters
        public Object getId() {
            return id;
        }

        public void setId(Object id) {
            this.id = id;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }

        public String getRoute() {
            return route;
        }

        public void setRoute(String route) {
            this.route = route;
        }
    }
}
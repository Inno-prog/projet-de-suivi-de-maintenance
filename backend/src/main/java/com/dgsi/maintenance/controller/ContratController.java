package com.dgsi.maintenance.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import com.dgsi.maintenance.entity.Contrat;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.entity.StatutContrat;
import com.dgsi.maintenance.repository.ContratRepository;
import com.dgsi.maintenance.repository.ItemRepository;
import com.dgsi.maintenance.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/contrats")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ContratController {

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private FileUploadService fileUploadService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<List<Contrat>> getAllContrats() {
        try {
            log.info("Tentative de récupération de tous les contrats");
            List<Contrat> contrats = contratRepository.findAll();
            log.info("Nombre de contrats récupérés: {}", contrats.size());
            return ResponseEntity.ok(contrats);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des contrats: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<Contrat> getContratById(@PathVariable Long id) {
        return contratRepository.findById(id)
            .map(contrat -> ResponseEntity.ok().body(contrat))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> createContrat(
            @RequestParam(value = "idContrat", required = false) String idContrat,
            @RequestParam(value = "nomPrestataire", required = false) String nomPrestataire,
            @RequestParam(value = "lot", required = false) String lot,
            @RequestParam(value = "ville", required = false) String ville,
            @RequestParam(value = "dateDebut", required = false) String dateDebut,
            @RequestParam(value = "dateFin", required = false) String dateFin,
            @RequestParam(value = "montant", required = false) Double montant,
            @RequestParam(value = "statut", required = false) String statut,
            @RequestParam(value = "typeContrat", required = false) String typeContrat,
            @RequestParam(value = "itemIds", required = false) List<Long> itemIds,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {
            // Generate idContrat if not provided
            if (idContrat == null || idContrat.trim().isEmpty()) {
                idContrat = generateContratId();
            } else if (contratRepository.existsByIdContrat(idContrat)) {
                return ResponseEntity.badRequest().build();
            }

            Contrat contrat = new Contrat();
            contrat.setIdContrat(idContrat);
            contrat.setNomPrestataire(nomPrestataire);
            contrat.setLot(lot);
            contrat.setVille(ville);
            contrat.setDateDebut(dateDebut != null ? LocalDate.parse(dateDebut) : null);
            contrat.setDateFin(dateFin != null ? LocalDate.parse(dateFin) : null);
            contrat.setMontant(montant);
            contrat.setTypeContrat(typeContrat);
            contrat.setStatut(statut != null ? StatutContrat.valueOf(statut) : StatutContrat.ACTIF);

            // Handle file upload
            if (file != null && !file.isEmpty()) {
                List<String> filePaths = fileUploadService.uploadFiles(new MultipartFile[]{file}, "contrats");
                if (!filePaths.isEmpty()) {
                    contrat.setFichierContrat(filePaths.get(0));
                }
            }

            // Handle items
            if (itemIds != null && !itemIds.isEmpty()) {
                Set<Item> items = itemIds.stream()
                    .map(itemId -> itemRepository.findById(itemId).orElse(null))
                    .filter(item -> item != null)
                    .collect(Collectors.toSet());
                contrat.setItems(items);
            }

            Contrat savedContrat = contratRepository.save(contrat);
            log.info("Contrat créé avec succès: {}", savedContrat.getId());
            return ResponseEntity.ok(savedContrat);

        } catch (Exception e) {
            log.error("Erreur lors de la création du contrat: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(consumes = "application/json")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> createContratJson(@Valid @RequestBody Contrat contrat) {
        // Generate idContrat if not provided
        if (contrat.getIdContrat() == null || contrat.getIdContrat().trim().isEmpty()) {
            String generatedId = generateContratId();
            contrat.setIdContrat(generatedId);
        } else if (contratRepository.existsByIdContrat(contrat.getIdContrat())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(contratRepository.save(contrat));
    }

    private String generateContratId() {
        // Generate a unique contract ID
        long count = contratRepository.count() + 1;
        return String.format("CTR-%04d", count);
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> updateContrat(
            @PathVariable Long id,
            @RequestParam(value = "idContrat", required = false) String idContrat,
            @RequestParam(value = "nomPrestataire", required = false) String nomPrestataire,
            @RequestParam(value = "lot", required = false) String lot,
            @RequestParam(value = "ville", required = false) String ville,
            @RequestParam(value = "dateDebut", required = false) String dateDebut,
            @RequestParam(value = "dateFin", required = false) String dateFin,
            @RequestParam(value = "montant", required = false) Double montant,
            @RequestParam(value = "statut", required = false) String statut,
            @RequestParam(value = "typeContrat", required = false) String typeContrat,
            @RequestParam(value = "itemIds", required = false) List<Long> itemIds,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Optional<Contrat> contratOpt = contratRepository.findById(id);
        if (contratOpt.isPresent()) {
            Contrat contrat = contratOpt.get();
            try {
                if (idContrat != null) contrat.setIdContrat(idContrat);
                if (nomPrestataire != null) contrat.setNomPrestataire(nomPrestataire);
                if (lot != null) contrat.setLot(lot);
                if (ville != null) contrat.setVille(ville);
                if (dateDebut != null) contrat.setDateDebut(LocalDate.parse(dateDebut));
                if (dateFin != null) contrat.setDateFin(LocalDate.parse(dateFin));
                if (montant != null) contrat.setMontant(montant);
                if (statut != null) contrat.setStatut(StatutContrat.valueOf(statut));
                if (typeContrat != null) contrat.setTypeContrat(typeContrat);

                // Handle file upload
                if (file != null && !file.isEmpty()) {
                    List<String> filePaths = fileUploadService.uploadFiles(new MultipartFile[]{file}, "contrats");
                    if (!filePaths.isEmpty()) {
                        contrat.setFichierContrat(filePaths.get(0));
                    }
                }

                // Handle items
                if (itemIds != null && !itemIds.isEmpty()) {
                    Set<Item> items = itemIds.stream()
                        .map(itemId -> itemRepository.findById(itemId).orElse(null))
                        .filter(item -> item != null)
                        .collect(Collectors.toSet());
                    contrat.setItems(items);
                }

                Contrat savedContrat = contratRepository.save(contrat);
                log.info("Contrat mis à jour avec succès: {}", id);
                return ResponseEntity.ok(savedContrat);

            } catch (Exception e) {
                log.error("Erreur lors de la mise à jour du contrat {}: ", id, e);
                return ResponseEntity.internalServerError().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping(value = "/{id}", consumes = "application/json")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> updateContratJson(@PathVariable Long id, @Valid @RequestBody Contrat contratDetails) {
        return contratRepository.findById(id)
            .map(contrat -> {
                contrat.setDateDebut(contratDetails.getDateDebut());
                contrat.setDateFin(contratDetails.getDateFin());
                contrat.setNomPrestataire(contratDetails.getNomPrestataire());
                contrat.setMontant(contratDetails.getMontant());
                return ResponseEntity.ok(contratRepository.save(contrat));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> deleteContrat(@PathVariable Long id) {
        return contratRepository.findById(id)
            .map(contrat -> {
                contratRepository.delete(contrat);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/prestataire/{prestataireId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or (hasRole('PRESTATAIRE') and #prestataireId == authentication.principal.id)")
    public List<Contrat> getContratsByPrestataire(@PathVariable String prestataireId) {
        return contratRepository.findByPrestataireId(prestataireId);
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Contrat> updateContratStatut(@PathVariable Long id, @RequestBody String statutStr) {
        try {
            log.info("Tentative de mise à jour du statut du contrat {} vers {}", id, statutStr);
            StatutContrat statut = StatutContrat.valueOf(statutStr);
            return contratRepository.findById(id)
                .map(contrat -> {
                    contrat.setStatut(statut);
                    Contrat savedContrat = contratRepository.save(contrat);
                    log.info("Statut du contrat {} mis à jour avec succès", id);
                    return ResponseEntity.ok(savedContrat);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du statut du contrat {}: ", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

package com.dgsi.maintenance.controller;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.StructureMefp;
import com.dgsi.maintenance.service.StructureMefpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/structures-mefp")
public class StructureMefpController {

    private static final Logger logger = Logger.getLogger(StructureMefpController.class.getName());

    @Autowired
    private StructureMefpService structureMefpService;

    @GetMapping
    @PreAuthorize("#profile != 'production' or isAuthenticated()")
    public List<StructureMefp> getAllStructures() {
        logger.info("GET /api/structures-mefp - Fetching all structures");
        List<StructureMefp> structures = structureMefpService.getAllStructures();
        logger.info("Returning " + structures.size() + " structures");
        return structures;
    }

    @GetMapping("/paginated")
    @PreAuthorize("#profile != 'production' or isAuthenticated()")
    public ResponseEntity<Page<StructureMefp>> getAllStructuresPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        logger.info("GET /api/structures-mefp/paginated - Fetching structures with pagination (page: " + page + ", size: " + size + ")");
        Pageable pageable = PageRequest.of(page, size);
        Page<StructureMefp> structures = structureMefpService.getAllStructuresPaginated(pageable);
        logger.info("Returning " + structures.getNumberOfElements() + " structures (page " + page + " of " + structures.getTotalPages() + ")");
        return ResponseEntity.ok(structures);
    }

    @GetMapping("/{id}")
    @PreAuthorize("#profile != 'production' or isAuthenticated()")
    public ResponseEntity<StructureMefp> getStructureById(@PathVariable String id) {
        logger.info("GET /api/structures-mefp/" + id + " - Fetching structure by ID");
        Optional<StructureMefp> structure = structureMefpService.getStructureById(id);
        if (structure.isPresent()) {
            logger.info("Structure found and returned for ID: " + id);
            return ResponseEntity.ok(structure.get());
        } else {
            logger.warning("Structure not found for ID: " + id);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("#profile != 'production' or hasRole('ROLE_ADMINISTRATEUR')")
    public StructureMefp createStructure(@RequestBody StructureMefp structure) {
        logger.info("POST /api/structures-mefp - Creating new structure: " + structure.getNom());
        StructureMefp createdStructure = structureMefpService.createStructure(structure);
        logger.info("Structure created successfully with ID: " + createdStructure.getId());
        return createdStructure;
    }

    @PutMapping("/{id}")
    @PreAuthorize("#profile != 'production' or hasRole('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<StructureMefp> updateStructure(@PathVariable String id, @RequestBody StructureMefp structureDetails) {
        logger.info("PUT /api/structures-mefp/" + id + " - Updating structure");
        Optional<StructureMefp> updatedStructure = structureMefpService.updateStructure(id, structureDetails);
        if (updatedStructure.isPresent()) {
            logger.info("Structure updated successfully for ID: " + id);
            return ResponseEntity.ok(updatedStructure.get());
        } else {
            logger.warning("Structure not found for update with ID: " + id);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("#profile != 'production' or hasRole('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteStructure(@PathVariable String id) {
        logger.info("DELETE /api/structures-mefp/" + id + " - Deleting structure");
        boolean deleted = structureMefpService.deleteStructure(id);
        if (deleted) {
            logger.info("Structure deleted successfully for ID: " + id);
            return ResponseEntity.noContent().build();
        } else {
            logger.warning("Structure not found for deletion with ID: " + id);
            return ResponseEntity.notFound().build();
        }
    }
}
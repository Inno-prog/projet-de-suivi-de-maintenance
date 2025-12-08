package com.dgsi.maintenance.service;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import com.dgsi.maintenance.entity.StructureMefp;
import com.dgsi.maintenance.repository.StructureMefpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class StructureMefpService {

    private static final Logger logger = Logger.getLogger(StructureMefpService.class.getName());

    @Autowired
    private StructureMefpRepository structureMefpRepository;

    public List<StructureMefp> getAllStructures() {
        logger.info("Fetching all structures from database");
        List<StructureMefp> structures = structureMefpRepository.findAll();
        logger.info("Found " + structures.size() + " structures in database");
        return structures;
    }

    public Page<StructureMefp> getAllStructuresPaginated(Pageable pageable) {
        logger.info("Fetching structures from database with pagination: " + pageable);
        Page<StructureMefp> structures = structureMefpRepository.findAll(pageable);
        logger.info("Found " + structures.getNumberOfElements() + " structures (page " + pageable.getPageNumber() + " of " + structures.getTotalPages() + ")");
        return structures;
    }

    public Optional<StructureMefp> getStructureById(String id) {
        logger.info("Fetching structure by ID: " + id);
        Optional<StructureMefp> structure = structureMefpRepository.findById(id);
        if (structure.isPresent()) {
            logger.info("Structure found: " + structure.get().getNom());
        } else {
            logger.warning("Structure not found with ID: " + id);
        }
        return structure;
    }

    public StructureMefp createStructure(StructureMefp structure) {
        logger.info("Creating new structure: " + structure.getNom());
        StructureMefp savedStructure = structureMefpRepository.save(structure);
        logger.info("Structure created successfully with ID: " + savedStructure.getId());
        return savedStructure;
    }

    public Optional<StructureMefp> updateStructure(String id, StructureMefp structureDetails) {
        logger.info("Updating structure with ID: " + id);
        return structureMefpRepository.findById(id)
            .map(structure -> {
                logger.info("Found existing structure: " + structure.getNom());
                structure.setNom(structureDetails.getNom());
                structure.setContact(structureDetails.getContact());
                structure.setEmail(structureDetails.getEmail());
                structure.setVille(structureDetails.getVille());
                structure.setAdresseStructure(structureDetails.getAdresseStructure());
                structure.setDescription(structureDetails.getDescription());
                structure.setCategorie(structureDetails.getCategorie());
                // Update CI fields
                structure.setNomCI(structureDetails.getNomCI());
                structure.setPrenomCI(structureDetails.getPrenomCI());
                structure.setContactCI(structureDetails.getContactCI());
                structure.setFonctionCI(structureDetails.getFonctionCI());
                StructureMefp updatedStructure = structureMefpRepository.save(structure);
                logger.info("Structure updated successfully: " + updatedStructure.getNom());
                return updatedStructure;
            });
    }

    public boolean deleteStructure(String id) {
        logger.info("Attempting to delete structure with ID: " + id);
        return structureMefpRepository.findById(id)
            .map(structure -> {
                logger.info("Deleting structure: " + structure.getNom());
                structureMefpRepository.delete(structure);
                logger.info("Structure deleted successfully");
                return true;
            })
            .orElseGet(() -> {
                logger.warning("Structure not found for deletion with ID: " + id);
                return false;
            });
    }

}
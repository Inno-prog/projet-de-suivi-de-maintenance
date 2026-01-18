package com.dgsi.maintenance.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import com.dgsi.maintenance.dto.RegionHierarchyDto;
import com.dgsi.maintenance.dto.RegionHierarchyDto.StructureInfoDto;
import com.dgsi.maintenance.dto.RegionHierarchyDto.VilleHierarchyDto;
import com.dgsi.maintenance.entity.StructureMefp;
import com.dgsi.maintenance.repository.StructureMefpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StructureMefpService {

    private static final Logger logger = Logger.getLogger(StructureMefpService.class.getName());

    @Autowired
    private StructureMefpRepository structureMefpRepository;
    
    @Autowired
    private ReferenceDataService referenceDataService;

    public List<StructureMefp> getAllStructures() {
        logger.info("Fetching all structures from database");
        List<StructureMefp> structures = structureMefpRepository.findAll();
        logger.info("Found " + structures.size() + " structures in database");
        return structures;
    }

    public Page<StructureMefp> getAllStructuresPaginated(Pageable pageable, String sortBy, String sortDirection) {
        logger.info("Fetching structures from database with pagination: " + pageable + ", sortBy: " + sortBy + ", sortDirection: " + sortDirection);

        Sort sort = Sort.by(sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        Pageable pageableWithSort = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<StructureMefp> structures = structureMefpRepository.findAll(pageableWithSort);
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
                structure.setRegion(structureDetails.getRegion());
                structure.setAdresseStructure(structureDetails.getAdresseStructure());
                structure.setDescription(structureDetails.getDescription());
                structure.setCategorie(structureDetails.getCategorie());
                structure.setLot(structureDetails.getLot());
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

    public List<StructureMefp> getStructuresByLotId(Long lotId) {
        logger.info("Fetching structures for lot ID: " + lotId);
        List<StructureMefp> structures = structureMefpRepository.findByLotId(lotId);
        logger.info("Found " + structures.size() + " structures for lot ID: " + lotId);
        return structures;
    }

    public List<StructureMefp> getStructuresByRegion(String region) {
        logger.info("Fetching structures for region: " + region);
        List<StructureMefp> structures = structureMefpRepository.findByRegion(region);
        logger.info("Found " + structures.size() + " structures for region: " + region);
        return structures;
    }

    public List<StructureMefp> getStructuresByVille(String ville) {
        logger.info("Fetching structures for ville: " + ville);
        List<StructureMefp> structures = structureMefpRepository.findByVille(ville);
        logger.info("Found " + structures.size() + " structures for ville: " + ville);
        return structures;
    }

    public List<StructureMefp> getStructuresByRegionAndVille(String region, String ville) {
        logger.info("Fetching structures for region: " + region + " and ville: " + ville);
        List<StructureMefp> structures = structureMefpRepository.findByRegionAndVille(region, ville);
        logger.info("Found " + structures.size() + " structures for region: " + region + " and ville: " + ville);
        return structures;
    }

    /**
     * Get hierarchical structure of MEFP organizations
     * Format: Region -> Ville -> Structures
     * This version includes ALL 17 regions, even those without structures
     */
    public List<RegionHierarchyDto> getHierarchy() {
        logger.info("Building hierarchical structure of MEFP organizations");
        
        List<StructureMefp> structures = structureMefpRepository.findAll();
        logger.info("Found " + structures.size() + " structures to organize hierarchically");
        
        // Group structures by region and then by ville
        Map<String, Map<String, List<StructureMefp>>> regionVilleStructures = new HashMap<>();
        
        for (StructureMefp structure : structures) {
            String region = structure.getRegion();
            String ville = structure.getVille();
            
            // Try to assign region from ville if not set
            if ((region == null || region.isEmpty()) && ville != null && !ville.isEmpty()) {
                region = referenceDataService.assignRegionFromVille(ville);
            }
            
            // Skip structures without region or ville
            if (region == null || region.isEmpty()) {
                region = "Non clasée";
            }
            if (ville == null || ville.isEmpty()) {
                ville = "Non clasée";
            }
            
            regionVilleStructures
                .computeIfAbsent(region, k -> new HashMap<>())
                .computeIfAbsent(ville, k -> new ArrayList<>())
                .add(structure);
        }
        
        // Get all 17 regions from reference data
        List<String> allRegions = referenceDataService.getAllRegions();
        
        // Build hierarchy DTOs with ALL regions
        List<RegionHierarchyDto> hierarchy = new ArrayList<>();
        
        for (String region : allRegions) {
            Map<String, List<StructureMefp>> villesMap = regionVilleStructures.get(region);
            
            if (villesMap == null) {
                // Region has no structures - create empty villes from reference data
                List<VilleHierarchyDto> villes = new ArrayList<>();
                List<String> villesRef = referenceDataService.getVillesByRegion(region);
                for (String ville : villesRef) {
                    villes.add(new VilleHierarchyDto(ville, new ArrayList<>()));
                }
                hierarchy.add(new RegionHierarchyDto(region, villes));
            } else {
                // Get villes from reference data for this region
                List<String> villesRef = referenceDataService.getVillesByRegion(region);
                
                List<VilleHierarchyDto> villes = new ArrayList<>();
                
                // First add villes that have structures (sorted)
                List<String> sortedVillesWithStructures = villesMap.keySet().stream()
                    .sorted()
                    .collect(Collectors.toList());
                
                for (String ville : sortedVillesWithStructures) {
                    List<StructureMefp> structuresList = villesMap.get(ville);
                    
                    List<StructureInfoDto> structureInfos = structuresList.stream()
                        .map(s -> new StructureInfoDto(
                            s.getId(),
                            s.getNom(),
                            s.getCategorie(),
                            s.getContact(),
                            s.getEmail(),
                            s.getAdresseStructure(),
                            s.getDescription()
                        ))
                        .collect(Collectors.toList());
                    
                    villes.add(new VilleHierarchyDto(ville, structureInfos));
                }
                
                // Add remaining villes from reference data that have no structures
                for (String villeRef : villesRef) {
                    if (!villesMap.containsKey(villeRef)) {
                        villes.add(new VilleHierarchyDto(villeRef, new ArrayList<>()));
                    }
                }
                
                // Sort all villes alphabetically
                villes.sort((v1, v2) -> v1.getNom().compareTo(v2.getNom()));
                
                hierarchy.add(new RegionHierarchyDto(region, villes));
            }
        }
        
        logger.info("Built hierarchy with " + hierarchy.size() + " regions");
        return hierarchy;
    }
    
    /**
     * Get complete hierarchy with all regions and their villes (empty or with structures)
     */
    public List<RegionHierarchyDto> getCompleteHierarchy() {
        return getHierarchy();
    }
    
    /**
     * Get all 17 regions from reference data
     */
    public List<String> getAllRegions() {
        return referenceDataService.getAllRegions();
    }
    
    /**
     * Get all villes from reference data
     */
    public List<String> getAllVilles() {
        return referenceDataService.getAllVilles();
    }
    
    /**
     * Get villes for a specific region from reference data
     */
    public List<String> getVillesByRegion(String region) {
        return referenceDataService.getVillesByRegion(region);
    }
    
    /**
     * Create a structure with automatic region assignment from ville
     */
    @Transactional
    public StructureMefp createStructureWithAutoRegion(StructureMefp structure) {
        logger.info("Creating new structure with auto region assignment: " + structure.getNom());
        
        // Automatically assign region from ville if not set
        if ((structure.getRegion() == null || structure.getRegion().isEmpty()) 
            && structure.getVille() != null && !structure.getVille().isEmpty()) {
            String region = referenceDataService.assignRegionFromVille(structure.getVille());
            if (region != null) {
                structure.setRegion(region);
                logger.info("Auto-assigned region: " + region + " for ville: " + structure.getVille());
            }
        }
        
        StructureMefp savedStructure = structureMefpRepository.save(structure);
        logger.info("Structure created successfully with ID: " + savedStructure.getId());
        return savedStructure;
    }
    
    /**
     * Update a structure with automatic region assignment from ville
     */
    @Transactional
    public Optional<StructureMefp> updateStructureWithAutoRegion(String id, StructureMefp structureDetails) {
        logger.info("Updating structure with ID: " + id);
        return structureMefpRepository.findById(id)
            .map(structure -> {
                logger.info("Found existing structure: " + structure.getNom());
                structure.setNom(structureDetails.getNom());
                structure.setContact(structureDetails.getContact());
                structure.setEmail(structureDetails.getEmail());
                structure.setVille(structureDetails.getVille());
                // Automatically assign region from ville if changed or not set
                String newVille = structureDetails.getVille();
                if (newVille != null && !newVille.isEmpty()) {
                    String region = referenceDataService.assignRegionFromVille(newVille);
                    if (region != null) {
                        structure.setRegion(region);
                    }
                }
                structure.setAdresseStructure(structureDetails.getAdresseStructure());
                structure.setDescription(structureDetails.getDescription());
                structure.setCategorie(structureDetails.getCategorie());
                structure.setLot(structureDetails.getLot());
                structure.setNomCI(structureDetails.getNomCI());
                structure.setPrenomCI(structureDetails.getPrenomCI());
                structure.setContactCI(structureDetails.getContactCI());
                structure.setFonctionCI(structureDetails.getFonctionCI());
                StructureMefp updatedStructure = structureMefpRepository.save(structure);
                logger.info("Structure updated successfully: " + updatedStructure.getNom());
                return updatedStructure;
            });
    }
}

package com.dgsi.maintenance.service;

import java.util.List;
import java.util.Optional;
import com.dgsi.maintenance.entity.Equipement;
import com.dgsi.maintenance.entity.Item;
import com.dgsi.maintenance.repository.EquipementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EquipementService {

    @Autowired
    private EquipementRepository equipementRepository;

    /**
     * Calculates the next available equipment number.
     * Reuses numbers that have been deleted to avoid gaps.
     */
    public int getNextAvailableNumero() {
        List<Integer> usedNumeros = equipementRepository.findAllUsedNumeros();
        
        if (usedNumeros.isEmpty()) {
            return 1;
        }
        
        int nextNumero = 1;
        while (usedNumeros.contains(nextNumero)) {
            nextNumero++;
        }
        return nextNumero;
    }

    public List<Equipement> getAllEquipements() {
        return equipementRepository.findAll();
    }

    public Optional<Equipement> getEquipementById(Long id) {
        return equipementRepository.findById(id);
    }

    public List<Equipement> searchEquipementsByName(String nomEquipement) {
        return equipementRepository.findByNomEquipementContainingIgnoreCase(nomEquipement);
    }

    public List<Equipement> getEquipementsByType(String typeEquipement) {
        return equipementRepository.findByMarque(typeEquipement);
    }

    public Equipement createEquipement(Equipement equipement) {
        if (equipement.getNumero() == null) {
            equipement.setNumero(getNextAvailableNumero());
        }
        return equipementRepository.save(equipement);
    }

    public Equipement updateEquipement(Long id, Equipement equipementDetails) {
        return equipementRepository.findById(id)
            .map(equipement -> {
                equipement.setNumero(equipementDetails.getNumero());
                equipement.setNomEquipement(equipementDetails.getNomEquipement());
                equipement.setDescription(equipementDetails.getDescription());
                equipement.setMarque(equipementDetails.getMarque());
                return equipementRepository.save(equipement);
            })
            .orElseThrow(() -> new RuntimeException("Équipement non trouvé avec l'id: " + id));
    }

    public void deleteEquipement(Long id) {
        Optional<Equipement> equipementOpt = equipementRepository.findById(id);
        if (!equipementOpt.isPresent()) {
            throw new RuntimeException("Équipement non trouvé avec l'id: " + id);
        }

        Equipement equipement = equipementOpt.get();

        // Clear relationships before deletion
        equipement.getPrestations().clear();
        
        // Clear the equipment from all items that reference it
        for (Item item : equipement.getItems()) {
            item.getEquipements().remove(equipement);
        }
        equipement.getItems().clear();

        // Save to update relationships
        equipementRepository.save(equipement);

        // Now delete the equipment
        equipementRepository.deleteById(id);
    }
}

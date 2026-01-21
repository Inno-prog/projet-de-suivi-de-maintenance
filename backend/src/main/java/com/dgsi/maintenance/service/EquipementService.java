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
        return equipementRepository.save(equipement);
    }

    public Equipement updateEquipement(Long id, Equipement equipementDetails) {
        return equipementRepository.findById(id)
            .map(equipement -> {
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

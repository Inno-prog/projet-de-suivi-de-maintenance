package com.dgsi.maintenance.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import java.math.BigDecimal;
import java.util.HashSet;
import com.dgsi.maintenance.entity.Prestation;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class PrestationServiceTest {

    @Autowired
    private PrestationService prestationService;

    @Test
    void testCreatePrestationSuccess() {
        Prestation prestation = new Prestation();
        prestation.setNomPrestation("Ordinateur de bureau");
        prestation.setNomPrestataire("Test Prestataire");
        prestation.setContactPrestataire("test@email.com");
        prestation.setStructurePrestataire("Test Structure");
        prestation.setServicePrestataire("Informatique");
        prestation.setRolePrestataire("Technicien");
        prestation.setQualificationPrestataire("BAC+3");
        prestation.setTrimestre("T1");
        prestation.setMontantIntervention(BigDecimal.valueOf(100000));
        prestation.setStatutIntervention("EN_COURS");
        prestation.setDateHeureDebut(java.time.LocalDateTime.now());
        prestation.setDateHeureFin(java.time.LocalDateTime.now().plusHours(2));
        prestation.setNomStructure("Structure Test");
        prestation.setStatutValidation("EN_ATTENTE");

        Prestation result = prestationService.createPrestation(prestation);

        assertNotNull(result.getId());
        assertEquals("Ordinateur de bureau", result.getNomPrestation());
    }
}

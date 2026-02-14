# Réimplémentation de la Logique Régions-Lots

## Étapes à compléter

### Backend

- [x] 1. Modifier `Lot.java` - Ajouter le champ `regions` (List<String>)
- [x] 2. Modifier `LotWithContractorDto.java` - Ajouter le champ `regions` et méthodes associées
- [x] 3. Modifier `LotController.java` - Mettre à jour les méthodes pour gérer les régions
- [x] 4. Modifier `StructureMefpService.java` - Ajouter méthode `getStructuresByRegions()`
- [x] 5. Modifier `StructureMefpController.java` - Ajouter endpoint `/by-lot-regions/{lotId}`

### Frontend

- [x] 6. Modifier `structure-mefp.service.ts` - Ajouter méthode `getStructuresByLotRegions()`
- [x] 7. Modifier `prestation-form.component.ts` - Mettre à jour `loadStructuresByLot()` pour utiliser les régions
- [x] 8. Modifier `lot-manager.component.ts` - Mettre à jour pour gérer les régions au lieu des villes

### Tests

- [ ] 9. Tester la création/modification de lots avec régions
- [ ] 10. Tester le chargement des structures lors de la création de prestation

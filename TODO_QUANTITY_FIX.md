# Plan de correction - Affichage des quantités utilisées

## Problème identifié
Lors de l'affichage des détails des prestations, le système affiche systématiquement "1" comme quantité utilisée au lieu de la vraie quantité.

## Analyse

### 1. Fichiers backend déjà configurés correctement:
- `Prestation.java` - `@JsonIgnore` retiré de `itemsUtilises`
- `PrestationRepository.java` - Charge les items avec `LEFT JOIN FETCH`
- `PrestationService.java` - Sauvegarde les itemQuantities en JSON

### 2. Fichiers frontend à vérifier:
- `prestation-detail.component.ts` - Affiche les détails des prestations
- D'autres composants affichant les quantités

## Étapes de correction

1. Vérifier que les données sont correctement stockées en base
2. Corriger le frontend pour afficher les vraies quantités
3. Tester avec les données Netcom

## Fichiers à modifier
- [ ] frontend/src/app/features/prestations/components/prestation-detail/prestation-detail.component.ts
- [ ] Autres fichiers affichant les quantités

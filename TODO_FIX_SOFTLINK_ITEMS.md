# Plan de correction des bugs - Softlink & Digital Solutions

## Problème 1: Softlink Technologies - Fiches manquantes
- **Symptôme**: Softlink a soumis 2 prestations T1 lot 4, mais seulement 1 fiche visible
- **Cause probable**: La logique de correspondance des lots dans `OrdreCommandeController.getFichesByLot()` ne matchait pas correctement les lots

## Problème 2: Digital Solutions - Items non visibles
- **Symptôme**: Digital Solutions ne voit pas ses items contrairement aux autres prestataires
- **Cause probable**: Les contrats de Digital Solutions ne sont pas correctement liés au prestataire (prestataire_id NULL)

## Corrections implémentées

### 1. Amélioration de la correspondance des lots (OrdreCommandeController)
- ✅ Ajout de méthodes `normalizeLotForComparison()` et `lotsMatch()` pour une correspondance flexible
- ✅ Amélioration de la logique avec 5 stratégies de matching:
  - Stratégie 1: Via contrat lié au prestataire
  - Stratégie 2: Via map prestataire->lot
  - Stratégie 3: Via liste des prestataires du lot
  - Stratégie 4: Heuristique sur le nom du prestataire
  - Stratégie 5: Vérification du trimestre/année
- ✅ Amélioration des logs de débogage

### 2. Amélioration de la liaison contrat-prestataire (ItemController)
- ✅ Ajout de méthodes `normalizeLotName()` et `lotsMatch()` pour une correspondance flexible
- ✅ Amélioration de `getItemsByPrestataire()` avec 4 stratégies de recherche:
  - Stratégie 1: Par prestataire_id
  - Stratégie 2: Par nom_prestataire (exacts et partiels)
  - Stratégie 3: Scan de tous les contrats
  - Stratégie 4: Par email de contact
- ✅ Ajout de logs de débogage détaillés

### 3. Correction automatique des données (SoftlinkDigitalSolutionsFix)
- ✅ Nouveau composant `SoftlinkDigitalSolutionsFix` (Order 16)
- ✅ Liaison automatique des contrats aux prestataires
- ✅ Vérification des lots pour Softlink

## Fichiers modifiés
1. `backend/src/main/java/com/dgsi/maintenance/controller/OrdreCommandeController.java`
2. `backend/src/main/java/com/dgsi/maintenance/controller/ItemController.java`
3. `backend/src/main/java/com/dgsi/maintenance/config/SoftlinkDigitalSolutionsFix.java` (NOUVEAU)

## Fichiers de diagnostic créés
1. `backend/diagnose_softlink_digital.sql` - Requêtes SQL de diagnostic

## Pour tester
1. Redémarrer le backend
2. Vérifier que Softlink voit ses 2 fiches dans lot 4 T1
3. Vérifier que Digital Solutions voit ses items

## Si les problèmes persistent
Exécuter les requêtes SQL dans `backend/diagnose_softlink_digital.sql` pour identifier les problèmes de données.


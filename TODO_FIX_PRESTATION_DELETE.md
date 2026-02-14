# Plan de Correction - Suppression des Prestations

## Problème
Les prestataires et admins ne peuvent pas supprimer les prestations. Les erreurs de contraintes de base de données et les problèmes de type de données empêchent la suppression.

## Fichiers à modifier

### 1. PrestationService.java
- [ ] Améliorer la méthode `deletePrestation()` avec gestion robuste des erreurs
- [ ] Corriger le problème de type (Prestation.id Long -> FichePrestation.idPrestation String)
- [ ] Ajouter une méthode pour supprimer d'abord les fiches associées
- [ ] Améliorer les messages d'erreur pour l'utilisateur

### 2. PrestationController.java
- [ ] Améliorer la gestion des erreurs dans la méthode `deletePrestation()`
- [ ] Ajouter des messages d'erreur plus descriptifs
- [ ] Vérifier les permissions correctement

### 3. PrestationRepository.java
- [ ] Ajouter une méthode pour trouver les fiches associées à une prestation
- [ ] Améliorer les requêtes pour filtrer correctement les prestations supprimées

## Plan d'implémentation

### Étape 1: Correction de PrestationService
1. Corriger la méthode `performPhysicalDelete()` pour gérer le type String/Long
2. Ajouter une méthode `deleteAssociatedFiches()` pour supprimer les fiches avant la prestation
3. Améliorer les messages d'erreur

### Étape 2: Correction de PrestationController
1. Améliorer la gestion des RuntimeException
2. Ajouter des messages d'erreur plus clairs

### Étape 3: Correction de PrestationRepository
1. Ajouter une méthode pour trouver les fiches par idPrestation
2. Améliorer les requêtes de recherche

## Tests à effectuer
- [ ] Suppression d'une prestation par un prestataire (soft delete)
- [ ] Suppression d'une prestation par un admin (physical delete)
- [ ] Vérifier que les fiches associées sont supprimées
- [ ] Vérifier les messages d'erreur


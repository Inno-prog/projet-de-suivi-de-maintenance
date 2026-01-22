# Plan de Correction - Affichage des Items pour les Prestataires

## Problème Identifié
Le système n'affiche pas les items aux prestataires malgré qu'ils ont un contrat sur un lot.
Le problème vient de l'incohérence dans le format des noms de lots:
- Contrat: "3" (juste le numéro)
- Item: "lot3" ou "Lot 3" (avec préfixe)

## Fichiers à Modifier

### 1. Backend - `ItemController.java`
- Améliorer la logique de normalisation des lots
- Ajouter des requêtes SQL plus robustes dans `ItemRepository.java`
- Corriger la méthode `getItemsByPrestataire()`

### 2. Backend - `ItemRepository.java`
- Ajouter des requêtes optimisées pour la correspondance de lots

### 3. Frontend - `item.service.ts`
- Optionnel: Ajouter des logs pour le débogage

## Étapes de Correction

### Étape 1: Corriger ItemRepository.java
Ajouter une nouvelle méthode de requête SQL pour gérer les correspondances de lots:
- `findByLotNormalized()` - gestion flexible des formats de lots

### Étape 2: Corriger ItemController.java  
Améliorer la méthode `getItemsByPrestataire()`:
- Normaliser les lots des contrats (extraire juste le numéro)
- Normaliser les lots des items (retirer le préfixe "lot")
- Faire la correspondance sur les numéros uniquement

### Étape 3: Corriger ContratRepository.java (si nécessaire)
Vérifier et améliorer les méthodes de recherche de contrats par lot

### Étape 4: Ajouter des logs de débogage
Pour faciliter le diagnostic futur des problèmes de correspondance

## Vérification
Après les modifications:
1. Redémarrer le backend
2. Tester avec un prestataire comme "netcomAfrique"
3. Vérifier que les items de son lot s'affichent correctement


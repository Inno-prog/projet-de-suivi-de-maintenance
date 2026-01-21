# Filtrage des Items par Prestataire

## Objectif
Un prestataire doit voir uniquement les items liés à ses contrats (via les lots).

## Plan d'implémentation

### Backend

1. **ItemRepository.java** ✅ FAIT
   - Ajouter une méthode pour trouver les items par liste de lots
   ```java
   List<Item> findByLotIn(List<String> lots);
   List<Item> findByLotNameInIgnoreCase(List<String> lotNames);
   ```

2. **ItemController.java** ✅ FAIT
   - Améliorer `getItemsByPrestataire()` pour mieux gérer la correspondance lot → item
   - Utiliser une requête JPQL plus efficace avec fallback

### Frontend

3. **item.service.ts** ✅ DÉJÀ PRESENT
   - La méthode `getItemsByPrestataire()` existe déjà

4. **item-list.component.ts** ✅ FAIT
   - Injecter `AuthService` pour connaître le rôle de l'utilisateur
   - Modifier `loadItems()` pour appeler:
     - `getAllItems()` si ADMINISTRATEUR
     - `getItemsByPrestataire(id)` si PRESTATAIRE
   - Adapter les lots affichés pour les prestataires

## Tâches

- [x] 1. Ajouter méthode findByLotIn dans ItemRepository
- [x] 2. Améliorer endpoint getItemsByPrestataire dans ItemController
- [x] 3. Modifier ItemListComponent pour filtrer par rôle
- [ ] 4. Tester le comportement pour ADMIN et PRESTATAIRE

## Notes

L'endpoint existant `/api/items/by-prestataire/{prestataireId}` retourne les items dont le lot correspond aux lots des contrats du prestataire.

## Flux de données

1. Prestataire se connecte
2. Frontend vérifie le rôle avec `authService.isPrestataire()`
3. Si prestataire:
   - Appelle `/api/items/by-prestataire/{id}`
   - Le backend récupère les contrats du prestataire
   - Extrait les lots des contrats
   - Filtre les items dont le `lot` correspond
4. Si admin:
   - Appelle `/api/items` pour tous les items

## Débogage

Les logs de débogage sont ajoutés avec le préfixe `[DEBUG]`:
- `[DEBUG] Loading items for prestataire: {id}`
- `[DEBUG] Prestataire items loaded: {count}`
- `[DEBUG] Prestataire {id} has {n} contracts`
- `[DEBUG] Looking for items with lots: {lots}`
- `[DEBUG] Found {n} items matching the lots`


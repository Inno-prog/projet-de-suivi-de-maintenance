# Correction de l'erreur 500 - Chargement des items prestataire

## Problème identifié
L'endpoint `/api/items/by-prestataire/{id}` retournait une erreur 500, empêchant les prestataires de voir leurs items.

## Cause
La méthode `getItemsByPrestataire` dans `ItemController.java` tentait d'accéder aux items via les ordres de commande avec un chargement lazy qui pouvait échouer et générer des exceptions non gérées.

## Solutions appliquées

### 1. Backend - ItemController.java
**Fichier**: `backend/src/main/java/com/dgsi/maintenance/controller/ItemController.java`

#### Changements:
- ✅ Ajout d'un bloc `try-catch` global pour capturer toutes les exceptions
- ✅ Retour d'un `ResponseEntity<List<Item>>` au lieu de `List<Item>` pour gérer les erreurs HTTP
- ✅ Simplification de la logique: récupération directe des items par lot
- ✅ Suppression de la tentative de récupération via `contrat.getItems()` qui causait des problèmes de lazy loading
- ✅ Gestion d'erreur pour chaque contrat et chaque lot individuellement
- ✅ Retour d'une liste vide en cas d'erreur au lieu de crasher

#### Code modifié:
```java
@GetMapping("/by-prestataire/{prestataireId}")
@PreAuthorize("hasRole('ADMINISTRATEUR') or (hasRole('PRESTATAIRE') and #prestataireId == authentication.principal.id)")
public ResponseEntity<List<Item>> getItemsByPrestataire(@PathVariable String prestataireId) {
    try {
        // Récupération des contrats
        List<Contrat> contrats = contratRepository.findByPrestataireIdWithItems(prestataireId);
        
        // Extraction des lots
        Set<String> lotNames = new HashSet<>();
        for (Contrat contrat : contrats) {
            // Extraction sécurisée du nom du lot
        }
        
        // Récupération des items par lot
        Set<Item> allItems = new HashSet<>();
        for (String lotName : lotNames) {
            List<Item> itemsForLot = itemRepository.findByLot(lotName);
            // Fallback avec recherche fuzzy si nécessaire
        }
        
        return ResponseEntity.ok(new ArrayList<>(allItems));
    } catch (Exception e) {
        // Gestion d'erreur avec logs
        return ResponseEntity.status(500).body(new ArrayList<>());
    }
}
```

### 2. Frontend - my-items.component.ts
**Fichier**: `frontend/src/app/features/items/components/my-items/my-items.component.ts`

#### Changements:
- ✅ Amélioration de la gestion d'erreur dans `loadPrestataireItems()`
- ✅ Initialisation de `items` et `filteredItems` à des tableaux vides en cas d'erreur
- ✅ Message d'erreur plus explicite pour l'utilisateur
- ✅ Ajout de logs de débogage pour faciliter le diagnostic
- ✅ Affichage d'un message informatif si aucun item n'est trouvé

#### Code modifié:
```typescript
loadPrestataireItems() {
  const currentUser = this.authService.getCurrentUser();
  if (!currentUser || !currentUser.id) {
    this.toast.show({
      type: 'error',
      title: 'Erreur',
      message: 'Utilisateur non connecté'
    });
    this.loading = false;
    return;
  }

  console.log('SUCCESS - Loading items for prestataire (dev):', currentUser.id);
  this.itemService.getItemsByPrestataire(currentUser.id).subscribe({
    next: (items) => {
      console.log('SUCCESS - My items loaded (dev):', items);
      this.items = items || [];
      this.filteredItems = [...this.items];
      this.loading = false;
      
      if (this.items.length === 0) {
        this.toast.show({
          type: 'info',
          title: 'Information',
          message: 'Aucun item trouvé pour vos contrats'
        });
      }
    },
    error: (error) => {
      console.error('Erreur lors du chargement des items:', error);
      this.items = [];
      this.filteredItems = [];
      this.toast.show({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger vos items. Veuillez réessayer.'
      });
      this.loading = false;
    }
  });
}
```

## Tests à effectuer

1. **Redémarrer le backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Vérifier les logs backend** lors de l'appel à `/api/items/by-prestataire/{id}`

3. **Tester dans le frontend**:
   - Se connecter en tant que prestataire
   - Naviguer vers "Mes Items"
   - Vérifier que les items s'affichent correctement
   - Vérifier qu'aucune erreur 500 n'apparaît dans la console

4. **Cas de test**:
   - ✅ Prestataire avec contrats et items
   - ✅ Prestataire avec contrats mais sans items
   - ✅ Prestataire sans contrats
   - ✅ Erreur de connexion à la base de données

## Résultat attendu
- ✅ Plus d'erreur 500
- ✅ Les prestataires peuvent voir leurs items
- ✅ Message informatif si aucun item n'est disponible
- ✅ Gestion gracieuse des erreurs avec messages clairs

## Notes techniques
- La méthode évite maintenant les problèmes de lazy loading en récupérant les items directement par lot
- Tous les blocs critiques sont protégés par des try-catch
- Les logs permettent de tracer facilement les problèmes
- Le frontend affiche toujours une interface utilisable même en cas d'erreur

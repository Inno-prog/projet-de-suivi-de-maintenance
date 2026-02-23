# Synchronisation des Quantités d'Items

## Problème Corrigé

La synchronisation des quantités d'items avec les prestations existantes ne fonctionnait pas car la relation `itemsUtilises` dans l'entité `Prestation` est en `FetchType.LAZY`. Cela causait un problème de lazy loading où les items n'étaient pas chargés correctement.

## Solution Implémentée

### 1. Repository - PrestationRepository.java

Ajout de deux nouvelles méthodes pour charger les prestations avec leurs items :

```java
@Query("SELECT p FROM Prestation p LEFT JOIN FETCH p.itemsUtilises")
List<Prestation> findAllWithItems();

@Query("SELECT p FROM Prestation p LEFT JOIN FETCH p.itemsUtilises WHERE p.deleted IS NULL OR p.deleted = false")
List<Prestation> findAllActiveWithItems();
```

Ces méthodes utilisent `LEFT JOIN FETCH` pour charger les items en une seule requête SQL, évitant ainsi le problème de lazy loading.

### 2. Service - ContratItemService.java

La méthode `synchroniserQuantitesAvecPrestationsExistantes()` a été mise à jour pour :

- Utiliser `findAllActiveWithItems()` au lieu de `findAll()`
- Ajouter des logs détaillés pour le débogage
- Vérifier que les items sont bien chargés avant de les traiter
- Forcer la sauvegarde avec `itemRepository.flush()`

## Comment Utiliser

### Vérifier les quantités actuelles (lecture seule)

```bash
psql -d maintenance_db -f backend/show_real_item_quantities.sql
```

### Synchroniser les quantités (modification)

```bash
curl -X POST "http://localhost:8080/api/prestations/admin/synchronize-quantities?secret=dev-secret-please-change"
```

### Réponse attendue

```json
{
  "prestationsAnalysees": 150,
  "itemsDistincts": 45,
  "itemsMisAJour": 12,
  "quantitesParItem": {
    "1": 5,
    "2": 3,
    "15": 8
  },
  "timestamp": "2024-01-15T10:30:00",
  "message": "Synchronisation des quantités terminée avec succès"
}
```

## Points de Test

1. **Vérifier que les items sont chargés** : Les logs doivent afficher "📦 Prestation X contient Y items"
2. **Vérifier les quantités calculées** : Les logs doivent afficher les quantités par item
3. **Vérifier la sauvegarde** : Les logs doivent confirmer "💾 X items sauvegardés avec succès"
4. **Vérifier en base** : Exécuter le script SQL pour confirmer que les quantités ont été mises à jour

## Dépannage

Si la synchronisation ne met pas à jour les quantités :

1. Vérifier les logs du backend pour voir si les prestations sont trouvées
2. Vérifier que les prestations ont bien des items associés (champ `itemsUtilises` non vide)
3. Vérifier que les prestations ne sont pas en statut "BROUILLON"
4. Vérifier que les prestations ne sont pas marquées comme supprimées (`deleted = true`)

## Sécurité

- L'endpoint nécessite une clé secrète (`dev-secret-please-change`)
- Seuls les administrateurs devraient avoir accès à cet endpoint
- La synchronisation est une opération de maintenance à exécuter avec précaution

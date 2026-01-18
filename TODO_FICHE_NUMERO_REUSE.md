# Plan: Réutilisation des numéros de fiche supprimés

## Objectif
Lorsqu'une fiche de prestation est supprimée, le prochain numéro de fiche créé doit réutiliser le numéro de la fiche supprimée (au lieu de continuer à incrémenter).

## Modifications effectuées

### ✅ 1. Backend - FichePrestation.java (Entity)
- [x] Ajouter un champ `numeroFiche` (Integer) pour stocker le numéro séquentiel
- [x] Ajouter getter et setter pour `numeroFiche`

### ✅ 2. Backend - FichePrestationRepository.java
- [x] Ajouter méthode `findAllUsedNumeros()` - retourne tous les numéros utilisés
- [x] Ajouter méthode `findMaxNumeroFiche()` - retourne le numéro maximum utilisé
- [x] Ajouter méthode `existsByNumeroFiche(Integer)` - vérifie si un numéro existe

### ✅ 3. Backend - FichePrestationController.java
- [x] Ajouter méthode `getNextAvailableNumero()` - trouve le plus petit numéro non utilisé
- [x] Modifier `createFichePrestation()` pour assigner un numéro à chaque nouvelle fiche
- [x] Ajouter endpoint `/init-numeros` pour initialiser les numéros sur les fiches existantes

### ✅ 4. Base de données - Migration SQL
- [x] Créer le script `add_numero_fiche_column.sql` avec:
  - Ajout de la colonne `numero_fiche`
  - Création de la fonction `get_next_fiche_numero()`
  - Création du trigger pour assigner automatiquement un numéro à la création

## Prochaines étapes (à faire manuellement)

### Étape 1: Exécuter la migration SQL
```bash
# Se connecter à la base de données H2 et exécuter:
# backend/add_numero_fiche_column.sql
```

### Étape 2: Redémarrer le backend
```bash
cd backend && ./mvnw spring-boot:run
# ou utiliser le script de restart
```

### Étape 3: Initialiser les numéros sur les fiches existantes
```bash
# Appeler l'endpoint (avec token admin):
curl -X POST http://localhost:8085/api/fiches-prestation/init-numeros \
  -H "Authorization: Bearer <token_admin>"
```

### Étape 4: Tester
1. Créer une fiche → vérifier qu'elle a un `numeroFiche` (1, 2, 3...)
2. Supprimer cette fiche
3. Créer une nouvelle fiche → vérifier qu'elle réutilise le même numéro (1)
4. Créer plusieurs fiches sans supprimer → les numéros s'incrémentent (1, 2, 3, 4...)
5. Supprimer la fiche 2 → créer une nouvelle → elle prend le numéro 2

## Fichiers modifiés
- `backend/src/main/java/com/dgsi/maintenance/entity/FichePrestation.java`
- `backend/src/main/java/com/dgsi/maintenance/repository/FichePrestationRepository.java`
- `backend/src/main/java/com/dgsi/maintenance/controller/FichePrestationController.java`

## Fichiers créés
- `backend/add_numero_fiche_column.sql` - Script de migration SQL

## Logique de numérotation
```
Nouvelle fiche créée:
1. Récupérer tous les numéros utilisés [1, 2, 4, 5]
2. Trouver le premier numéro manquant → 3
3. Assigner ce numéro à la nouvelle fiche

Quand une fiche est supprimée:
- Son numéro devient disponible
- La prochaine fiche créée réutilisera ce numéro
```

## Exemple de comportement
| Action | Numéros utilisés |
|--------|------------------|
| Créer fiche 1 | [1] |
| Créer fiche 2 | [1, 2] |
| Créer fiche 3 | [1, 2, 3] |
| Supprimer fiche 2 | [1, 3] |
| Créer fiche 4 | [1, 3, 2] → utilise le 2 |
| Supprimer fiche 1 | [3, 2] |
| Créer fiche 5 | [3, 2, 1] → utilise le 1 |


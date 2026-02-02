# TODO - Filtrage des évaluations par prestataire connecté

## Objectif
Lorsque le prestataire clique sur "rapports de suivis", il doit voir uniquement les évaluations qui le concernent.

## Tâches réalisées ✅

### Backend (Java/Spring Boot)

- [x] 1. Modifier `EvaluationTrimestrielleController.java`
  - [x] Implémenter la récupération de l'utilisateur connecté via `SecurityContextHolder`
  - [x] Modifier l'endpoint `/api/evaluations/prestataire` pour filtrer par prestataire
  - [x] Les administrateurs/agents DGSI voient toujours toutes les évaluations

- [x] 2. Modifier `EvaluationService.java`
  - [x] Ajouter la méthode `getPrestataireNomFromUsername()` pour récupérer le nom du prestataire
  - [x] La méthode `getEvaluationsByPrestataireNom()` existe déjà et est utilisée

### Fonctionnement

1. L'utilisateur se connecte avec son compte Keycloak
2. Lorsqu'il accède à "Rapports de suivis", l'endpoint `/api/evaluations/prestataire` est appelé
3. Le controller récupère l'utilisateur connecté via `SecurityContextHolder`
4. Si l'utilisateur est ADMINISTRATEUR ou AGENT_DGSI → toutes les évaluations sont retournées
5. Si l'utilisateur est PRESTATAIRE → les évaluations sont filtrées par `prestataireNom`

## Tests à effectuer
- [ ] Tester avec un compte prestataire (doit voir uniquement ses évaluations)
- [ ] Tester avec un compte admin (doit voir toutes les évaluations)
- [ ] Vérifier que les logs affichent correctement le filtrage

## Fichiers modifiés
- `backend/src/main/java/com/dgsi/maintenance/controller/EvaluationTrimestrielleController.java`
- `backend/src/main/java/com/dgsi/maintenance/service/EvaluationService.java`


# Plan de Correction - Affichage des Détails de Prestation

## Problème Identifié
Lorsque l'utilisateur clique sur "Détails" d'une prestation, la page ne répond pas. Le problème est probablement :
1. L'API endpoint `/api/prestations/{id}` ou `/api/prestations/{id}/dev` ne fonctionne pas correctement
2. L'interceptor d'authentification bloque les requêtes
3. Le format de données ne correspond pas entre le frontend et le backend

## Fichiers à Modifier

### 1. Frontend - PrestationService (`frontend/src/app/core/services/prestation.service.ts`)
- Corriger la méthode `getPrestationById()` si nécessaire
- Ajouter des logs de débogage
- Vérifier que l'endpoint est correct

### 2. Backend - PrestationController (`backend/src/main/java/com/dgsi/maintenance/controller/PrestationController.java`)
- Vérifier que l'endpoint `/{id}/dev` fonctionne correctement
- Ajouter des logs de débogage
- Vérifier les permissions

### 3. Frontend - PrestationDetailComponent (`frontend/src/app/features/prestations/components/prestation-detail/prestation-detail.component.ts`)
- Améliorer la gestion des erreurs
- Ajouter des logs de débogage
- Vérifier que le format des données est correct

## Plan d'Exécution

### Étape 1: Activer le mode bypass auth dans l'environnement
Activer `devAuthBypass: true` pour éviter les problèmes d'authentification.

### Étape 2: Vérifier et corriger le service
S'assurer que l'endpoint `/api/prestations/{id}/dev` est appelé correctement.

### Étape 3: Améliorer la gestion des erreurs dans le composant
Ajouter une meilleure gestion des erreurs pour éviter que la page ne réponde plus.

### Étape 4: Tester manuellement
Vérifier que les détails s'affichent correctement.

## Problème Possible - "Modal" vs "Page"
L'utilisateur mentionne "le modal" mais le composant actuel charge une **page complète** à la place d'une modale. Si une modale est attendue, il faudra modifier l'approche :
- Soit créer un composant modal
- Soit utiliser Angular Material Dialog pour afficher les détails

## Statut
- [ ] Étape 1: Activer devAuthBypass
- [ ] Étape 2: Vérifier/corriger le service
- [ ] Étape 3: Améliorer la gestion des erreurs
- [ ] Étape 4: Tester manuellement


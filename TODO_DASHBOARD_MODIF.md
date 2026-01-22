# TODO - Modification Dashboard Admin

## Objectif
Supprimer les cartes de statistiques (argent, utilisateurs, clients, ventes) et garder uniquement les 5 cartes d'actions rapides.

## Tâches

### 1. Modifier le fichier TypeScript
- [ ] Supprimer le tableau `dashboardMetrics` contenant les statistiques
- [ ] Supprimer la méthode `getChangeClass()` utilisée uniquement pour les statistiques

### 2. Modifier le fichier HTML
- [ ] Supprimer la section `<div class="dashboard-metrics-grid">` qui affiche les cartes de statistiques
- [ ] Garder la section `<section class="quick-actions">` avec les 5 cartes d'actions rapides

### 3. Vérification
- [ ] Compiler le projet pour vérifier qu'il n'y a pas d'erreurs
- [ ] Tester l'affichage du dashboard admin

## Fichiers à modifier
- `frontend/src/app/features/dashboard/components/dashboard/dashboard.component.ts`
- `frontend/src/app/features/dashboard/components/dashboard/dashboard.component.html`


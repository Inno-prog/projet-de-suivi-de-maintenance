# Plan : Implémentation de la Navigation par Étapes pour les Structures du MEFP

## Objectif
Remplacer la vue hiérarchique actuelle (accordeons) par une navigation par étapes avec des cartes :
- Étape 1 : Afficher les 17 régions comme cartes
- Étape 2 : Afficher les villes de la région sélectionnée comme cartes
- Étape 3 : Afficher les structures de la ville sélectionnée avec un bouton de création

## Fichiers à Modifier

### 1. Frontend - Composant Principal
**Fichier:** `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.ts`
- Ajouter un état de navigation (`currentStep`: 'regions' | 'villes' | 'structures')
- Ajouter `selectedRegion` et `selectedVille` pour suivre la sélection
- Ajouter des méthodes pour la navigation (`goToVilles`, `goToStructures`, `goBack`)
- Modifier `ngOnInit` pour charger les régions

### 2. Frontend - Template
**Fichier:** `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.html`
- Remplacer les accordeons par une vue par étapes
- Créer une section "Cartes de régions" (étape 1)
- Créer une section "Cartes de villes" (étape 2)
- Créer une section "Structures" avec bouton de création (étape 3)
- Ajouter un fil d'Ariane pour la navigation

### 3. Frontend - Styles
**Fichier:** `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.css`
- Créer des styles pour les cartes de régions et villes
- Ajouter des animations de transition entre les étapes
- Styles pour le bouton de création de structure

### 4. Frontend - Service
**Fichier:** `frontend/src/app/core/services/structure-mefp.service.ts`
- Ajouter une méthode `getStructuresByRegionAndVille(region, ville)` (existe déjà)
- S'assurer que `getVillesByRegion(region)` fonctionne correctement

### 5. Backend (déjà existant, vérifier)
- `StructureMefpController` : endpoint `/regions/{region}/villes` existe
- `StructureMefpController` : endpoint `/by-region/{region}/ville/{ville}` existe
- `ReferenceDataService` : contient les 17 régions et leurs villes

## Détails d'Implémentation

### État du Composant
```typescript
interface ViewState {
  step: 'regions' | 'villes' | 'structures';
  selectedRegion?: string;
  selectedVille?: string;
}
```

### Vue Étape 1 : Cartes de Régions
- Afficher les 17 régions dans une grille de cartes
- Chaque carte affiche : nom de la région, nombre de villes, nombre de structures
- Lien visuel vers la carte : icône de région, fond colorisé

### Vue Étape 2 : Cartes de Villes
- Titre avec breadcrumb : "MEF > [Région] > Villes"
- Bouton "Retour" vers les régions
- Afficher les villes de la région sélectionnée comme cartes
- Chaque carte affiche : nom de la ville, nombre de structures
- Animation de transition au clic

### Vue Étape 3 : Structures de la Ville
- Titre avec breadcrumb : "MEF > [Région] > [Ville] > Structures"
- Bouton "Retour" vers les villes
- Bouton "Créer une structure" pour cette ville
- Grille des structures existantes (si existantes)
- Message si aucune structure

### Fonctionnalité de Création
- Bouton "Ajouter une structure" ouvre un formulaire modal
- Le formulaire pré-remplit automatiquement la région et la ville
- Après création, rafraîchir la liste des structures

## Ordre de Priorité

1. **Priorité Haute** - Modification du composant TypeScript
2. **Priorité Haute** - Réécriture du template HTML
3. **Priorité Haute** - Styles CSS pour les cartes
4. **Priorité Moyenne** - Intégration du bouton de création
5. **Priorité Basse** - Animations et transitions

## Tests à Effectuer

1. Navigation régions → villes → structures
2. Bouton retour fonctionne correctement
3. Compteurs corrects (nombre de villes/structures)
4. Création d'une nouvelle structure
5. Affichage des structures après création
6. Responsive design sur mobile

## Fichiers à Ne Pas Modifier
- Sidebar (pas de changement nécessaire dans la sidebar)
- Routes (les routes existantes restent valides)
- Backend (aucun changement requis)


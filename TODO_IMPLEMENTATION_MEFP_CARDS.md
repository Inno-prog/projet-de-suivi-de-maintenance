# Suivi des Tâches : Navigation par Cartes pour Structures MEFP

## État d'Avancement
- [x] Plan créé
- [ ] 1. Modifier le composant TypeScript (structures-mefp.component.ts)
- [ ] 2. Réécrire le template HTML
- [ ] 3. Ajouter les styles CSS pour les cartes
- [ ] 4. Tester l'implémentation

## Tâche 1 : Modifier le Composant TypeScript
**Fichier:** `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.ts`

### Changements requis:
- [ ] Ajouter `currentStep: 'regions' | 'villes' | 'structures'` au lieu de l'héritage hiérarchique
- [ ] Ajouter `selectedRegion` et `selectedVille`
- [ ] Ajouter méthode `goToVilles(region)`
- [ ] Ajouter méthode `goToStructures(ville)`
- [ ] Ajouter méthode `goBack()`
- [ ] Charger les 17 régions au lieu de la hiérarchie complète
- [ ] Charger les villes lors de la sélection d'une région
- [ ] Charger les structures lors de la sélection d'une ville

### Code à ajouter:
```typescript
// État de navigation
currentStep: 'regions' | 'villes' | 'structures' = 'regions';
selectedRegion: string = '';
selectedVille: string = '';
villesList: string[] = [];
structuresList: StructureInfo[] = [];

// Méthodes de navigation
goToVilles(region: string): void {
  this.selectedRegion = region;
  this.currentStep = 'villes';
  this.loadVillesForRegion(region);
}

goToStructures(ville: string): void {
  this.selectedVille = ville;
  this.currentStep = 'structures';
  this.loadStructuresForVille(ville);
}

goBack(): void {
  if (this.currentStep === 'structures') {
    this.currentStep = 'villes';
    this.selectedVille = '';
    this.structuresList = [];
  } else if (this.currentStep === 'villes') {
    this.currentStep = 'regions';
    this.selectedRegion = '';
    this.villesList = [];
  }
}
```

## Tâche 2 : Réécrire le Template HTML
**Fichier:** `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.html`

### Structure du template:
```html
<!-- Breadcrumb -->
<nav class="breadcrumb">...</nav>

<!-- Étape 1: Cartes des Régions -->
<div *ngIf="currentStep === 'regions'" class="regions-grid">
  <div *ngFor="let region of hierarchy" class="region-card" (click)="goToVilles(region.nom)">
    <!-- Contenu de la carte région -->
  </div>
</div>

<!-- Étape 2: Cartes des Villes -->
<div *ngIf="currentStep === 'villes'" class="villes-grid">
  <div *ngFor="let ville of villesList" class="ville-card" (click)="goToStructures(ville)">
    <!-- Contenu de la carte ville -->
  </div>
</div>

<!-- Étape 3: Structures -->
<div *ngIf="currentStep === 'structures'" class="structures-section">
  <button class="create-btn">➕ Créer une structure</button>
  <div class="structures-grid">
    <!-- Liste des structures -->
  </div>
</div>
```

## Tâche 3 : Ajouter les Styles CSS
**Fichier:** `frontend/src/app/features/structures-mefp/components/structures-mefp/structures-mefp.component.css`

### Styles requis:
- [ ] `.region-card` - Style pour les cartes de régions
- [ ] `.ville-card` - Style pour les cartes de villes
- [ ] `.structures-grid` - Grille pour les structures
- [ ] `.create-btn` - Bouton de création
- [ ] Animations de transition entre les étapes

## Tâche 4 : Tests
- [ ] Navigation régions → villes → structures
- [ ] Bouton retour
- [ ] Affichage des compteurs
- [ ] Responsive design


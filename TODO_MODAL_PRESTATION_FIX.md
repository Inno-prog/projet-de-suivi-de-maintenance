# Plan de Correction - Modale Détails Prestation

## Problème
L'utilisateur clique sur "Détails" mais la page ne répond pas. L'utilisateur attend une **modale** mais l'application navigue vers une page complète.

## Solution
Implémenter une vraie modale Angular Material Dialog pour afficher les détails de la prestation.

## Fichiers à Modifier

### 1. PrestationDetailComponent
- Modifier pour fonctionner comme un composant de dialog
- Ajouter MatDialogModule et les imports nécessaires
- Adapter le template pour l'affichage en modal

### 2. PrestationCardComponent
- Changer `onDetailsClick()` pour ouvrir un dialog au lieu d'émettre un événement
- Injecter MatDialog
- Ouvrir PrestationDetailComponent dans un dialog

### 3. PrestationListComponent (optionnel)
- Retirer la navigation vers `/prestations/:id` si on utilise uniquement le dialog
- Ou garder les deux options (dialog + page pour partage d'URL)

## Étapes d'implémentation

### Étape 1: Adapter PrestationDetailComponent pour dialog
```typescript
// Imports à ajouter
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Dans le constructor, injecter les données du dialog
constructor(
  private dialogRef: MatDialogRef<PrestationDetailComponent>,
  @Inject(MAT_DIALOG_DATA) public data: { id: number }
) {}

// ngOnInit utilise data.id au lieu de route.snapshot.paramMap.get('id')

// goBack() ferme le dialog au lieu de naviguer
goBack(): void {
  this.dialogRef.close();
}
```

### Étape 2: Modifier PrestationCardComponent pour utiliser dialog
```typescript
// Imports à ajouter
import { MatDialog } from '@angular/material/dialog';
import { PrestationDetailComponent } from '../../../features/prestations/components/prestation-detail/prestation-detail.component';

// Dans le constructor
constructor(
  // ... autres injections
  private dialog: MatDialog
) {}

onDetailsClick(): void {
  if (!this.prestationId) return;

  const dialogRef = this.dialog.open(PrestationDetailComponent, {
    width: '90vw',
    maxWidth: '1200px',
    maxHeight: '90vh',
    panelClass: 'prestation-detail-dialog',
    data: { id: parseInt(this.prestationId, 10) }
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('Dialog closed with result:', result);
  });
}
```

### Étape 3: Ajouter les styles CSS pour le dialog
```css
/* Dans le styles.css global ou component */
.prestation-detail-dialog {
  max-width: 90vw !important;
  width: 1200px !important;
}

.prestation-detail-dialog .mat-mdc-dialog-container {
  max-height: 90vh !important;
}
```

## Statut
- [ ] Étape 1: Adapter PrestationDetailComponent pour dialog
- [ ] Étape 2: Modifier PrestationCardComponent pour ouvrir le dialog
- [ ] Étape 3: Ajouter les styles CSS
- [ ] Étape 4: Tester manuellement


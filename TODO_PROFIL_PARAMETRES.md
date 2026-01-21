# TODO: Correction Profil et Paramètres

## Objectif
Restaurer l'affichage du profil et des paramètres pour que les détails s'affichent immédiatement en bas de la section profil, permettant à l'utilisateur de voir et modifier les infos.

## Comportement
- Cliquer sur la section profil fait dérouler le menu dropdown
- Les détails du profil s'affichent dans le dropdown
- Un bouton "Modifier" permet d'éditer le profil
- Un bouton "Gérer les paramètres" permet d'éditer les paramètres
- Cliquer n'importe où sur la page ferme le dropdown

## Étapes

### 1. Modifier layout.component.ts
- [x] Ajouter états `isEditingProfile` et `isEditingSettings`
- [x] Ajouter méthodes pour basculer entre affichage/édition
- [x] Ajouter méthode `onLayoutClick()` pour fermer le menu au clic sur la page
- [x] Mettre à jour `onDocumentClick()` pour fermer aussi les formulaires d'édition
- [x] Ajouter les styles CSS pour l'affichage inline et le dropdown

### 2. Modifier layout.component.html
- [x] Refondre la section profil avec un dropdown qui se déroule
- [x] Afficher les détails du profil dans le dropdown
- [x] Ajouter le bouton "Modifier" pour le profil
- [x] Ajouter le bouton "Gérer les paramètres" pour les paramètres
- [x] Ajouter les formulaires d'édition inline
- [x] Ajouter `(click)="onLayoutClick()"` sur le main-content

### 3. Vérifier et tester
- [x] Tester le déroulement du menu au clic sur le profil
- [x] Tester la fermeture du menu au clic sur la page
- [x] Tester la modification et sauvegarde du profil
- [x] Tester les paramètres

## Fichiers modifiés
- `/frontend/src/app/shared/components/layout/layout.component.ts`
- `/frontend/src/app/shared/components/layout/layout.component.html`



